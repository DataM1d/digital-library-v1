package utils

import (
	"strings"
	"unicode"
)

func GenerateSlug(title string) string {
	var buf strings.Builder
	buf.Grow(len(title))
	lastWasDash := true

	for _, r := range strings.ToLower(title) {
		switch {
		case unicode.IsLetter(r) || unicode.IsDigit(r):
			buf.WriteRune(r)
			lastWasDash = false
		case unicode.IsSpace(r) || r == '-' || r == '_':
			if !lastWasDash {
				buf.WriteRune('-')
				lastWasDash = true
			}
		}
	}

	s := buf.String()

	return strings.TrimSuffix(s, "-")
}
