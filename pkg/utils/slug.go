package utils

import (
	"regexp"
	"strings"
)

func GenerateSlug(title string) string {
	slug := strings.ToLower(title)

	re := regexp.MustCompile(`[^a-z0-9\s]+`)
	slug = re.ReplaceAllString(slug, "")

	slug = strings.ReplaceAll(slug, " ", "-")

	re = regexp.MustCompile(`-+`)
	slug = re.ReplaceAllString(slug, "-")

	return strings.Trim(slug, "-")
}
