package utils

import (
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"os"
	"path/filepath"
	"strings"

	"github.com/bbrks/go-blurhash"
	_ "golang.org/x/image/webp"
)

func GenerateBlurHash(imagePath string, xComponents, yComponents int) (string, error) {
	trimmedPath := strings.TrimPrefix(imagePath, "/")
	fullPath := filepath.Join(".", trimmedPath)

	file, err := os.Open(fullPath)
	if err != nil {
		return "", fmt.Errorf("failed to open image: %w", err)
	}
	defer file.Close()

	img, _, err := image.Decode(file)
	if err != nil {
		return "", fmt.Errorf("failed to decode image: %w", err)
	}

	hash, err := blurhash.Encode(xComponents, yComponents, img)
	if err != nil {
		return "", fmt.Errorf("failed to encode blurhash: %w", err)
	}

	return hash, nil
}
