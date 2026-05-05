package utils

import (
	"testing"
)

func TestGenerateSlug(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{{
		name:     "Simple title",
		input:    "Hello World",
		expected: "hello-world",
	},
		{
			name:     "Multiple spaces and casing",
			input:    "  The Digital   Archive  ",
			expected: "the-digital-archive",
		},
		{
			name:     "Special characters",
			input:    "Golang & Next.js: The Future!",
			expected: "golang-nextjs-the-future",
		},
		{
			name:     "Swedish characters (Normalization check)",
			input:    "Böcker och Miljö",
			expected: "bocker-och-miljo",
		},
		{
			name:     "Numbers and hyphens",
			input:    "Version 2.0-Alpha",
			expected: "version-20-alpha",
		},
		{
			name:     "Only special characters",
			input:    "!!! $$$ ***",
			expected: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			actual := GenerateSlug(tt.input)
			if actual != tt.expected {
				t.Errorf("GenerateSlug(%q) = %q; want %q", tt.input, actual, tt.expected)
			}
		})
	}
}

func BenchMarkGenerateSlug(b *testing.B) {
	input := "The Digital Archive: A High Performance Project"
	for i := 0; i < b.N; i++ {
		GenerateSlug(input)
	}
}
