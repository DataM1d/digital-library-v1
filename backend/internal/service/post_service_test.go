package service_test

import (
	"context"
	"testing"

	"github.com/DataM1d/digital-library/internal/domain"
	"github.com/DataM1d/digital-library/internal/models"
	"github.com/DataM1d/digital-library/internal/service"
	"github.com/gin-gonic/gin"
)

type MockImageService struct{}

func (m *MockImageService) SaveUploadedFile(c *gin.Context) (string, string, error) {
	return "", "", nil
}
func (m *MockImageService) GenerateBlurHash(path string) (string, error) {
	return "L6PZfSa_d6%ir[jtE1V@~pCarrW-", nil
}
func (m *MockImageService) CleanupOrphanedFiles(ctx context.Context, urls []string) (int, error) {
	return 0, nil
}

type MockSlugService struct {
	OnGenerate func(ctx context.Context, title string) (string, error)
}

func (m *MockSlugService) GenerateUniqueSlug(ctx context.Context, title string) (string, error) {
	if m.OnGenerate != nil {
		return m.OnGenerate(ctx, title)
	}
	return "mock-slug", nil
}

type MockPostRepo struct {
	OnSlugExists      func(ctx context.Context, slug string) (bool, error)
	OnCreate          func(ctx context.Context, p *models.Post) error
	OnUpdate          func(ctx context.Context, p *models.Post) error
	OnSyncTags        func(ctx context.Context, postID int, tagNames []string) error
	OnWithTx          func(ctx context.Context, fn func(domain.PostRepo) error) error
	OnGetAllImageURLs func(ctx context.Context) ([]string, error)
}

func (m *MockPostRepo) SlugExists(ctx context.Context, s string) (bool, error) {
	if m.OnSlugExists != nil {
		return m.OnSlugExists(ctx, s)
	}
	return false, nil
}

func (m *MockPostRepo) SyncTags(ctx context.Context, postID int, tagName []string) error {
	if m.OnSyncTags != nil {
		return m.OnSyncTags(ctx, postID, tagName)
	}
	return nil
}

func (m *MockPostRepo) Create(ctx context.Context, p *models.Post) error {
	if m.OnCreate != nil {
		return m.OnCreate(ctx, p)
	}
	return nil
}

func (m *MockPostRepo) WithTransaction(ctx context.Context, fn func(domain.PostRepo) error) error {
	if m.OnWithTx != nil {
		return m.OnWithTx(ctx, fn)
	}
	return fn(m)
}

func (m *MockPostRepo) GetAllImageURLs(ctx context.Context) ([]string, error) {
	if m.OnGetAllImageURLs != nil {
		return m.OnGetAllImageURLs(ctx)
	}
	return []string{}, nil
}

func (m *MockPostRepo) Update(ctx context.Context, p *models.Post) error {
	if m.OnUpdate != nil {
		return m.OnUpdate(ctx, p)
	}
	return nil
}
func (m *MockPostRepo) Delete(ctx context.Context, id int) error                  { return nil }
func (m *MockPostRepo) GetByID(ctx context.Context, id int) (*models.Post, error) { return nil, nil }
func (m *MockPostRepo) GetBySlug(ctx context.Context, s string, id int) (*models.Post, error) {
	return nil, nil
}
func (m *MockPostRepo) GetAll(ctx context.Context, c, s string, t []string, l, o int, st string, id int) ([]models.Post, int, error) {
	return nil, 0, nil
}
func (m *MockPostRepo) ToggleLike(ctx context.Context, u, p int) (bool, error) { return false, nil }
func (m *MockPostRepo) GetUserLikedPosts(ctx context.Context, u int) ([]models.Post, error) {
	return nil, nil
}
func (m *MockPostRepo) UpdateBlurHash(ctx context.Context, id int, h string) error { return nil }

type MockTagRepo struct {
	OnSyncPostTags func(ctx context.Context, postID int, tagNames []string) error
}

func (m *MockTagRepo) SyncPostTags(ctx context.Context, id int, tags []string) error {
	if m.OnSyncPostTags != nil {
		return m.OnSyncPostTags(ctx, id, tags)
	}
	return nil
}

type MockSanitizer struct{}

func (m *MockSanitizer) Sanitize(p *models.Post) {}

func TestPostService_CreateLibraryEntry(t *testing.T) {
	ctx := context.Background()

	t.Run("Unauthorized if not admin", func(t *testing.T) {
		svc := service.NewPostService(
			&MockPostRepo{},
			&MockTagRepo{},
			&MockImageService{},
			&MockSlugService{},
			&MockSanitizer{},
		)
		err := svc.CreateLibraryEntry(ctx, &models.Post{}, []string{}, "user", 1)
		if err == nil {
			t.Errorf("Expected unauthorized error, got nil")
		}
	})

	t.Run("Slug generation and sanitization logic", func(t *testing.T) {
		var capturedPost *models.Post
		mockPostRepo := &MockPostRepo{
			OnSlugExists: func(ctx context.Context, slug string) (bool, error) { return false, nil },
			OnCreate: func(ctx context.Context, p *models.Post) error {
				capturedPost = p
				return nil
			},
		}

		mockSlug := &MockSlugService{
			OnGenerate: func(ctx context.Context, title string) (string, error) {
				return "the-swedish-archive", nil
			},
		}

		svc := service.NewPostService(mockPostRepo, &MockTagRepo{}, &MockImageService{}, mockSlug, service.NewSanitizer())
		post := &models.Post{
			Title:   "<h1>The Swedish Archive</h1>",
			Content: "<script>alert('xss')</script><p>Safe content</p>",
		}

		err := svc.CreateLibraryEntry(ctx, post, []string{"history"}, "admin", 42)

		if err != nil {
			t.Fatalf("Creation failed: %v", err)
		}

		if capturedPost.Title != "The Swedish Archive" {
			t.Errorf("Title not sanitized: %s", capturedPost.Title)
		}
		if capturedPost.Content != "<p>Safe content</p>" {
			t.Errorf("Content not sanitized: %s", capturedPost.Content)
		}
		if capturedPost.Slug != "the-swedish-archive" {
			t.Errorf("Expected slug the-swedish-archive, got %s", capturedPost.Slug)
		}
	})
}

func TestCreatePost_SyncsTags(t *testing.T) {
	ctx := context.Background()
	tagsSynced := false
	expectedID := 101
	testTags := []string{"Renaissance"}
	var mockRepo *MockPostRepo

	mockRepo = &MockPostRepo{
		OnCreate: func(ctx context.Context, p *models.Post) error {
			p.ID = expectedID
			return nil
		},
		OnSyncTags: func(ctx context.Context, postID int, tagNames []string) error {
			if postID == expectedID && len(tagNames) > 0 && tagNames[0] == "Renaissance" {
				tagsSynced = true
			}
			return nil
		},
		OnWithTx: func(ctx context.Context, fn func(domain.PostRepo) error) error {
			return fn(mockRepo)
		},
		OnSlugExists: func(ctx context.Context, slug string) (bool, error) {
			return false, nil
		},
	}

	svc := service.NewPostService(
		mockRepo,
		&MockTagRepo{},
		&MockImageService{},
		&MockSlugService{},
		&MockSanitizer{},
	)

	post := &models.Post{
		Title:   "Renaissance Art",
		Content: "Content about the Renaissance period.",
	}

	err := svc.CreateLibraryEntry(ctx, post, testTags, "admin", 1)

	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if !tagsSynced {
		t.Error("Expected SyncTags to be called, but it was not")
	}

	if post.ID != expectedID {
		t.Errorf("Expected ID %d, got %d", expectedID, post.ID)
	}
}
