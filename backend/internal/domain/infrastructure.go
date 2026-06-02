package domain

import (
	"context"
	"io"

	"github.com/DataM1d/digital-library/internal/models"
)

type SlugRepo interface {
	SlugExists(ctx context.Context, slug string) (bool, error)
}

type SlugService interface {
	GenerateUniqueSlug(ctx context.Context, baseSlug string) (string, error)
}

type ImageService interface {
    Save(r io.Reader, filename string) (string, string, error)
    GenerateBlurHash(imageURL string) (string, error)
    CleanupOrphanedFiles(ctx context.Context, allActiveURLs []string) (int, error)
}

type Sanitizer interface {
	Sanitize(post *models.Post)
}
