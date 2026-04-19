package service

import (
	"context"
	"fmt"

	"github.com/DataM1d/digital-library/internal/domain"
	"github.com/DataM1d/digital-library/pkg/utils"
)

type slugService struct {
	repo domain.PostRepo
}

func NewSlugService(r domain.PostRepo) *slugService {
	return &slugService{repo: r}
}

func (s *slugService) GenerateUniqueSlug(ctx context.Context, title string) (string, error) {
	baseSlug := utils.GenerateSlug(title)
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
