package service

import (
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/DataM1d/digital-library/internal/domain"
	"github.com/DataM1d/digital-library/internal/models"
	"github.com/DataM1d/digital-library/pkg/utils"
	"github.com/microcosm-cc/bluemonday"
)

type PostService interface {
	CreateLibraryEntry(post *models.Post, tagNames []string, userRole string, userID int) error
	UpdatePost(post *models.Post, tagNames []string, userRole string, userID int) error
	DeletePost(id int, userRole string) error
	GetPostBySlug(slug string, currentUserID int) (*models.Post, error)
	GetAllPosts(category, search string, tags []string, page, limit int, userRole string, currentUserID int) ([]models.Post, *models.PaginationMeta, error)
	ToggleLike(userID, postID int) (bool, error)
	GetLikedPosts(userID int) ([]models.Post, error)
	UpdateBlurHash(postID int, hash string) error
}

type postService struct {
	repo    domain.PostRepo
	tagRepo domain.TagRepo
}

func NewPostService(repo domain.PostRepo, tagRepo domain.TagRepo) PostService {
	return &postService{
		repo:    repo,
		tagRepo: tagRepo,
	}
}

func (s *postService) CreateLibraryEntry(post *models.Post, tagNames []string, userRole string, userID int) error {
	if userRole != "admin" {
		return errors.New("unauthorized: system access restricted to admin")
	}

	strict := bluemonday.StrictPolicy()
	ugc := bluemonday.UGCPolicy()

	post.Title = strict.Sanitize(post.Title)
	post.Content = ugc.Sanitize(post.Content)
	post.CreatedBy = userID

	if post.Status == "" {
		post.Status = "published"
	}

	baseSlug := utils.GenerateSlug(post.Title)
	finalSlug, err := s.generateUniqueSlug(baseSlug)
	if err != nil {
		return fmt.Errorf("archive: slug generation failed: %w", err)
	}
	post.Slug = finalSlug

	return s.repo.WithTransaction(func(txRepo domain.PostRepo) error {
		if err := txRepo.Create(post); err != nil {
			return err
		}

		if len(tagNames) > 0 {
			if err := s.tagRepo.SyncPostTags(post.ID, tagNames); err != nil {
				return fmt.Errorf("archive: tag sync failure: %w", err)
			}
		}
		return nil
	})
}

func (s *postService) UpdatePost(post *models.Post, tagNames []string, userRole string, userID int) error {
	if userRole != "admin" {
		return errors.New("unauthorized: system update restricted")
	}

	strict := bluemonday.StrictPolicy()
	ugc := bluemonday.UGCPolicy()

	post.Title = strict.Sanitize(post.Title)
	post.Content = ugc.Sanitize(post.Content)
	post.LastModifiedBy = userID

	return s.repo.WithTransaction(func(txRepo domain.PostRepo) error {
		if err := txRepo.Update(post); err != nil {
			return err
		}

		if tagNames != nil {
			if err := s.tagRepo.SyncPostTags(post.ID, tagNames); err != nil {
				return err
			}
		}
		return nil
	})
}

func (s *postService) GetPostBySlug(slug string, currentUserID int) (*models.Post, error) {
	if slug == "" {
		return nil, errors.New("identifier required")
	}
	return s.repo.GetBySlug(slug, currentUserID)
}

func (s *postService) GetAllPosts(category, search string, tags []string, page, limit int, userRole string, currentUserID int) ([]models.Post, *models.PaginationMeta, error) {
	if limit <= 0 {
		limit = 12
	}
	if page <= 0 {
		page = 1
	}
	offset := (page - 1) * limit

	statusFilter := "published"
	if userRole == "admin" {
		statusFilter = ""
	}

	posts, total, err := s.repo.GetAll(category, search, tags, limit, offset, statusFilter, currentUserID)
	if err != nil {
		return nil, nil, err
	}

	meta := &models.PaginationMeta{
		CurrentPage: page,
		TotalItems:  int64(total),
		TotalPages:  (total + limit - 1) / limit,
		Limit:       limit,
	}

	return posts, meta, nil
}

func (s *postService) DeletePost(id int, userRole string) error {
	if userRole != "admin" {
		return errors.New("unauthorized: purge restricted")
	}

	post, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}

	if err := s.repo.Delete(id); err != nil {
		return err
	}

	if post.ImageURL != "" && !strings.HasPrefix(post.ImageURL, "http") {
		trimmedPath := strings.TrimPrefix(post.ImageURL, "/")
		localPath := filepath.Join(".", trimmedPath)
		if err := os.Remove(localPath); err != nil {
			log.Printf("Non-fatal: Cleanup failed for %s: %v", localPath, err)
		}
	}

	return nil
}

func (s *postService) UpdateBlurHash(postID int, hash string) error {
	return s.repo.UpdateBlurHash(postID, hash)
}

func (s *postService) generateUniqueSlug(baseSlug string) (string, error) {
	currentSlug := baseSlug
	for i := 1; i <= 10; i++ {
		exists, err := s.repo.SlugExists(currentSlug)
		if err != nil {
			return "", err
		}
		if !exists {
			return currentSlug, nil
		}
		currentSlug = fmt.Sprintf("%s-%s", baseSlug, utils.RandomString(4))
	}
	return currentSlug, nil
}

func (s *postService) ToggleLike(userID, postID int) (bool, error) {
	return s.repo.ToggleLike(userID, postID)
}

func (s *postService) GetLikedPosts(userID int) ([]models.Post, error) {
	return s.repo.GetUserLikedPosts(userID)
}
