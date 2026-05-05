package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DataM1d/digital-library/internal/models"
	"github.com/gin-gonic/gin"
)

type MockCommentService struct {
	OnGetByPost func(ctx context.Context, postID int) ([]models.Comment, error)
	OnAdd       func(ctx context.Context, postID, userID int, content string, parentID *int) (*models.Comment, error)
}

func (m *MockCommentService) GetCommentsByPost(ctx context.Context, postID int) ([]models.Comment, error) {
	return m.OnGetByPost(ctx, postID)
}
func (m *MockCommentService) AddComment(ctx context.Context, pID, uID int, c string, parID *int) (*models.Comment, error) {
	return m.OnAdd(ctx, pID, uID, c, parID)
}

func TestCommentHandler_GetByPost(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("Returns 400 for non-numeric ID", func(t *testing.T) {
		h := NewCommentHandler(&MockCommentService{})
		r := gin.Default()
		r.GET("/posts/:id/comments", h.GetByPost)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/posts/abc/comments", nil)
		r.ServeHTTP(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected 400 for string ID, got %d", w.Code)
		}
	})

	t.Run("Returns 200 and comments on success", func(t *testing.T) {
		mockService := &MockCommentService{
			OnGetByPost: func(ctx context.Context, postID int) ([]models.Comment, error) {
				return []models.Comment{{ID: 1, Content: "Great artifact!"}}, nil
			},
		}
		h := NewCommentHandler(mockService)
		r := gin.Default()
		r.GET("/posts/:id/comments", h.GetByPost)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/posts/100/comments", nil)
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d", w.Code)
		}
	})
}

func TestCommentHandler_Create(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("Unauthorized if user_id is missing from context", func(t *testing.T) {
		h := NewCommentHandler(&MockCommentService{})
		r := gin.Default()
		r.POST("/posts/:id/comments", h.Create)

		body, _ := json.Marshal(map[string]string{"content": "Nice!"})
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/posts/1/comments", bytes.NewBuffer(body))

		r.ServeHTTP(w, req)

		if w.Code != http.StatusUnauthorized {
			t.Errorf("Expected 401, got %d", w.Code)
		}
	})

	t.Run("Successful comment creation", func(t *testing.T) {
		mockService := &MockCommentService{
			OnAdd: func(ctx context.Context, pID, uID int, c string, parID *int) (*models.Comment, error) {
				return &models.Comment{ID: 5, Content: c, PostID: pID, UserID: uID}, nil
			},
		}

		h := NewCommentHandler(mockService)
		r := gin.Default()
		r.POST("/posts/:id/comments", func(c *gin.Context) {
			c.Set("user_id", 42) // Simulate AuthMiddleware
			h.Create(c)
		})

		body, _ := json.Marshal(map[string]string{"content": "Sweden is beautiful"})
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/posts/1/comments", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")

		r.ServeHTTP(w, req)

		if w.Code != http.StatusCreated {
			t.Errorf("Expected 201, got %d", w.Code)
		}
	})
}
