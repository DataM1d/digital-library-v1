package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/DataM1d/digital-library/internal/domain"
	"github.com/DataM1d/digital-library/internal/models"
)

type postService struct {
	repo         domain.PostRepo
	tagRepo      domain.TagRepo
	imageService domain.ImageService
	slugService  domain.SlugService
	sanitizer    domain.Sanitizer
}

func NewPostService(
	repo domain.PostRepo,
	tagRepo domain.TagRepo,
	img domain.ImageService,
	slug domain.SlugService,
	san domain.Sanitizer,
) domain.PostService {
	return &postService{
		repo:         repo,
		tagRepo:      tagRepo,
		imageService: img,
		slugService:  slug,
		sanitizer:    san,
	}
}

func (s *postService) CreateLibraryEntry(ctx context.Context, post *models.Post, tagNames []string, userRole string, userID int) error {
	if userRole != "admin" {
		return errors.New("unauthorized")
	}

	// Logic moved to internal/service/sanitizer.go
	s.sanitizer.Sanitize(post)
	post.CreatedBy = userID

	if post.Status == "" {
		post.Status = "published"
	}

	// Logic moved to internal/service/slug_service.go
	finalSlug, err := s.slugService.GenerateUniqueSlug(ctx, post.Title)
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

	// Use the central sanitizer
	s.sanitizer.Sanitize(post)
	post.LastModifiedBy = userID

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

func (s *postService) UpdateBlurHashAsync(localPath string, postID int) {
	// Logic moved to internal/service/image_service.go
	hash, err := s.imageService.GenerateBlurHash(localPath)
	if err != nil {
		return
	}
	_ = s.repo.UpdateBlurHash(context.Background(), postID, hash)
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
	// Logic moved to internal/service/image_service.go
	return s.imageService.CleanupOrphanedFiles(ctx, activeFiles)
}
