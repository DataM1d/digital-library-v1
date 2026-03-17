package service

import (
	"errors"

	"github.com/DataM1d/digital-library/internal/domain"
	"github.com/DataM1d/digital-library/internal/models"
	"github.com/microcosm-cc/bluemonday"
)

type CommentService interface {
	GetCommentsByPostSlug(slug string) ([]models.Comment, error)
	CreateComment(slug string, comment *models.Comment) error
}

type commentService struct {
	repo     domain.CommentRepo
	postRepo domain.PostRepo
}

func NewCommentService(repo domain.CommentRepo, postRepo domain.PostRepo) CommentService {
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

func (s *commentService) CreateComment(slug string, comment *models.Comment) error {
	if comment.Content == "" {
		return errors.New("comment content cannot be empty")
	}

	p := bluemonday.StrictPolicy()
	comment.Content = p.Sanitize(comment.Content)

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
		flatComments[i].Replies = []models.Comment{}
		commentMap[flatComments[i].ID] = &flatComments[i]
	}

	for i := range flatComments {
		c := &flatComments[i]
		if c.ParentID != nil {
			if parent, exists := commentMap[*c.ParentID]; exists {
				parent.Replies = append(parent.Replies, *c)
			}
		}
	}

	var tree []models.Comment
	for i := range flatComments {
		if flatComments[i].ParentID == nil {
			tree = append(tree, *commentMap[flatComments[i].ID])
		}
	}

	return tree, nil
}
