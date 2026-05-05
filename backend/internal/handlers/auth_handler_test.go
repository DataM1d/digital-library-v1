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

type MockUserService struct {
	OnRegister func(ctx context.Context, username, email, password string) (*models.User, error)
	OnLogin    func(ctx context.Context, email, password string) (string, *models.User, error)
	OnGetByID  func(ctx context.Context, id int) (*models.User, error)
}

func (m *MockUserService) Register(ctx context.Context, u, e, p string) (*models.User, error) {
	return m.OnRegister(ctx, u, e, p)
}

func (m *MockUserService) Login(ctx context.Context, e, p string) (string, *models.User, error) {
	return m.OnLogin(ctx, e, p)
}

func (m *MockUserService) GetByID(ctx context.Context, id int) (*models.User, error) {
	return m.OnGetByID(ctx, id)
}

func TestAuthHandler_Register(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("Successful Registration", func(t *testing.T) {
		mockService := &MockUserService{
			OnRegister: func(ctx context.Context, u, e, p string) (*models.User, error) {
				return &models.User{ID: 1, Username: u, Email: e}, nil
			},
		}

		h := NewAuthHandler(mockService)
		r := gin.Default()
		r.POST("/register", h.Register)

		input := map[string]string{
			"username": "testuser",
			"email":    "test@example.com",
			"password": "password123",
		}
		body, _ := json.Marshal(input)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/register", bytes.NewBuffer(body))
		req.Header.Set("Content Type", "application/json")

		r.ServeHTTP(w, req)

		if w.Code != http.StatusCreated {
			t.Errorf("Expected status 201, got %d", w.Code)
		}
	})

	t.Run("Invalid Email Return 400", func(t *testing.T) {
		h := NewAuthHandler(&MockUserService{})
		r := gin.Default()
		r.POST("/register", h.Register)

		input := map[string]string{
			"username": "testuser",
			"email":    "not-an-email",
			"password": "password123",
		}
		body, _ := json.Marshal(input)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/register", bytes.NewBuffer(body))
		r.ServeHTTP(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected status 400 for bad email, got %d", w.Code)
		}
	})
}

func TestAuthHandler_Login(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("Unauthorized on Service Error", func(t *testing.T) {
		mockService := &MockUserService{
			OnLogin: func(ctx context.Context, e, p string) (string, *models.User, error) {
				return "", nil, errors.New("invalid credentials")
			},
		}

		h := NewAuthHandler(mockService)
		r := gin.Default()
		r.POST("/login", h.Login)

		input := map[string]string{"email": "test@test.com", "password": "wrong"}
		body, _ := json.Marshal(input)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")

		r.ServeHTTP(w, req)

		if w.Code != http.StatusUnauthorized {
			t.Errorf("Expected 401, got %d", w.Code)
		}
	})
}
