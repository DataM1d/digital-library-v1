package service

import (
	"errors"

	"github.com/DataM1d/digital-library/internal/models"
	"github.com/DataM1d/digital-library/internal/repository"
)

type PostService struct {
	repo *repository.PostRepository
}

func NewPostService(repo *repository.PostRepository) *PostService {
	return &PostService{repo: repo}
}

func (s *PostService) CreateLibraryEntry(post *models.Post, userRole string) error {
	if userRole != "admin" {
		return errors.New("unauthorized: only admins can create library posts")
	}
	if post.CategoryID == 0 {
		return errors.New("category_id is required")
	}
	return s.repo.Create(post)
}

func (s *PostService) GetAllPosts(category string, search string, tags []string, page, limit int) ([]models.Post, error) {
	if limit <= 0 {
		limit = 10
	}
	if page <= 0 {
		page = 1
	}
	offset := (page - 1) * limit

	return s.repo.GetAll(category, search, tags, limit, offset)
}

func (s *PostService) ToggleLike(userID, postID int) (bool, error) {
	return s.repo.ToggleLike(userID, postID)
}
