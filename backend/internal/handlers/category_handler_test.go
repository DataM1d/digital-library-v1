package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DataM1d/digital-library/internal/models"
	"github.com/gin-gonic/gin"
)

type MockCategoryService struct {
	OnCreate func(ctx context.Context, name, role string) (*models.Category, error)
	OnGet    func(ctx context.Context) ([]models.Category, error)
	OnDelete func(ctx context.Context, id int, role string) error
}

func (m *MockCategoryService) CreateCategory(ctx context.Context, n, r string) (*models.Category, error) {
	return m.OnCreate(ctx, n, r)
}
func (m *MockCategoryService) GetCategories(ctx context.Context) ([]models.Category, error) {
	return m.OnGet(ctx)
}
func (m *MockCategoryService) DeleteCategory(ctx context.Context, id int, r string) error {
	return m.OnDelete(ctx, id, r)
}

func TestCategoryHandler_CreateCategory(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("Admin creates category successfully", func(t *testing.T) {
		mockService := &MockCategoryService{
			OnCreate: func(ctx context.Context, name, role string) (*models.Category, error) {
				if role != "admin" {
					return nil, errors.New("unauthorized")
				}
				return &models.Category{ID: 1, Name: name, Slug: "history"}, nil
			},
		}

		h := NewCategoryHandler(mockService)
		r := gin.Default()

		// Simulate Middleware setting the role
		r.POST("/categories", func(c *gin.Context) {
			c.Set("role", "admin")
			h.CreateCategory(c)
		})

		body, _ := json.Marshal(map[string]string{"name": "History"})
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/categories", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")

		r.ServeHTTP(w, req)

		if w.Code != http.StatusCreated {
			t.Errorf("Expected 201, got %d", w.Code)
		}
	})

	t.Run("Missing name returns 400", func(t *testing.T) {
		h := NewCategoryHandler(&MockCategoryService{})
		r := gin.Default()
		r.POST("/categories", h.CreateCategory)

		body, _ := json.Marshal(map[string]string{"invalid": "data"})
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/categories", bytes.NewBuffer(body))

		r.ServeHTTP(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected 400, got %d", w.Code)
		}
	})
}

func TestCategoryHandler_DeleteCategory(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("Delete returns 200 on success", func(t *testing.T) {
		mockService := &MockCategoryService{
			OnDelete: func(ctx context.Context, id int, role string) error {
				return nil
			},
		}

		h := NewCategoryHandler(mockService)
		r := gin.Default()
		r.DELETE("/categories/:id", h.DeleteCategory)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("DELETE", "/categories/10", nil)

		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d", w.Code)
		}
	})
}
