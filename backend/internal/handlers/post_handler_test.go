package handlers

import (
	"bytes"
	"context"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DataM1d/digital-library/internal/models"
	"github.com/gin-gonic/gin"
)

type MockPostService struct {
	OnCreate               func(ctx context.Context, p *models.Post, tags []string, role string, userID int) error
	OnGetBySlug            func(ctx context.Context, slug string, userID int) (*models.Post, error)
	OnGetAll               func(ctx context.Context, cat, search string, tags []string, page, limit int, role string, userID int) ([]models.Post, *models.PaginationMeta, error)
	OnUpdate               func(ctx context.Context, p *models.Post, tags []string, role string, userID int) error
	OnDelete               func(ctx context.Context, id int, role string) error
	OnToggleLike           func(ctx context.Context, uID, pID int) (bool, error)
	OnGetLiked             func(ctx context.Context, uID int) ([]models.Post, error)
	OnUpdateHash           func(ctx context.Context, id int, hash string) error
	OnUpdateBlurHashAsync  func(localPath string, postID int)
	OnCleanupOrphanedFiles func(ctx context.Context) (int, error)
}

type MockImageService struct {
	OnSaveUploadedFile func(c *gin.Context) (string, string, error)
}

func (m *MockImageService) SaveUploadedFile(c *gin.Context) (string, string, error) {
	if m.OnSaveUploadedFile != nil {
		return m.OnSaveUploadedFile(c)
	}
	// Default behavior: check if image file exists
	_, _, err := c.Request.FormFile("image")
	if err != nil {
		return "", "", err
	}
	return "", "", nil
}

func (m *MockImageService) GenerateBlurHash(imageURL string) (string, error) {
	return "", nil
}

func (m *MockImageService) CleanupOrphanedFiles(ctx context.Context, allActiveURLs []string) (int, error) {
	return 0, nil
}

func (m *MockPostService) CreateLibraryEntry(ctx context.Context, p *models.Post, t []string, r string, uID int) error {
	if m.OnCreate != nil {
		return m.OnCreate(ctx, p, t, r, uID)
	}
	return nil
}

func (m *MockPostService) GetPostBySlug(ctx context.Context, s string, uID int) (*models.Post, error) {
	return m.OnGetBySlug(ctx, s, uID)
}
func (m *MockPostService) GetAllPosts(ctx context.Context, c, s string, t []string, p, l int, r string, uID int) ([]models.Post, *models.PaginationMeta, error) {
	return m.OnGetAll(ctx, c, s, t, p, l, r, uID)
}
func (m *MockPostService) UpdatePost(ctx context.Context, p *models.Post, t []string, r string, uID int) error {
	return m.OnUpdate(ctx, p, t, r, uID)
}
func (m *MockPostService) DeletePost(ctx context.Context, id int, r string) error {
	return m.OnDelete(ctx, id, r)
}
func (m *MockPostService) ToggleLike(ctx context.Context, uID, pID int) (bool, error) {
	return m.OnToggleLike(ctx, uID, pID)
}
func (m *MockPostService) GetLikedPosts(ctx context.Context, uID int) ([]models.Post, error) {
	return m.OnGetLiked(ctx, uID)
}
func (m *MockPostService) UpdateBlurHash(ctx context.Context, id int, h string) error {
	return m.OnUpdateHash(ctx, id, h)
}
func (m *MockPostService) UpdateBlurHashAsync(localPath string, postID int) {
	if m.OnUpdateBlurHashAsync != nil {
		m.OnUpdateBlurHashAsync(localPath, postID)
	}
}
func (m *MockPostService) CleanupOrphanedFiles(ctx context.Context) (int, error) {
	return m.OnCleanupOrphanedFiles(ctx)
}

func TestPostHandler_CreatePost(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("Fails without image in multipart form", func(t *testing.T) {
		h := NewPostHandler(&MockPostService{}, &MockImageService{})
		r := gin.Default()
		r.POST("/posts", h.CreatePost)

		body := &bytes.Buffer{}
		writer := multipart.NewWriter(body)
		_ = writer.WriteField("title", "Missing Image")
		writer.Close()

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/posts", body)
		req.Header.Set("Content-Type", writer.FormDataContentType())

		r.ServeHTTP(w, req)

		if w.Code != http.StatusBadRequest {
			t.Errorf("Expected 400 when image is missing, got %d", w.Code)
		}
	})

	t.Run("Successful Post Creation", func(t *testing.T) {
		mockService := &MockPostService{
			OnCreate: func(ctx context.Context, p *models.Post, tags []string, role string, uID int) error {
				p.ID = 1
				return nil
			},
			OnUpdateHash: func(ctx context.Context, id int, hash string) error {
				return nil
			},
		}

		mockImageService := &MockImageService{
			OnSaveUploadedFile: func(c *gin.Context) (string, string, error) {
				return "uploads/test.png", "/tmp/test.png", nil
			},
		}

		h := NewPostHandler(mockService, mockImageService)
		r := gin.Default()
		r.POST("/posts", func(c *gin.Context) {
			c.Set("role", "admin")
			c.Set("user_id", 1)
			h.CreatePost(c)
		})

		body := &bytes.Buffer{}
		writer := multipart.NewWriter(body)

		part, _ := writer.CreateFormFile("image", "test.png")
		part.Write([]byte("\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"))

		_ = writer.WriteField("title", "The Vasa Ship")
		_ = writer.WriteField("content", "Historical Swedish artifact")
		_ = writer.WriteField("category_id", "5")
		writer.Close()

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("POST", "/posts", body)
		req.Header.Set("Content-Type", writer.FormDataContentType())

		r.ServeHTTP(w, req)

		if w.Code != http.StatusCreated {
			t.Errorf("Expected 201 Created, got %d", w.Code)
		}
	})
}

func TestPostHandler_GetPosts(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("Returns posts with meta", func(t *testing.T) {
		mockService := &MockPostService{
			OnGetAll: func(ctx context.Context, c, s string, t []string, p, l int, r string, uID int) ([]models.Post, *models.PaginationMeta, error) {
				return []models.Post{{ID: 1, Title: "Archive Item"}}, &models.PaginationMeta{TotalItems: 1}, nil
			},
		}

		mockImageService := &MockImageService{}

		h := NewPostHandler(mockService, mockImageService)
		r := gin.Default()
		r.GET("/posts", h.GetPosts)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/posts", nil)
		r.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("Expected 200, got %d", w.Code)
		}
	})
}
