package handlers

import (
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/DataM1d/digital-library/internal/domain"
	"github.com/DataM1d/digital-library/internal/models"
	"github.com/gin-gonic/gin"
)

type PostHandler struct {
	postService  domain.PostService
	imageService domain.ImageService
}

func NewPostHandler(ps domain.PostService, is domain.ImageService) *PostHandler {
	return &PostHandler{
		postService:  ps,
		imageService: is,
	}
}

func stringPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
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

	url, localPath, err := h.imageService.SaveUploadedFile(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	categoryID, _ := strconv.Atoi(c.PostForm("category_id"))
	tagNames := c.PostFormArray("tags")

	altText := c.PostForm("alt_text")
	var altTextPtr *string
	if altText != "" {
		altTextPtr = &altText
	}

	post := models.Post{
		Title:      c.PostForm("title"),
		Content:    c.PostForm("content"),
		CategoryID: categoryID,
		ImageURL:   url,
		BlurHash:   "processing",
		Status:     c.DefaultPostForm("status", "published"),
		AltText:    altTextPtr,
		CreatedBy:  userID,
	}

	if err = h.postService.CreateLibraryEntry(ctx, &post, tagNames, role, userID); err != nil {
		_ = os.Remove(localPath)
		c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		return
	}

	go h.postService.UpdateBlurHashAsync(localPath, post.ID)
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
	tagNames := c.PostFormArray("tags")

	altText := c.PostForm("alt_text")
	var altTextPtr *string
	if altText != "" {
		altTextPtr = &altText
	}

	post := models.Post{
		ID:             existingPost.ID,
		Title:          c.PostForm("title"),
		Content:        c.PostForm("content"),
		CategoryID:     categoryID,
		Status:         c.PostForm("status"),
		AltText:        altTextPtr,
		LastModifiedBy: userID,
		ImageURL:       existingPost.ImageURL,
		BlurHash:       existingPost.BlurHash,
	}

	if _, _, err := c.Request.FormFile("image"); err == nil {
		url, localPath, saveErr := h.imageService.SaveUploadedFile(c)
		if saveErr == nil {
			post.ImageURL = url
			go h.postService.UpdateBlurHashAsync(localPath, post.ID)

			if existingPost.ImageURL != "" {
				_ = os.Remove(filepath.Join(".", existingPost.ImageURL))
			}
		}
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

	c.JSON(http.StatusOK, gin.H{"data": posts, "meta": meta})
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

	post, err := h.postService.GetPostBySlug(ctx, param, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	if post.ImageURL != "" {
		_ = os.Remove(filepath.Join(".", post.ImageURL))
	}

	if err := h.postService.DeletePost(ctx, post.ID, role); err != nil {
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


