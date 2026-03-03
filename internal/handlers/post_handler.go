package handlers

import (
	"encoding/json"
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/DataM1d/digital-library/internal/middleware"
	"github.com/DataM1d/digital-library/internal/models"
	"github.com/DataM1d/digital-library/internal/service"
	"github.com/DataM1d/digital-library/pkg/utils"
	"github.com/bbrks/go-blurhash"
	"github.com/go-chi/chi/v5"
)

type PostHandler struct {
	postService *service.PostService
}

func NewPostHandler(s *service.PostService) *PostHandler {
	return &PostHandler{postService: s}
}

func (h *PostHandler) UploadImage(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(5 << 20); err != nil {
		utils.JSONError(w, "File too large (Max 5MB)", http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("image")
	if err != nil {
		utils.JSONError(w, "Invalid form key", http.StatusBadRequest)
		return
	}
	defer file.Close()

	buff := make([]byte, 512)
	if _, err := file.Read(buff); err != nil {
		utils.JSONError(w, "Could not verify file", http.StatusInternalServerError)
		return
	}

	fileType := http.DetectContentType(buff)
	if fileType != "image/jpeg" && fileType != "image/png" && fileType != "image/webp" {
		utils.JSONError(w, "Invalid file type. Only JPEG, PNG, and WEBP allowed.", http.StatusBadRequest)
		return
	}

	file.Seek(0, 0)

	fileName := fmt.Sprintf("%d-%s", time.Now().Unix(), handler.Filename)
	path := filepath.Join("uploads", fileName)

	dst, err := os.Create(path)
	if err != nil {
		utils.JSONError(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		utils.JSONError(w, "Failed to save file", http.StatusInternalServerError)
		return
	}

	file.Seek(0, 0)
	img, _, err := image.Decode(file)
	var hash string
	if err == nil {
		hash, _ = blurhash.Encode(4, 3, img)
	}

	utils.JSONResponse(w, http.StatusOK, map[string]string{
		"url":      "/uploads/" + fileName,
		"blurhash": hash,
	})
}

func (h *PostHandler) CreatePost(w http.ResponseWriter, r *http.Request) {
	role, ok := r.Context().Value(middleware.RoleKey).(string)
	userID, userOK := r.Context().Value(middleware.UserIDKey).(int)

	if !ok || !userOK {
		utils.JSONError(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var post models.Post
	if err := json.NewDecoder(r.Body).Decode(&post); err != nil {
		utils.JSONError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err := h.postService.CreateLibraryEntry(&post, role, userID)
	if err != nil {
		utils.JSONError(w, err.Error(), http.StatusForbidden)
		return
	}

	utils.JSONResponse(w, http.StatusCreated, post)
}

func (h *PostHandler) GetPosts(w http.ResponseWriter, r *http.Request) {
	search := r.URL.Query().Get("search")
	category := r.URL.Query().Get("category")
	tags := r.URL.Query()["tags"]
	role, _ := r.Context().Value(middleware.RoleKey).(string)

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page < 1 {
		page = 1
	}
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit < 1 || limit > 100 {
		limit = 10
	}

	posts, total, err := h.postService.GetAllPosts(category, search, tags, page, limit, role)
	if err != nil {
		utils.JSONError(w, "Could not fetch posts", http.StatusInternalServerError)
		return
	}

	utils.JSONResponse(w, http.StatusOK, map[string]interface{}{
		"data": posts,
		"meta": map[string]interface{}{
			"current_page": page,
			"limit":        limit,
			"total_items":  total,
			"total_pages":  (total + limit - 1) / limit,
		},
	})
}

func (h *PostHandler) UpdatePost(w http.ResponseWriter, r *http.Request) {
	role, ok := r.Context().Value(middleware.RoleKey).(string)
	userID, userOK := r.Context().Value(middleware.UserIDKey).(int)
	if !ok || !userOK {
		utils.JSONError(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		utils.JSONError(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var post models.Post
	if err := json.NewDecoder(r.Body).Decode(&post); err != nil {
		utils.JSONError(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	post.ID = id

	err = h.postService.UpdatePost(&post, role, userID)
	if err != nil {
		utils.JSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	utils.JSONResponse(w, http.StatusOK, map[string]string{"message": "Post updated successfully"})
}

func (h *PostHandler) DeletePost(w http.ResponseWriter, r *http.Request) {
	role, ok := r.Context().Value(middleware.RoleKey).(string)
	if !ok || role != "admin" {
		utils.JSONError(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id, _ := strconv.Atoi(chi.URLParam(r, "id"))
	err := h.postService.DeletePost(id, role)
	if err != nil {
		utils.JSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	utils.JSONResponse(w, http.StatusOK, map[string]string{"message": "Deleted successfully"})
}

func (h *PostHandler) ToggleLike(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(int)
	if !ok {
		utils.JSONError(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	postID, _ := strconv.Atoi(chi.URLParam(r, "id"))
	liked, err := h.postService.ToggleLike(userID, postID)
	if err != nil {
		utils.JSONError(w, "Invalid post ID", http.StatusBadRequest)
		return
	}

	msg := "Post unliked"
	if liked {
		msg = "Post liked"
	}

	utils.JSONResponse(w, http.StatusOK, map[string]interface{}{
		"message": msg,
		"liked":   liked,
	})
}

func (h *PostHandler) GetBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	post, err := h.postService.GetPostBySlug(slug)
	if err != nil {
		utils.JSONError(w, "Post not found", http.StatusNotFound)
		return
	}
	utils.JSONResponse(w, http.StatusOK, post)
}

func (h *PostHandler) GetMyLikedPosts(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(int)
	if !ok {
		utils.JSONError(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	posts, err := h.postService.GetLikedPosts(userID)
	if err != nil {
		utils.JSONError(w, "Could not fetch liked posts", http.StatusInternalServerError)
		return
	}
	utils.JSONResponse(w, http.StatusOK, posts)
}
