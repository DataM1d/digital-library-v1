package domain

import "github.com/DataM1d/digital-library/internal/models"

type PostRepo interface {
	Create(p *models.Post) error
	Update(p *models.Post) error
	Delete(id int) error
	GetByID(id int) (*models.Post, error)
	GetBySlug(slug string, currentUserID int) (*models.Post, error)
	GetAll(category, search string, tags []string, limit, offset int, statusFilter string, currentUserID int) ([]models.Post, int, error)
	ToggleLike(userID, postID int) (bool, error)
	SlugExists(slug string) (bool, error)
	GetUserLikedPosts(userID int) ([]models.Post, error)
	UpdateBlurHash(id int, hash string) error
	WithTransaction(func(PostRepo) error) error
}

type CategoryRepo interface {
	Create(c *models.Category) error
	GetAll() ([]models.Category, error)
	Delete(id int) error
}

type CommentRepo interface {
	Create(c *models.Comment) error
	GetByPostID(postID int) ([]models.Comment, error)
}

type TagRepo interface {
	SyncPostTags(postID int, tagNames []string) error
}
