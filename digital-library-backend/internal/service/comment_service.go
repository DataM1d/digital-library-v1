package service

import (
	"errors"

	"github.com/DataM1d/digital-library/internal/models"
	"github.com/DataM1d/digital-library/internal/repository"
)

type CommentService interface {
	GetCommentsByPostSlug(slug string) ([]models.Comment, error)
	CreateCommentBySlug(slug string, comment *models.Comment) error
}

type commentService struct {
	repo     *repository.CommentRepository
	postRepo *repository.PostRepository
}

func NewCommentService(repo *repository.CommentRepository, postRepo *repository.PostRepository) CommentService {
	return &commentService{
		repo:     repo,
		postRepo: postRepo,
	}
}

func (s *commentService) GetCommentsByPostSlug(slug string) ([]models.Comment, error) {
	post, err := s.postRepo.GetBySlug(slug, 0)
	if err != nil {
		return nil, err
	}

	return s.buildCommentTree(post.ID)
}

func (s *commentService) CreateCommentBySlug(slug string, comment *models.Comment) error {
	if comment.Content == "" {
		return errors.New("comment content cannot be empty")
	}

	post, err := s.postRepo.GetBySlug(slug, 0)
	if err != nil {
		return err
	}

	comment.PostID = post.ID
	return s.repo.Create(comment)
}

func (s *commentService) buildCommentTree(postID int) ([]models.Comment, error) {
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
