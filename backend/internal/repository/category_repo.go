package repository

import (
	"context"

	"github.com/DataM1d/digital-library/internal/domain"
	"github.com/DataM1d/digital-library/internal/models"
)

type CategoryRepository struct {
	db domain.DBTX
}

func NewCategoryRepository(db domain.DBTX) *CategoryRepository {
	return &CategoryRepository{db: db}
}

func (r *CategoryRepository) GetAll(ctx context.Context) ([]models.Category, error) {
	query := `SELECT id, name, slug, created_at FROM categories ORDER BY name ASC`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []models.Category
	for rows.Next() {
		var c models.Category
		if err := rows.Scan(&c.ID, &c.Name, &c.Slug, &c.CreatedAt); err != nil {
			return nil, err
		}
		categories = append(categories, c)
	}
	return categories, nil
}

func (r *CategoryRepository) Create(ctx context.Context, c *models.Category) error {
	query := `INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id`
	return r.db.QueryRowContext(ctx, query, c.Name, c.Slug).Scan(&c.ID)
}

func (r *CategoryRepository) Delete(ctx context.Context, id int) error {
	query := `DELETE FROM categories WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}
