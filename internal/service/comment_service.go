package service

import (
	"errors"

	"github.com/DataM1d/digital-library/internal/models"
	"github.com/DataM1d/digital-library/internal/repository"
)

type CommentService struct {
	repo *repository.CommentRepository
}

func NewCommentService(repo *repository.CommentRepository) *CommentService {
	return &CommentService{repo: repo}
}

func (s *CommentService) AddComment(c *models.Comment) error {
	if c.Content == "" {
		return errors.New("comment content cannot be empty")
	}
	return s.repo.Create(c)
}

func (s *CommentService) GetPostComments(postID int) ([]models.Comment, error) {
	return s.repo.GetByPostID(postID)
}
