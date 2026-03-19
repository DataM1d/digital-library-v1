package handlers

import (
	"net/http"
	"strconv"

	"github.com/DataM1d/digital-library/internal/domain"
	"github.com/gin-gonic/gin"
)

type CommentHandler struct {
	commentService domain.CommentService
}

func NewCommentHandler(s domain.CommentService) *CommentHandler {
	return &CommentHandler{commentService: s}
}

func (h *CommentHandler) GetByPost(c *gin.Context) {
	ctx := c.Request.Context()

	param := c.Param("id")
	postID, err := strconv.Atoi(param)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Numeric Post ID required for comments"})
		return
	}

	comments, err := h.commentService.GetCommentsByPost(ctx, postID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Comments not found for this artifact"})
		return
	}

	c.JSON(http.StatusOK, comments)
}

func (h *CommentHandler) Create(c *gin.Context) {
	ctx := c.Request.Context()

	postID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Post ID"})
		return
	}

	userID := c.GetInt("user_id")
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Session expired or invalid"})
		return
	}

	var input struct {
		Content  string `json:"content" binding:"required"`
		ParentID *int   `json:"parent_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Comment content is required"})
		return
	}

	comment, err := h.commentService.AddComment(ctx, postID, userID, input.Content, input.ParentID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, comment)
}
