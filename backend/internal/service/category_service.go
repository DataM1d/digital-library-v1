package service

import (
	"context"
	"errors"

	"github.com/DataM1d/digital-library/internal/domain"
	"github.com/DataM1d/digital-library/internal/models"
	"github.com/DataM1d/digital-library/pkg/utils"
	"github.com/microcosm-cc/bluemonday"
)

type categoryService struct {
	repo domain.CategoryRepo
}

func NewCategoryService(repo domain.CategoryRepo) domain.CategoryService {
	return &categoryService{repo: repo}
}

func (s *categoryService) CreateCategory(ctx context.Context, name, role string) (*models.Category, error) {
	if role != "admin" {
		return nil, errors.New("unauthorized: administrative privileges required")
	}

	p := bluemonday.StrictPolicy()
	cleanName := p.Sanitize(name)

	category := &models.Category{
		Name: cleanName,
		Slug: utils.GenerateSlug(cleanName),
	}

	if err := s.repo.Create(ctx, category); err != nil {
		return nil, err
	}

	return category, nil
}

func (s *categoryService) GetCategories(ctx context.Context) ([]models.Category, error) {
	return s.repo.GetAll(ctx)
}

func (s *categoryService) DeleteCategory(ctx context.Context, id int, role string) error {
	if role != "admin" {
		return errors.New("unauthorized: administrative privileges required")
	}

	return s.repo.Delete(ctx, id)
}
