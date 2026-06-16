package service

import (
	"testing"

	"github.com/DataM1d/digital-library/internal/models"
)

func TestSanitizePost(t *testing.T) {
	s := NewSanitizer()
	alt := "Some Alt Text"
	post := &models.Post{
		Title:   "<script>alert('xss')</script> Safe Title",
		Content: "<p>Hello</p><script>evil()</script><b>World</b>",
		AltText: &alt,
	}

	s.Sanitize(post)

	if post.Title != "Safe Title" {
		t.Errorf("expected Title to be sanitized, got %s", post.Title)
	}

	if post.Content != "<p>Hello</p><b>World</b>" {
		t.Errorf("expected Content to be sanitized (UGC), got %s", post.Content)
	}

	if post.AltText == nil || *post.AltText != "Some Alt Text" {
		t.Errorf("expected AltText to be preserved, got %v", post.AltText)
	}
}

func TestSanitizePost_Nil(t *testing.T) {
	s := NewSanitizer()
	defer func() {
		if r := recover(); r != nil {
			t.Errorf("Sanitize panicked on nil: %v", r)
		}
	}()
	s.Sanitize(nil)
}

func TestSanitizeString(t *testing.T) {
	s := NewSanitizer()
	input := "<b>Hello</b><script>alert(1)</script>"

	// Strict test
	strictRes := s.SanitizeString(input, true)
	if strictRes != "Hello" {
		t.Errorf("expected strict sanitize to remove all tags, got %s", strictRes)
	}

	// UGC test
	ugcRes := s.SanitizeString(input, false)
	if ugcRes != "<b>Hello</b>" {
		t.Errorf("expected UGC sanitize to keep formatting, got %s", ugcRes)
	}
}