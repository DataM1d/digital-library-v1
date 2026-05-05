package service_test

import (
	"context"
	"testing"

	"github.com/DataM1d/digital-library/internal/models"
	"github.com/DataM1d/digital-library/internal/service"
)

type MockCommentRepo struct {
	OnCreate      func(ctx context.Context, c *models.Comment) error
	OnGetByPostID func(ctx context.Context, postID int) ([]models.Comment, error)
}

func (m *MockCommentRepo) Create(ctx context.Context, c *models.Comment) error {
	return m.OnCreate(ctx, c)
}

func (m *MockCommentRepo) GetByPostID(ctx context.Context, postID int) ([]models.Comment, error) {
	return m.OnGetByPostID(ctx, postID)
}

func TestCommentService_AddComment(t *testing.T) {
	ctx := context.Background()

	t.Run("Sanitization logic", func(t *testing.T) {
		var capturedComment *models.Comment
		mockRepo := &MockCommentRepo{
			OnCreate: func(ctx context.Context, c *models.Comment) error {
				capturedComment = c
				return nil
			},
		}
		svc := service.NewCommentService(mockRepo, nil)

		content := "<script>alert('xss')</script>Safe text"
		postID := 100
		userID := 1

		comment, err := svc.AddComment(ctx, postID, userID, content, nil)

		if err != nil {
			t.Fatalf("Expected nil error, got %v", err)
		}

		if comment.Content != "Safe text" {
			t.Errorf("Expected sanitized content 'Safe text', got %s", comment.Content)
		}

		if capturedComment.PostID != postID {
			t.Errorf("Expected PostID %d, got %d", postID, capturedComment.PostID)
		}
	})
}

func TestCommentService_BuildCommentTree(t *testing.T) {
	ctx := context.Background()

	t.Run("Correctly nests children under parents", func(t *testing.T) {
		parentID := 1
		childID := 2
		postID := 100

		flatComments := []models.Comment{
			{ID: parentID, Content: "Parent", ParentID: nil},
			{ID: childID, Content: "Child", ParentID: &parentID},
		}

		mockRepo := &MockCommentRepo{
			OnGetByPostID: func(ctx context.Context, id int) ([]models.Comment, error) {
				return flatComments, nil
			},
		}

		svc := service.NewCommentService(mockRepo, nil)
		tree, err := svc.GetCommentsByPost(ctx, postID)

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
