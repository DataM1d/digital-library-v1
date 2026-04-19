package domain

import (
	"context"

	"github.com/DataM1d/digital-library/internal/models"
)

type PostRepo interface {
	Create(ctx context.Context, p *models.Post) error
	Update(ctx context.Context, p *models.Post) error
	SyncTags(ctx context.Context, postID int, tagNames []string) error
	Delete(ctx context.Context, id int) error
	GetByID(ctx context.Context, id int) (*models.Post, error)
	GetBySlug(ctx context.Context, slug string, currentUserID int) (*models.Post, error)
	GetAll(ctx context.Context, category, search string, tags []string, limit, offset int, statusFilter string, currentUserID int) ([]models.Post, int, error)
	ToggleLike(ctx context.Context, userID, postID int) (bool, error)
	SlugExists(ctx context.Context, slug string) (bool, error)
	GetUserLikedPosts(ctx context.Context, userID int) ([]models.Post, error)
	UpdateBlurHash(ctx context.Context, id int, hash string) error
	WithTransaction(ctx context.Context, fn func(PostRepo) error) error
	GetAllImageURLs(ctx context.Context) ([]string, error)
}

type PostService interface {
	CreateLibraryEntry(ctx context.Context, post *models.Post, tagNames []string, userRole string, userID int) error
	UpdatePost(ctx context.Context, post *models.Post, tagNames []string, userRole string, userID int) error
	DeletePost(ctx context.Context, id int, userRole string) error
	GetPostBySlug(ctx context.Context, slug string, currentUserID int) (*models.Post, error)
	GetAllPosts(ctx context.Context, category, search string, tags []string, page, limit int, userRole string, currentUserID int) ([]models.Post, *models.PaginationMeta, error)
	ToggleLike(ctx context.Context, userID, postID int) (bool, error)
	GetLikedPosts(ctx context.Context, userID int) ([]models.Post, error)
	UpdateBlurHash(ctx context.Context, postID int, hash string) error
}

type TagRepo interface {
	SyncPostTags(ctx context.Context, postID int, tagNames []string) error
}
