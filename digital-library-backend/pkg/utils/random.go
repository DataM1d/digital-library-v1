package utils

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
)

func RandomString(n int) string {
	bytes := make([]byte, n)
	_, err := rand.Read(bytes)
	if err != nil {
		return fmt.Sprintf("fallback-%d", n)
	}
	return hex.EncodeToString(bytes)
}

func RandomHex(n int) (string, error) {
	bytes := make([]byte, n)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
