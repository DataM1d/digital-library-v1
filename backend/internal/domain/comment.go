package domain

import (
	"context"

	"github.com/DataM1d/digital-library/internal/models"
)

type CommentRepo interface {
	Create(ctx context.Context, c *models.Comment) error
	GetByPostID(ctx context.Context, postID int) ([]models.Comment, error)
}

type CommentService interface {
	AddComment(ctx context.Context, postID, userID int, content string, parentID *int) (*models.Comment, error)
	GetCommentsByPost(ctx context.Context, postID int) ([]models.Comment, error)
}
