package handlers

import (
	"net/http"
	"strconv"

	"github.com/DataM1d/digital-library/internal/domain"
	"github.com/gin-gonic/gin"
)

type CategoryHandler struct {
	categoryService domain.CategoryService
}

func NewCategoryHandler(s domain.CategoryService) *CategoryHandler {
	return &CategoryHandler{categoryService: s}
}

func (h *CategoryHandler) CreateCategory(c *gin.Context) {
	ctx := c.Request.Context()
	role := c.GetString("role")

	var input struct {
		Name string `json:"name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Category name is required"})
		return
	}

	cat, err := h.categoryService.CreateCategory(ctx, input.Name, role)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, cat)
}

func (h *CategoryHandler) GetCategories(c *gin.Context) {
	ctx := c.Request.Context()

	cats, err := h.categoryService.GetCategories(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Taxonomy retrieval failed"})
		return
	}
	c.JSON(http.StatusOK, cats)
}

func (h *CategoryHandler) DeleteCategory(c *gin.Context) {
	ctx := c.Request.Context()
	role := c.GetString("role")

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category ID"})
		return
	}

	if err := h.categoryService.DeleteCategory(ctx, id, role); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Category removed"})
}
