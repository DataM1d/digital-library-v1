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

func (h *PostHandler) CreatePost(c *gin.Context) {
	ctx := c.Request.Context()
	role := c.GetString("role")
	userID := c.GetInt("user_id")

	file, header, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Image file is required"})
		return
	}
	defer file.Close()

	url, localPath, err := h.imageService.Save(file, header.Filename)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	categoryID, _ := strconv.Atoi(c.PostForm("category_id"))
	tagNames := c.PostFormArray("tags")

	metaDescription := c.PostForm("meta_description")
	ogImage := c.PostForm("og_image")
	altText := c.PostForm("alt_text")

	var altTextPtr *string
	if altText != "" {
		altTextPtr = &altText
	}

	var metaDescPointer *string
	if metaDescription != "" {
		metaDescPointer = &metaDescription
	}
	
	var ogImagePointer *string	
	if ogImage != "" {
		ogImagePointer = &ogImage
	}

	post := models.Post{
		Title:           c.PostForm("title"),
		Content:         c.PostForm("content"),
		CategoryID:      categoryID,
		ImageURL:        url,
		BlurHash:        "processing",
		Status:          c.DefaultPostForm("status", "published"),
		AltText:         altTextPtr,
		MetaDescription: metaDescPointer,
		OGImage:         ogImagePointer,
		CreatedBy:       userID,
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

	tagNames := c.PostFormArray("tags")

	post := *existingPost //starting with existing post so everything is preserved

	post.LastModifiedBy = userID//update last modified by regardless of other changes

	if title := c.PostForm("title"); title != "" {
		post.Title = title
	}

	if content := c.PostForm("content"); content != "" {
		post.Content = content
	}

	if category := c.PostForm("category_id"); category != "" {
		categoryID, err := strconv.Atoi(category)
		if err == nil {
			post.CategoryID = categoryID
		}
	}

	if status := c.PostForm("status"); status != "" {
		post.Status = status
	}

	if altText := c.PostForm("alt_text"); altText != "" {
		post.AltText = &altText
	}

	if metaDescription := c.PostForm("meta_description"); metaDescription != "" {
		post.MetaDescription = &metaDescription
	}

	if ogImage := c.PostForm("og_image"); ogImage != "" {
		post.OGImage = &ogImage
	}

	file, header, err := c.Request.FormFile("image")
	if err == nil {
		defer file.Close()

		url, localPath, saveErr := h.imageService.Save(file, header.Filename)
		if saveErr == nil {
			oldImage := post.ImageURL

			post.ImageURL = url
			post.BlurHash = "processing"

			go h.postService.UpdateBlurHashAsync(localPath, post.ID)

			if oldImage != "" {
				_ = os.Remove(filepath.Join(".", oldImage))
			}
		}
	}

	if post.Status == "" {
		post.Status = "published"
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
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid post ID"})
		return
	}

	userID := c.GetInt("user_id")

	post, err := h.postService.GetAuthInfoByID(ctx, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	if post.ImageURL != "" {
		_ = os.Remove(filepath.Join(".", post.ImageURL))
	}

	if err := h.postService.DeletePost(ctx, post.ID, role, userID); err != nil {
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