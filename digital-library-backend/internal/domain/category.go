package domain

import (
	"context"

	"github.com/DataM1d/digital-library/internal/models"
)

type CategoryRepo interface {
	Create(ctx context.Context, c *models.Category) error
	GetAll(ctx context.Context) ([]models.Category, error)
	Delete(ctx context.Context, id int) error
}

type CategoryService interface {
	CreateCategory(ctx context.Context, name, role string) (*models.Category, error)
	GetCategories(ctx context.Context) ([]models.Category, error)
	DeleteCategory(ctx context.Context, id int, role string) error
}
