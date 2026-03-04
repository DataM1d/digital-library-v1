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
	flatComments, err := s.repo.GetByPostID(postID)
	if err != nil {
		return nil, err
	}

	commentMap := make(map[int]*models.Comment)
	for i := range flatComments {
		commentMap[flatComments[i].ID] = &flatComments[i]
	}

	var tree []models.Comment

	for _, c := range flatComments {
		if c.ParentID == nil {
			tree = append(tree, *commentMap[c.ID])
		} else {
			if parent, exists := commentMap[*c.ParentID]; exists {
				parent.Replies = append(parent.Replies, *commentMap[c.ID])
			}
		}
	}

	return tree, nil
}
