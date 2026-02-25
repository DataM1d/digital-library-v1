package service

import (
	"errors"
	"fmt"

	"github.com/DataM1d/digital-library/internal/models"
	"github.com/DataM1d/digital-library/internal/repository"
	"github.com/DataM1d/digital-library/pkg/utils"
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

	baseSlug := utils.GenerateSlug(post.Title)
	if baseSlug == "" {
		return errors.New("title is too short or invalid")
	}

	finalSlug, err := s.generateUniqueSlug(baseSlug)
	if err != nil {
		return err
	}

	post.Slug = finalSlug

	return s.repo.Create(post)
}

func (s *PostService) generateUniqueSlug(baseSlug string) (string, error) {
	currentSlug := baseSlug
	counter := 1

	for {
		exists, err := s.repo.SlugExists(currentSlug)
		if err != nil {
			return "", err
		}
		if !exists {
			return currentSlug, nil
		}

		currentSlug = fmt.Sprintf("%s-%d", baseSlug, counter)
		counter++

		if counter > 100 {
			return "", errors.New("too many posts with similar titles")
		}
	}
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

func (s *PostService) GetPostBySlug(slug string) (*models.Post, error) {
	if slug == "" {
		return nil, errors.New("slug is required")
	}
	return s.repo.GetBySlug(slug)
}
