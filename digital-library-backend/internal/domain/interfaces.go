package domain

import (
	"context"
	"database/sql"

	"github.com/DataM1d/digital-library/internal/models"
)

type DBTX interface {
	ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
	PrepareContext(ctx context.Context, query string) (*sql.Stmt, error)
	QueryContext(ctx context.Context, query string, args ...interface{}) (*sql.Rows, error)
	QueryRowContext(ctx context.Context, query string, args ...interface{}) *sql.Row
}
type PostRepo interface {
	Create(ctx context.Context, p *models.Post) error
	Update(ctx context.Context, p *models.Post) error
	Delete(ctx context.Context, id int) error
	GetByID(ctx context.Context, id int) (*models.Post, error)
	GetBySlug(ctx context.Context, slug string, currentUserID int) (*models.Post, error)
	GetAll(ctx context.Context, category, search string, tags []string, limit, offset int, statusFilter string, currentUserID int) ([]models.Post, int, error)
	ToggleLike(ctx context.Context, userID, postID int) (bool, error)
	SlugExists(ctx context.Context, slug string) (bool, error)
	GetUserLikedPosts(ctx context.Context, userID int) ([]models.Post, error)
	UpdateBlurHash(ctx context.Context, id int, hash string) error
	WithTransaction(ctx context.Context, fn func(PostRepo) error) error
}

type CategoryRepo interface {
	Create(ctx context.Context, c *models.Category) error
	GetAll(ctx context.Context) ([]models.Category, error)
	Delete(ctx context.Context, id int) error
}

type CommentRepo interface {
	Create(ctx context.Context, c *models.Comment) error
	GetByPostID(ctx context.Context, postID int) ([]models.Comment, error)
}

type TagRepo interface {
	SyncPostTags(ctx context.Context, postID int, tagNames []string) error
}

type UserRepo interface {
	Create(ctx context.Context, user *models.User) error
	GetByEmail(ctx context.Context, email string) (*models.User, error)
	GetByID(ctx context.Context, id int) (*models.User, error)
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

type UserService interface {
	Register(ctx context.Context, username, email, password string) (*models.User, error)
	Login(ctx context.Context, email, password string) (string, *models.User, error)
}

type CategoryService interface {
	CreateCategory(ctx context.Context, name, role string) (*models.Category, error)
	GetCategories(ctx context.Context) ([]models.Category, error)
	DeleteCategory(ctx context.Context, id int, role string) error
}

type CommentService interface {
	AddComment(ctx context.Context, postID, userID int, content string, parentID *int) (*models.Comment, error)
	GetCommentsByPost(ctx context.Context, postID int) ([]models.Comment, error)
}
