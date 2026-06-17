package handlers

import (
	"context"
	"io"

	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DataM1d/digital-library/internal/models"
	"github.com/gin-gonic/gin"
)

type mockPostService struct {
	createEntryFunc func(context.Context, *models.Post, []string, string, int) error
	getAllPostsFunc func(context.Context, string, string, []string, int, int, string, int) ([]models.Post, *models.PaginationMeta, error)
	deletePostFunc  func(context.Context, int, string, int) error
	getPostBySlug   func(context.Context, string, int) (*models.Post, error)
	getAuthInfoByID func(context.Context, int) (*models.Post, error)
	toggleLikeFunc  func(context.Context, int, int) (bool, error)
	getLikedPosts   func(context.Context, int) ([]models.Post, error)
}

func (m *mockPostService) CreateLibraryEntry(ctx context.Context, p *models.Post, t []string, r string, u int) error { return m.createEntryFunc(ctx, p, t, r, u) }
func (m *mockPostService) UpdatePost(ctx context.Context, p *models.Post, t []string, r string, u int) error             { return nil }
func (m *mockPostService) DeletePost(ctx context.Context, id int, r string, u int) error                                { return m.deletePostFunc(ctx, id, r, u) }
func (m *mockPostService) GetByID(ctx context.Context, id int) (*models.Post, error)                                     { return nil, nil }
func (m *mockPostService) GetAuthInfoByID(ctx context.Context, id int) (*models.Post, error)                             { return m.getAuthInfoByID(ctx, id) }
func (m *mockPostService) GetPostBySlug(ctx context.Context, s string, u int) (*models.Post, error)                      { return m.getPostBySlug(ctx, s, u) }
func (m *mockPostService) GetAllPosts(ctx context.Context, c, s string, t []string, p, l int, r string, u int) ([]models.Post, *models.PaginationMeta, error) {
	return m.getAllPostsFunc(ctx, c, s, t, p, l, r, u)
}
func (m *mockPostService) ToggleLike(ctx context.Context, u, p int) (bool, error)                  { return m.toggleLikeFunc(ctx, u, p) }
func (m *mockPostService) GetLikedPosts(ctx context.Context, u int) ([]models.Post, error)          { return m.getLikedPosts(ctx, u) }
func (m *mockPostService) UpdateBlurHash(ctx context.Context, p int, h string) error                { return nil }
func (m *mockPostService) UpdateBlurHashAsync(l string, p int)                                      {}
func (m *mockPostService) CleanupOrphanedFiles(ctx context.Context) (int, error)                    { return 0, nil }

type mockImageService struct {
	saveFunc func(io.Reader, string) (string, string, error)
}

func (m *mockImageService) Save(r io.Reader, f string) (string, string, error) { return m.saveFunc(r, f) }
func (m *mockImageService) GenerateBlurHash(l string) (string, error)          { return "", nil }
func (m *mockImageService) CleanupOrphanedFiles(ctx context.Context, a []string) (int, error) {
	return 0, nil
}

func TestGetPosts(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	mockSvc := &mockPostService{
		getAllPostsFunc: func(ctx context.Context, c, s string, t []string, p, l int, r string, u int) ([]models.Post, *models.PaginationMeta, error) {
			return []models.Post{{ID: 1, Title: "Test Post"}}, &models.PaginationMeta{TotalPages: 1}, nil
		},
	}
	h := NewPostHandler(mockSvc, nil)

	c.Request, _ = http.NewRequest(http.MethodGet, "/posts?page=1", nil)
	h.GetPosts(c)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}

func TestDeletePost(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request = httptest.NewRequest(http.MethodDelete, "/posts/1", nil)

	mockSvc := &mockPostService{
		getAuthInfoByID: func(ctx context.Context, id int) (*models.Post, error) {
			return &models.Post{ID: 1}, nil
		},
		deletePostFunc: func(ctx context.Context, id int, r string, u int) error {
			return nil
		},
	}
	h := NewPostHandler(mockSvc, nil)

	c.Params = gin.Params{{Key: "id", Value: "1"}}
	c.Set("user_id", 1)
	c.Set("role", "admin")

	h.DeletePost(c)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}
func TestToggleLike(t *testing.T) {
	gin.SetMode(gin.TestMode)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	c.Request = httptest.NewRequest(http.MethodPost, "/posts/1/like", nil)

	mockSvc := &mockPostService{
		toggleLikeFunc: func(ctx context.Context, u, p int) (bool, error) {
			return true, nil
		},
	}
	h := NewPostHandler(mockSvc, nil)

	c.Params = gin.Params{{Key: "id", Value: "1"}}
	c.Set("user_id", 1)

	h.ToggleLike(c)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}