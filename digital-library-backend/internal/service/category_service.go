package service

import (
	"github.com/DataM1d/digital-library/internal/models"
	"github.com/DataM1d/digital-library/internal/repository"
	"github.com/DataM1d/digital-library/pkg/utils"
)

type CategoryService struct {
	repo *repository.CategoryRepository
}

func NewCategoryService(repo *repository.CategoryRepository) *CategoryService {
	return &CategoryService{repo: repo}
}

func (s *CategoryService) CreateCategory(name string) (*models.Category, error) {
	category := &models.Category{
		Name: name,
		Slug: utils.GenerateSlug(name),
	}
	err := s.repo.Create(category)
	return category, err
}

func (s *CategoryService) GetAllCategories() ([]models.Category, error) {
	return s.repo.GetAll()
}

func (s *CategoryService) DeleteCategory(id int) error {
	return s.repo.Delete(id)
}
