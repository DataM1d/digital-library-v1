package service

import (
	"github.com/DataM1d/digital-library/internal/models"
	"github.com/microcosm-cc/bluemonday"
)

type sanitizer struct {
	strictPolicy *bluemonday.Policy
	ugcPolicy    *bluemonday.Policy
}

func NewSanitizer() *sanitizer {
	return &sanitizer{
		strictPolicy: bluemonday.StrictPolicy(),
		ugcPolicy:    bluemonday.UGCPolicy(),
	}
}

func (s *sanitizer) Sanitize(post *models.Post) {
	if post == nil {
		return
	}

	post.Title = s.strictPolicy.Sanitize(post.Title)
	post.Content = s.ugcPolicy.Sanitize(post.Content)

	if post.AltText != nil {
		sanitizedAlt := s.strictPolicy.Sanitize(*post.AltText)
		post.AltText = &sanitizedAlt
	}
}

func (s *sanitizer) SanitizeString(input string, strict bool) string {
	if strict {
		return s.strictPolicy.Sanitize(input)
	}
	return s.ugcPolicy.Sanitize(input)
}
