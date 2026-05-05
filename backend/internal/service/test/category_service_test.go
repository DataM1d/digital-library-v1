package service_test

import (
	"context"
	"testing"

	"github.com/DataM1d/digital-library/internal/models"
	"github.com/DataM1d/digital-library/internal/service"
)

type MockCategoryRepo struct {
	OnCreate func(ctx context.Context, c *models.Category) error
	OnGetAll func(ctx context.Context) ([]models.Category, error)
	OnDelete func(ctx context.Context, id int) error
}

func (m *MockCategoryRepo) Create(ctx context.Context, c *models.Category) error {
	return m.OnCreate(ctx, c)
}
func (m *MockCategoryRepo) GetAll(ctx context.Context) ([]models.Category, error) {
	return m.OnGetAll(ctx)
}
func (m *MockCategoryRepo) Delete(ctx context.Context, id int) error { return m.OnDelete(ctx, id) }

func TestCategoryService_CreateCategory(t *testing.T) {
	ctx := context.Background()
	t.Run("Sanitization and slug generation", func(t *testing.T) {
		var capturedCategory *models.Category

		mockRepo := &MockCategoryRepo{
			OnCreate: func(ctx context.Context, c *models.Category) error {
				capturedCategory = c
				return nil
			},
		}

		svc := service.NewCategoryService(mockRepo)
		inputName := "<script>alert('xss')</script>Historical Documents"

		category, err := svc.CreateCategory(ctx, inputName, "admin")

		if err != nil {
			t.Fatalf("Expected nil error, got %v", err)
		}

		expectedName := "Historical Documents"
		if category.Name != expectedName {
			t.Errorf("Expected sanitized name %s, got %s", expectedName, category.Name)
		}

		expectedSlug := "historical-documents"
		if category.Slug != expectedSlug {
			t.Errorf("Expected slug %s, got %s", expectedSlug, category.Slug)
		}

		if capturedCategory.Name != expectedName {
			t.Errorf("Repository received unsanitized name")
		}
	})

	t.Run("Unauthorized creation attempt", func(t *testing.T) {
		mockRepo := &MockCategoryRepo{}
		svc := service.NewCategoryService(mockRepo)

		_, err := svc.CreateCategory(ctx, "New Category", "user")

		if err == nil {
			t.Error("Expected error for non-admin user, got nil")
		}
	})
}
