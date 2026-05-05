package utils

import (
	"strings"
	"unicode"

	"golang.org/x/text/runes"
	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"
)

func GenerateSlug(s string) string {
	t := transform.Chain(norm.NFD, runes.Remove(runes.In(unicode.Mn)), norm.NFC)
	result, _, _ := transform.String(t, s) // Normalize and strip accents.

	var buf strings.Builder
	buf.Grow(len(result))

	lastWasDash := true

	for _, r := range result {
		switch {
		case unicode.IsLetter(r) || unicode.IsDigit(r):
			buf.WriteRune(unicode.ToLower(r))
			lastWasDash = false
		case r == ' ' || r == '-' || r == '_':
			if !lastWasDash {
				buf.WriteByte('-')
				lastWasDash = true
			}
		}
	}

	res := buf.String()

	return strings.TrimRight(res, "-")
}
