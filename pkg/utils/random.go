package utils

import (
	"crypto/rand"
	"encoding/hex"
)

func RandomString(n int) string {
	bytes := make([]byte, n)
	if _, err := rand.Read(bytes); err != nil {
		return "err"
	}
	return hex.EncodeToString(bytes)
}
