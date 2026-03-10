package service

import (
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/DataM1d/digital-library/internal/models"
	"github.com/DataM1d/digital-library/internal/repository"
	"github.com/DataM1d/digital-library/pkg/utils"
	"github.com/microcosm-cc/bluemonday"
)

type PostService struct {
	repo *repository.PostRepository
}

func NewPostService(repo *repository.PostRepository) *PostService {
	return &PostService{repo: repo}
}

func (s *PostService) CreateLibraryEntry(post *models.Post, userRole string, userID int) error {
	if userRole != "admin" {
		return errors.New("unauthorized: only admins can create library posts")
	}

	p := bluemonday.UGCPolicy()
	post.Title = p.Sanitize(post.Title)
	post.Content = p.Sanitize(post.Content)
	post.CreatedBy = userID

	if post.Status == "" {
		post.Status = "published"
	}

	baseSlug := utils.GenerateSlug(post.Title)
	finalSlug, err := s.generateUniqueSlug(baseSlug)
	if err != nil {
		return err
	}
	post.Slug = finalSlug

	return s.repo.Create(post)
}

func (s *PostService) UpdatePost(post *models.Post, userRole string, userID int) error {
	if userRole != "admin" {
		return errors.New("unauthorized: only admins can update posts")
	}

	p := bluemonday.UGCPolicy()
	post.Title = p.Sanitize(post.Title)
	post.Content = p.Sanitize(post.Content)
	post.LastModifiedBy = userID
	if post.Status == "" {
		post.Status = "published"
	}

	return s.repo.Update(post)
}

func (s *PostService) DeletePost(id int, userRole string) error {
	if userRole != "admin" {
		return errors.New("unauthorized: only admins can delete posts")
	}

	post, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}

	if err := s.repo.Delete(id); err != nil {
		return err
	}

	if post.ImageURL != "" {
		trimmedPath := strings.TrimPrefix(post.ImageURL, "/")
		localPath := filepath.Join(".", trimmedPath)

		if err := os.Remove(localPath); err != nil {
			log.Printf("Non-fatal: Failed to remove physical file %s: %v", localPath, err)
		}
	}

	return nil
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
		if counter > 100 {
			return fmt.Sprintf("%s-%s", baseSlug, utils.RandomString(2)), nil
		}
		currentSlug = fmt.Sprintf("%s-%d", baseSlug, counter)
		counter++
	}
}

func (s *PostService) GetAllPosts(category, search string, tags []string, page, limit int, userRole string) ([]models.Post, int, error) {
	if limit <= 0 {
		limit = 10
	}
	if page <= 0 {
		page = 1
	}
	offset := (page - 1) * limit

	statusFilter := "published"
	if userRole == "admin" {
		statusFilter = ""
	}

	return s.repo.GetAll(category, search, tags, limit, offset, statusFilter)
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

func (s *PostService) GetLikedPosts(userID int) ([]models.Post, error) {
	return s.repo.GetUserLikedPosts(userID)
}

func (s *PostService) UpdateBlurHash(id int, hash string) error {
	return s.repo.UpdateBlurHash(id, hash)
}
