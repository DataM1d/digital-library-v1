package service

import (
	"testing"

	"github.com/DataM1d/digital-library/internal/models"
)

type MockCommentRepo struct {
	OnCreate      func(c *models.Comment) error
	OnGetByPostID func(postID int) ([]models.Comment, error)
}

func (m *MockCommentRepo) Create(c *models.Comment) error {
	return m.OnCreate(c)
}

func (m *MockCommentRepo) GetByPostID(postID int) ([]models.Comment, error) {
	return m.OnGetByPostID(postID)
}

func TestCommentService_CreateComment(t *testing.T) {
	t.Run("Sanitization logic", func(t *testing.T) {
		var capturedComment *models.Comment
		mockRepo := &MockCommentRepo{
			OnCreate: func(c *models.Comment) error {
				capturedComment = c
				return nil
			},
		}

		mockPostRepo := &MockPostRepo{
			OnGetBySlug: func(slug string, id int) (*models.Post, error) {
				return &models.Post{ID: 100}, nil
			},
		}

		service := NewCommentService(mockRepo, mockPostRepo)
		comment := &models.Comment{
			Content: "<script>alert('xss')</script>Safe text",
		}

		err := service.CreateComment("test-post", comment)

		if err != nil {
			t.Fatalf("Expected nil error, got %v", err)
		}

		if capturedComment.Content != "Safe text" {
			t.Errorf("Expected sanitized content 'Safe text', got %s", capturedComment.Content)
		}
	})
}

func TestCommentService_BuildCommentTree(t *testing.T) {
	t.Run("Correctly nests children under parents", func(t *testing.T) {
		parentID := 1
		childID := 2

		flatComments := []models.Comment{
			{ID: parentID, Content: "Parent", ParentID: nil},
			{ID: childID, Content: "Child", ParentID: &parentID},
		}

		mockRepo := &MockCommentRepo{
			OnGetByPostID: func(id int) ([]models.Comment, error) {
				return flatComments, nil
			},
		}

		mockPostRepo := &MockPostRepo{
			OnGetBySlug: func(slug string, id int) (*models.Post, error) {
				return &models.Post{ID: 100}, nil
			},
		}

		service := NewCommentService(mockRepo, mockPostRepo)
		tree, err := service.GetCommentsByPostSlug("test-post")

		if err != nil {
			t.Fatalf("Failed to get comments: %v", err)
		}

		if len(tree) != 1 {
			t.Errorf("Expected 1 root comment, got %d", len(tree))
		}

		if len(tree[0].Replies) != 1 {
			t.Errorf("Expected 1 reply, got %d", len(tree[0].Replies))
		}

		if tree[0].Replies[0].ID != childID {
			t.Errorf("Expected child ID %d, got %d", childID, tree[0].Replies[0].ID)
		}
	})
}
