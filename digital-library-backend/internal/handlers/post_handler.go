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

	const maxFileSize = 5 << 20
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxFileSize+(1<<10))

	if err := c.Request.ParseMultipartForm(maxFileSize); err != nil {
		c.JSON(http.StatusRequestEntityTooLarge, gin.H{"error": "File too large (Max 5MB)"})
		return
	}

	file, header, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Image field is required"})
		return
	}
	defer file.Close()

	buff := make([]byte, 512)
	if _, err := file.Read(buff); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read file header"})
		return
	}
	file.Seek(0, 0)

	contentType := http.DetectContentType(buff)
	allowedTypes := map[string]bool{
		"image/jpeg": true,
		"image/png":  true,
		"image/webp": true,
	}

	if !allowedTypes[contentType] {
		c.JSON(http.StatusUnsupportedMediaType, gin.H{"error": "Only JPEG, PNG, and WEBP are allowed"})
		return
	}

	ext := filepath.Ext(header.Filename)
	fileName := fmt.Sprintf("%d-%s%s", time.Now().Unix(), uuid.New().String(), ext)
	path := filepath.Join("uploads", fileName)

	if _, err := os.Stat("uploads"); os.IsNotExist(err) {
		os.Mkdir("uploads", os.ModePerm)
	}

	dst, err := os.Create(path)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create file"})
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	categoryID, _ := strconv.Atoi(c.Request.FormValue("category_id"))
	post := models.Post{
		Title:      c.Request.FormValue("title"),
		Content:    c.Request.FormValue("content"),
		CategoryID: categoryID,
		ImageURL:   "/uploads/" + fileName,
		BlurHash:   "processing",
		Status:     c.DefaultPostForm("status", "published"),
		AltText:    c.Request.FormValue("alt_text"),
	}

	if err = h.postService.CreateLibraryEntry(&post, role, userID); err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	go h.generateBlurHashInBackground(path, post.ID)

	c.JSON(http.StatusCreated, post)
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

func (h *PostHandler) UpdatePost(c *gin.Context) {
	role := c.GetString("role")
	userID := c.GetInt("user_id")

	slug := c.Param("slug")
	existingPost, err := h.postService.GetPostBySlug(slug)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	categoryID, _ := strconv.Atoi(c.PostForm("category_id"))
	post := models.Post{
		ID:             existingPost.ID,
		Title:          c.PostForm("title"),
		Content:        c.PostForm("content"),
		CategoryID:     categoryID,
		Status:         c.PostForm("status"),
		LastModifiedBy: userID,
		Tags:           c.PostFormArray("tags"),
		ImageURL:       existingPost.ImageURL,
	}

	file, header, err := c.Request.FormFile("image")
	if err == nil {
		defer file.Close()

		ext := filepath.Ext(header.Filename)
		Filename := fmt.Sprintf("%d-%s%s", time.Now().Unix(), uuid.New().String(), ext)
		path := filepath.Join("uploads", Filename)

		dst, _ := os.Create(path)
		io.Copy(dst, file)
		dst.Close()

		post.ImageURL = "/iploads/" + Filename
		go h.generateBlurHashInBackground(path, post.ID)

		oldPath := filepath.Join(".", existingPost.ImageURL)
		os.Remove(oldPath)
	}

	if err := h.postService.UpdatePost(&post, role, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post updated successfully"})
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

	c.JSON(http.StatusOK, gin.H{"message": "Artifact successfully removed from disk and database"})
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

func (h *PostHandler) GetBySlug(c *gin.Context) {
	slug := c.Param("slug")
	post, err := h.postService.GetPostBySlug(slug)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artifact not found"})
		return
	}
	c.JSON(http.StatusOK, post)
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
