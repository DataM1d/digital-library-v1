package service

import (
	"context"
	"errors"

	"github.com/DataM1d/digital-library/internal/domain"
	"github.com/DataM1d/digital-library/internal/models"
	"github.com/microcosm-cc/bluemonday"
)

type commentService struct {
	repo     domain.CommentRepo
	postRepo domain.PostRepo
}

func NewCommentService(repo domain.CommentRepo, postRepo domain.PostRepo) domain.CommentService {
	return &commentService{
		repo:     repo,
		postRepo: postRepo,
	}
}

func (s *commentService) GetCommentsByPost(ctx context.Context, postID int) ([]models.Comment, error) {
	return s.buildCommentTree(ctx, postID)
}

func (s *commentService) AddComment(ctx context.Context, postID, userID int, content string, parentID *int) (*models.Comment, error) {
	if content == "" {
		return nil, errors.New("comment content cannot be empty")
	}

	p := bluemonday.StrictPolicy()
	cleanContent := p.Sanitize(content)

	comment := &models.Comment{
		PostID:   postID,
		UserID:   userID,
		Content:  cleanContent,
		ParentID: parentID,
	}

	if err := s.repo.Create(ctx, comment); err != nil {
		return nil, err
	}

	return comment, nil
}

func (s *commentService) buildCommentTree(ctx context.Context, postID int) ([]models.Comment, error) {
	flatComments, err := s.repo.GetByPostID(ctx, postID)
	if err != nil {
		return nil, err
	}

	commentMap := make(map[int]*models.Comment) //Mapping all comments by their ID using pointers to the original slice elements
	for i := range flatComments {
		flatComments[i].Replies = []models.Comment{} //Empty Slice
		commentMap[flatComments[i].ID] = &flatComments[i]
	}

	var tree []models.Comment
	for i := range flatComments {
		c := commentMap[flatComments[i].ID]

		if c.ParentID != nil {
			if parent, exists := commentMap[*c.ParentID]; exists {
				parent.Replies = append(parent.Replies, *c)
			}
		}
	}

	for i := range flatComments {
		if flatComments[i].ParentID == nil {
			tree = append(tree, *commentMap[flatComments[i].ID])
		}
	}

	return tree, nil
}
