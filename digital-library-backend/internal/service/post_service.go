package service

import (
	"context"
	"errors"
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/DataM1d/digital-library/internal/domain"
	"github.com/DataM1d/digital-library/internal/models"
	"github.com/DataM1d/digital-library/pkg/utils"
	"github.com/buckket/go-blurhash"
	"github.com/microcosm-cc/bluemonday"
)

type postService struct {
	repo    domain.PostRepo
	tagRepo domain.TagRepo
}

func NewPostService(repo domain.PostRepo, tagRepo domain.TagRepo) domain.PostService {
	return &postService{
		repo:    repo,
		tagRepo: tagRepo,
	}
}

func (s *postService) CreateLibraryEntry(ctx context.Context, post *models.Post, tagNames []string, userRole string, userID int) error {
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

	if post.ImageURL != "" {
		cleanPath := strings.TrimPrefix(post.ImageURL, "/")
		fullPath := filepath.Join(".", cleanPath)
		if hash, err := s.generateBlurHash(fullPath); err == nil {
			post.BlurHash = hash
		} else {
			log.Printf("Archive Warning: BlurHash generation failed: %v", err)
		}
	}

	baseSlug := utils.GenerateSlug(post.Title)
	finalSlug, err := s.generateUniqueSlug(ctx, baseSlug)
	if err != nil {
		return fmt.Errorf("archive: slug generation failed: %w", err)
	}
	post.Slug = finalSlug

	return s.repo.WithTransaction(ctx, func(txRepo domain.PostRepo) error {
		if err := txRepo.Create(ctx, post); err != nil {
			return err
		}

		if len(tagNames) > 0 {
			if err := txRepo.SyncTags(ctx, post.ID, tagNames); err != nil {
				return fmt.Errorf("archive: tag sync failure: %w", err)
			}
		}
		return nil
	})
}

func (s *postService) UpdatePost(ctx context.Context, post *models.Post, tagNames []string, userRole string, userID int) error {
	if userRole != "admin" {
		return errors.New("unauthorized: system update restricted")
	}

	strict := bluemonday.StrictPolicy()
	ugc := bluemonday.UGCPolicy()

	post.Title = strict.Sanitize(post.Title)
	post.Content = ugc.Sanitize(post.Content)
	post.LastModifiedBy = userID

	if post.ImageURL != "" {
		cleanPath := strings.TrimPrefix(post.ImageURL, "/")
		fullPath := filepath.Join(".", cleanPath)
		if hash, err := s.generateBlurHash(fullPath); err == nil {
			post.BlurHash = hash
		}
	}

	return s.repo.WithTransaction(ctx, func(txRepo domain.PostRepo) error {
		if err := txRepo.Update(ctx, post); err != nil {
			return err
		}

		if tagNames != nil {
			if err := txRepo.SyncTags(ctx, post.ID, tagNames); err != nil {
				return err
			}
		}
		return nil
	})
}

func (s *postService) GetPostBySlug(ctx context.Context, slug string, currentUserID int) (*models.Post, error) {
	if slug == "" {
		return nil, errors.New("identifier required")
	}
	return s.repo.GetBySlug(ctx, slug, currentUserID)
}

func (s *postService) GetAllPosts(ctx context.Context, category, search string, tags []string, page, limit int, userRole string, currentUserID int) ([]models.Post, *models.PaginationMeta, error) {
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

	posts, total, err := s.repo.GetAll(ctx, category, search, tags, limit, offset, statusFilter, currentUserID)
	if err != nil {
		return nil, nil, err
	}

	totalPages := (total + limit - 1) / limit

	meta := &models.PaginationMeta{
		CurrentPage: page,
		TotalItems:  int(total),
		TotalPages:  int(totalPages),
		Limit:       limit,
		HasNextPage: page < int(totalPages),
		HasPrevPage: page > 1,
	}

	return posts, meta, nil
}

func (s *postService) DeletePost(ctx context.Context, id int, userRole string) error {
	if userRole != "admin" {
		return errors.New("unauthorized: purge restricted")
	}
	return s.repo.Delete(ctx, id)
}

func (s *postService) UpdateBlurHash(ctx context.Context, postID int, hash string) error {
	return s.repo.UpdateBlurHash(ctx, postID, hash)
}

func (s *postService) generateBlurHash(imagePath string) (string, error) {
	file, err := os.Open(imagePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	img, _, err := image.Decode(file)
	if err != nil {
		return "", err
	}

	return blurhash.Encode(4, 3, img)
}

func (s *postService) generateUniqueSlug(ctx context.Context, baseSlug string) (string, error) {
	currentSlug := baseSlug
	for i := 1; i <= 10; i++ {
		exists, err := s.repo.SlugExists(ctx, currentSlug)
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

func (s *postService) ToggleLike(ctx context.Context, userID, postID int) (bool, error) {
	return s.repo.ToggleLike(ctx, userID, postID)
}

func (s *postService) GetLikedPosts(ctx context.Context, userID int) ([]models.Post, error) {
	return s.repo.GetUserLikedPosts(ctx, userID)
}

func (s *postService) CleanupOrphanedFiles(ctx context.Context) (int, error) {
	activeFiles, err := s.repo.GetAllImageURLs(ctx)
	if err != nil {
		return 0, err
	}

	activeMap := make(map[string]bool)
	for _, url := range activeFiles {
		if url != "" {
			activeMap[filepath.Base(url)] = true
		}
	}

	uploadDir := "./uploads"
	files, err := os.ReadDir(uploadDir)
	if err != nil {
		return 0, err
	}

	removedCount := 0
	for _, file := range files {
		if file.IsDir() {
			continue
		}

		if !activeMap[file.Name()] {
			err := os.Remove(filepath.Join(uploadDir, file.Name()))
			if err == nil {
				removedCount++
			}
		}
	}

	return removedCount, nil
}
