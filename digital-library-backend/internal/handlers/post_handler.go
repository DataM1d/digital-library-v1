package handlers

import (
	"context"
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

	"github.com/DataM1d/digital-library/internal/domain"
	"github.com/DataM1d/digital-library/internal/models"
	"github.com/bbrks/go-blurhash"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PostHandler struct {
	postService domain.PostService
}

func NewPostHandler(s domain.PostService) *PostHandler {
	return &PostHandler{postService: s}
}

func (h *PostHandler) saveUploadedFile(c *gin.Context) (string, string, error) {
	file, header, err := c.Request.FormFile("image")
	if err != nil {
		return "", "", err
	}
	defer file.Close()

	buff := make([]byte, 512)
	file.Read(buff)
	file.Seek(0, 0)
	contentType := http.DetectContentType(buff)
	allowedTypes := map[string]bool{"image/jpeg": true, "image/png": true, "image/webp": true}

	if !allowedTypes[contentType] {
		return "", "", fmt.Errorf("invalid image format: %s", contentType)
	}

	ext := filepath.Ext(header.Filename)
	fileName := fmt.Sprintf("%d-%s%s", time.Now().Unix(), uuid.New().String(), ext)
	uploadDir := "./uploads"
	path := filepath.Join(uploadDir, fileName)

	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return "", "", err
	}

	dst, err := os.Create(path)
	if err != nil {
		return "", "", err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return "", "", err
	}

	return "/uploads/" + fileName, path, nil
}

func (h *PostHandler) CreatePost(c *gin.Context) {
	ctx := c.Request.Context()
	role := c.GetString("role")
	userID := c.GetInt("user_id")

	const maxFileSize = 10 << 20
	if err := c.Request.ParseMultipartForm(maxFileSize); err != nil {
		c.JSON(http.StatusRequestEntityTooLarge, gin.H{"error": "Payload too large"})
		return
	}

	url, localPath, err := h.saveUploadedFile(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	categoryID, _ := strconv.Atoi(c.PostForm("category_id"))
	tagNames := c.Request.MultipartForm.Value["tags"]

	post := models.Post{
		Title:      c.PostForm("title"),
		Content:    c.PostForm("content"),
		CategoryID: categoryID,
		ImageURL:   url,
		BlurHash:   "processing",
		Status:     c.DefaultPostForm("status", "published"),
		AltText:    c.PostForm("alt_text"),
		CreatedBy:  userID,
	}

	if err = h.postService.CreateLibraryEntry(ctx, &post, tagNames, role, userID); err != nil {
		os.Remove(localPath)
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	go h.generateBlurHashInBackground(localPath, post.ID)
	c.JSON(http.StatusCreated, post)
}

func (h *PostHandler) UpdatePost(c *gin.Context) {
	ctx := c.Request.Context()
	role := c.GetString("role")
	userID := c.GetInt("user_id")
	slug := c.Param("slug")

	existingPost, err := h.postService.GetPostBySlug(ctx, slug, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artifact not found"})
		return
	}

	categoryID, _ := strconv.Atoi(c.PostForm("category_id"))
	tagNames := c.Request.MultipartForm.Value["tags"]

	post := models.Post{
		ID:             existingPost.ID,
		Title:          c.PostForm("title"),
		Content:        c.PostForm("content"),
		CategoryID:     categoryID,
		Status:         c.PostForm("status"),
		AltText:        c.PostForm("alt_text"),
		LastModifiedBy: userID,
		ImageURL:       existingPost.ImageURL,
	}

	url, localPath, err := h.saveUploadedFile(c)
	if err == nil {
		post.ImageURL = url
		go h.generateBlurHashInBackground(localPath, post.ID)
		oldFilePath := filepath.Join(".", existingPost.ImageURL)
		os.Remove(oldFilePath)
	}

	if err := h.postService.UpdatePost(ctx, &post, tagNames, role, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, post)
}

func (h *PostHandler) GetPosts(c *gin.Context) {
	ctx := c.Request.Context()
	search := c.Query("search")
	category := c.Query("category")
	tags := c.QueryArray("tags")
	role := c.GetString("role")
	userID := c.GetInt("user_id")

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "12"))

	posts, meta, err := h.postService.GetAllPosts(ctx, category, search, tags, page, limit, role, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": posts,
		"meta": meta,
	})
}

func (h *PostHandler) GetBySlug(c *gin.Context) {
	ctx := c.Request.Context()
	slug := c.Param("slug")
	userID := c.GetInt("user_id")
	post, err := h.postService.GetPostBySlug(ctx, slug, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Artifact not found"})
		return
	}
	c.JSON(http.StatusOK, post)
}

func (h *PostHandler) DeletePost(c *gin.Context) {
	ctx := c.Request.Context()
	role := c.GetString("role")
	param := c.Param("id")
	userID := c.GetInt("user_id")

	id, err := strconv.Atoi(param)
	if err != nil {
		post, err := h.postService.GetPostBySlug(ctx, param, userID)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
			return
		}
		id = post.ID
	}

	if err := h.postService.DeletePost(ctx, id, role); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Artifact removed"})
}

func (h *PostHandler) ToggleLike(c *gin.Context) {
	ctx := c.Request.Context()
	userID := c.GetInt("user_id")
	postID, _ := strconv.Atoi(c.Param("id"))

	liked, err := h.postService.ToggleLike(ctx, userID, postID)
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
	ctx := c.Request.Context()
	userID := c.GetInt("user_id")
	posts, err := h.postService.GetLikedPosts(ctx, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch liked collection"})
		return
	}
	c.JSON(http.StatusOK, posts)
}

func (h *PostHandler) generateBlurHashInBackground(filePath string, postID int) {
	bgCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second) // Background tasks get a fresh context because the request context dies when the response is sent
	defer cancel()

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

	_ = h.postService.UpdateBlurHash(bgCtx, postID, hash)
}
