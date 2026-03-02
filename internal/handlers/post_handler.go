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
		hash, err = blurhash.Encode(4, 3, img)
		if err != nil {
			hash = ""
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
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

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(post)
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

	posts, err := h.postService.GetAllPosts(category, search, tags, page, limit, role)
	if err != nil {
		utils.JSONError(w, "Could not fetch posts", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Post updated successfully"})
}

func (h *PostHandler) DeletePost(w http.ResponseWriter, r *http.Request) {
	role, ok := r.Context().Value(middleware.RoleKey).(string)
	if !ok {
		utils.JSONError(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		utils.JSONError(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	err = h.postService.DeletePost(id, role)
	if err != nil {
		utils.JSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Post deleted"})
}

func (h *PostHandler) ToggleLike(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(int)
	if !ok {
		utils.JSONError(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	postIDStr := chi.URLParam(r, "id")
	postID, err := strconv.Atoi(postIDStr)
	if err != nil {
		utils.JSONError(w, "Invalid post ID", http.StatusBadRequest)
		return
	}

	liked, err := h.postService.ToggleLike(userID, postID)
	if err != nil {
		utils.JSONError(w, "Database error", http.StatusInternalServerError)
		return
	}

	msg := "Post unliked"
	if liked {
		msg = "Post liked"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": msg})
}

func (h *PostHandler) GetBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")

	post, err := h.postService.GetPostBySlug(slug)
	if err != nil {
		utils.JSONError(w, "Post not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(post)
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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}
