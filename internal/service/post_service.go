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

func (s *PostService) GetAllPosts() ([]models.Post, error) {
	return s.repo.GetAll()
}
