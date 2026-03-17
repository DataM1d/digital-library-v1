package service

import (
	"testing"

	"github.com/DataM1d/digital-library/internal/domain"
	"github.com/DataM1d/digital-library/internal/models"
)

type MockPostRepo struct {
	OnSlugExists func(slug string) (bool, error)
	OnCreate     func(p *models.Post) error
	OnWithTx     func(fn func(domain.PostRepo) error) error
	OnGetBySlug  func(slug string, currentUserID int) (*models.Post, error)
}

func (m *MockPostRepo) SlugExists(s string) (bool, error) { return m.OnSlugExists(s) }
func (m *MockPostRepo) Create(p *models.Post) error       { return m.OnCreate(p) }
func (m *MockPostRepo) WithTransaction(fn func(domain.PostRepo) error) error {
	if m.OnWithTx != nil {
		return m.OnWithTx(fn)
	}
	return fn(m)
}

func (m *MockPostRepo) GetBySlug(s string, id int) (*models.Post, error) {
	if m.OnGetBySlug != nil {
		return m.OnGetBySlug(s, id)
	}
	return nil, nil
}

func (m *MockPostRepo) Update(p *models.Post) error { return nil }
func (m *MockPostRepo) Delete(id int) error         { return nil }
func (m *MockPostRepo) GetAll(c, s string, t []string, l, o int, st string, id int) ([]models.Post, int, error) {
	return nil, 0, nil
}
func (m *MockPostRepo) GetByID(id int) (*models.Post, error)           { return nil, nil }
func (m *MockPostRepo) ToggleLike(u, p int) (bool, error)              { return false, nil }
func (m *MockPostRepo) GetUserLikedPosts(u int) ([]models.Post, error) { return nil, nil }
func (m *MockPostRepo) UpdateBlurHash(id int, h string) error          { return nil }

type MockTagRepo struct {
	OnSyncPostTags func(postID int, tagNames []string) error
}

func (m *MockTagRepo) SyncPostTags(id int, tags []string) error {
	if m.OnSyncPostTags != nil {
		return m.OnSyncPostTags(id, tags)
	}
	return nil
}

func TestPostService_CreateLibraryEntry(t *testing.T) {
	t.Run("Unauthorized if not admin", func(t *testing.T) {
		service := NewPostService(&MockPostRepo{}, &MockTagRepo{})
		err := service.CreateLibraryEntry(&models.Post{}, []string{}, "user", 1)
		if err == nil || err.Error() != "unauthorized: system access restricted to admin" {
			t.Errorf("Expected unauthorized error, got %v", err)
		}
	})

	t.Run("Slug generation and sanitization logic", func(t *testing.T) {
		var capturedPost *models.Post
		mockPostRepo := &MockPostRepo{
			OnSlugExists: func(slug string) (bool, error) { return false, nil },
			OnCreate: func(p *models.Post) error {
				capturedPost = p
				return nil
			},
		}

		service := NewPostService(mockPostRepo, &MockTagRepo{})
		post := &models.Post{
			Title:   "<h1>The Swedish Archive</h1>",
			Content: "<script>alert('xss')</script><p>Safe content</p>",
		}

		err := service.CreateLibraryEntry(post, []string{"history"}, "admin", 42)

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

	t.Run("Unique slug collision handling", func(t *testing.T) {
		callCount := 0
		mockPostRepo := &MockPostRepo{
			OnSlugExists: func(slug string) (bool, error) {
				callCount++
				if callCount == 1 {
					return true, nil
				}
				return false, nil
			},
			OnCreate: func(p *models.Post) error { return nil },
		}

		service := NewPostService(mockPostRepo, &MockTagRepo{})
		post := &models.Post{Title: "Duplicate Title"}

		_ = service.CreateLibraryEntry(post, []string{}, "admin", 1)

		if post.Slug == "duplicate-title" {
			t.Error("Slug collision was not handled; should have appended random string")
		}

		if callCount < 2 {
			t.Error("SlugExists should have been called at least twice")
		}
	})
}
