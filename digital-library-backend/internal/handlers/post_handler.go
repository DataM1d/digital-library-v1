package handlers

import (
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/DataM1d/digital-library/internal/models"
	"github.com/DataM1d/digital-library/internal/service"
	"github.com/bbrks/go-blurhash"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PostHandler struct {
	postService *service.PostService
}

func NewPostHandler(s *service.PostService) *PostHandler {
	return &PostHandler{postService: s}
}

func (h *PostHandler) CreatePost(c *gin.Context) {
	role := c.GetString("role")
	userID := c.GetInt("user_id")

	const maxFileSize = 10 << 20
	if err := c.Request.ParseMultipartForm(maxFileSize); err != nil {
		c.JSON(http.StatusRequestEntityTooLarge, gin.H{"error": "Payload too large"})
		return
	}

	file, header, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Image is required"})
		return
	}
	defer file.Close()

	buff := make([]byte, 512)
	file.Read(buff)
	file.Seek(0, 0)
	contentType := http.DetectContentType(buff)
	allowedTypes := map[string]bool{"image/jpeg": true, "image/png": true, "image/webp": true}

	if !allowedTypes[contentType] {
		c.JSON(http.StatusUnsupportedMediaType, gin.H{"error": "Invalid image format"})
		return
	}

	ext := filepath.Ext(header.Filename)
	fileName := fmt.Sprintf("%d-%s%s", time.Now().Unix(), uuid.New().String(), ext)
	uploadDir := "./uploads"
	path := filepath.Join(uploadDir, fileName)

	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create directory"})
		return
	}

	dst, err := os.Create(path)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal file error"})
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Save failed"})
		return
	}

	categoryID, _ := strconv.Atoi(c.PostForm("category_id"))
	post := models.Post{
		Title:      c.PostForm("title"),
		Content:    c.PostForm("content"),
		CategoryID: categoryID,
		ImageURL:   "/uploads/" + fileName,
		BlurHash:   "processing",
		Status:     c.DefaultPostForm("status", "published"),
		AltText:    c.PostForm("alt_text"),
		Tags:       c.Request.MultipartForm.Value["tags"],
		CreatedBy:  userID,
	}

	if err = h.postService.CreateLibraryEntry(&post, role, userID); err != nil {
		os.Remove(path)
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	go h.generateBlurHashInBackground(path, post.ID)

	c.JSON(http.StatusCreated, post)
}

func (h *PostHandler) UpdatePost(c *gin.Context) {
	role := c.GetString("role")
	userID := c.GetInt("user_id")
	slug := c.Param("slug")

	existingPost, err := h.postService.GetPostBySlug(slug)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artifact not found"})
		return
	}

	categoryID, _ := strconv.Atoi(c.PostForm("category_id"))
	post := models.Post{
		ID:             existingPost.ID,
		Title:          c.PostForm("title"),
		Content:        c.PostForm("content"),
		CategoryID:     categoryID,
		Status:         c.PostForm("status"),
		AltText:        c.PostForm("alt_text"),
		LastModifiedBy: userID,
		Tags:           c.Request.MultipartForm.Value["tags"],
		ImageURL:       existingPost.ImageURL,
	}

	file, header, err := c.Request.FormFile("image")
	if err == nil {
		defer file.Close()
		ext := filepath.Ext(header.Filename)
		newFileName := fmt.Sprintf("%d-%s%s", time.Now().Unix(), uuid.New().String(), ext)
		newPath := filepath.Join("./uploads", newFileName)

		dst, _ := os.Create(newPath)
		io.Copy(dst, file)
		dst.Close()

		post.ImageURL = "/uploads/" + newFileName
		go h.generateBlurHashInBackground(newPath, post.ID)

		oldFilePath := filepath.Join(".", existingPost.ImageURL)
		os.Remove(oldFilePath)
	}

	if err := h.postService.UpdatePost(&post, role, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, post)
}

func (h *PostHandler) generateBlurHashInBackground(filePath string, postID int) {
	file, err := os.Open(filePath)
	if err != nil {
		return
	}
	defer file.Close()

	img, _, err := image.Decode(file)
	if err != nil {
		return
	}

	hash, err := blurhash.Encode(4, 3, img)
	if err != nil {
		return
	}

	_ = h.postService.UpdateBlurHash(postID, hash)
}

func (h *PostHandler) GetPosts(c *gin.Context) {
	search := c.Query("search")
	category := c.Query("category")
	tags := c.QueryArray("tags")
	role := c.GetString("role")

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	posts, total, err := h.postService.GetAllPosts(category, search, tags, page, limit, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch posts"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": posts,
		"meta": gin.H{
			"current_page": page,
			"limit":        limit,
			"total_items":  total,
			"total_pages":  (total + limit - 1) / limit,
		},
	})
}

func (h *PostHandler) GetBySlug(c *gin.Context) {
	slug := c.Param("slug")
	post, err := h.postService.GetPostBySlug(slug)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artifact not found"})
		return
	}
	c.JSON(http.StatusOK, post)
}

func (h *PostHandler) DeletePost(c *gin.Context) {
	role := c.GetString("role")
	param := c.Param("id")
	id, err := strconv.Atoi(param)

	if err != nil {
		post, err := h.postService.GetPostBySlug(param)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
			return
		}
		id = post.ID
	}

	if err := h.postService.DeletePost(id, role); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Artifact removed"})
}

func (h *PostHandler) ToggleLike(c *gin.Context) {
	userID := c.GetInt("user_id")
	postID, _ := strconv.Atoi(c.Param("id"))

	liked, err := h.postService.ToggleLike(userID, postID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid operation"})
		return
	}

	msg := "Post unliked"
	if liked {
		msg = "Post liked"
	}

	c.JSON(http.StatusOK, gin.H{"message": msg, "liked": liked})
}

func (h *PostHandler) GetMyLikedPosts(c *gin.Context) {
	userID := c.GetInt("user_id")
	posts, err := h.postService.GetLikedPosts(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch liked collection"})
		return
	}
	c.JSON(http.StatusOK, posts)
}
