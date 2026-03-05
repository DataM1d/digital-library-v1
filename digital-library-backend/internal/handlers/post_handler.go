package handlers

import (
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

	"github.com/DataM1d/digital-library/internal/models"
	"github.com/DataM1d/digital-library/internal/service"
	"github.com/bbrks/go-blurhash"
	"github.com/gin-gonic/gin"
)

type PostHandler struct {
	postService *service.PostService
}

func NewPostHandler(s *service.PostService) *PostHandler {
	return &PostHandler{postService: s}
}

func (h *PostHandler) UploadImage(c *gin.Context) {
	file, handler, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid form key"})
		return
	}
	defer file.Close()

	fileName := fmt.Sprintf("%d-%s", time.Now().Unix(), handler.Filename)
	path := filepath.Join("uploads", fileName)

	dst, err := os.Create(path)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	file.Seek(0, 0)
	img, _, err := image.Decode(file)
	var hash string
	if err == nil {
		hash, _ = blurhash.Encode(4, 3, img)
	}

	c.JSON(http.StatusOK, gin.H{
		"url":      "/uploads/" + fileName,
		"blurhash": hash,
	})
}

func (h *PostHandler) CreatePost(c *gin.Context) {
	role := c.GetString("role")
	userID := c.GetInt("user_id")

	var post models.Post
	if err := c.ShouldBindJSON(&post); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	err := h.postService.CreateLibraryEntry(&post, role, userID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, post)
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
	id, _ := strconv.Atoi(c.Param("id"))

	var post models.Post
	if err := c.ShouldBindJSON(&post); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	post.ID = id

	err := h.postService.UpdatePost(&post, role, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Post updated successfully"})
}

func (h *PostHandler) DeletePost(c *gin.Context) {
	role := c.GetString("role")
	if role != "admin" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	id, _ := strconv.Atoi(c.Param("id"))
	err := h.postService.DeletePost(id, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Deleted successfully"})
}

func (h *PostHandler) ToggleLike(c *gin.Context) {
	userID := c.GetInt("user_id")
	postID, _ := strconv.Atoi(c.Param("id"))

	liked, err := h.postService.ToggleLike(userID, postID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	msg := "Post unliked"
	if liked {
		msg = "Post liked"
	}

	c.JSON(http.StatusOK, gin.H{
		"message": msg,
		"liked":   liked,
	})
}

func (h *PostHandler) GetBySlug(c *gin.Context) {
	slug := c.Param("slug")
	post, err := h.postService.GetPostBySlug(slug)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}
	c.JSON(http.StatusOK, post)
}

func (h *PostHandler) GetMyLikedPosts(c *gin.Context) {
	userID := c.GetInt("user_id")
	posts, err := h.postService.GetLikedPosts(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not fetch liked posts"})
		return
	}
	c.JSON(http.StatusOK, posts)
}
