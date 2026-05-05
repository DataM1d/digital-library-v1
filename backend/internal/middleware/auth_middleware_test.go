package middleware

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/DataM1d/digital-library/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
)

func TestAuthMiddleware(t *testing.T) {
	gin.SetMode(gin.TestMode)
	os.Setenv("JWT_SECRET", "test_secret")

	t.Run("Missing Authorization Header", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)

		c.Request = httptest.NewRequest("GET", "/", nil)

		handler := AuthMiddleware()
		handler(c)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
		assert.Contains(t, w.Body.String(), "Authorization header required")
	})

	t.Run("Invalid Authorization Format", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = httptest.NewRequest("GET", "/", nil)
		c.Request.Header.Set("Authorization", "InvalidTokenFormat")

		handler := AuthMiddleware()
		handler(c)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
		assert.Contains(t, w.Body.String(), "Invalid authorization format")
	})

	t.Run("Successful Authentication", func(t *testing.T) {
		claims := utils.Claims{
			UserID: 1,
			Role:   "user",
			RegisteredClaims: jwt.RegisteredClaims{
				ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
			},
		}
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		tokenString, _ := token.SignedString([]byte("test_secret"))

		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = httptest.NewRequest("GET", "/", nil)
		c.Request.Header.Set("Authorization", "Bearer "+tokenString)

		handler := AuthMiddleware()
		handler(c)

		assert.Equal(t, http.StatusOK, w.Code)
		val, exists := c.Get("user_id")
		assert.True(t, exists)
		assert.Equal(t, 1, val)
	})
}

func TestAdminOnly(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("Unauthorized Non-Admin Role", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Set("role", "user")

		handler := AdminOnly()
		handler(c)

		assert.Equal(t, http.StatusForbidden, w.Code)
	})

	t.Run("Authorized Admin Role", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Set("role", "admin")

		handler := AdminOnly()
		handler(c)

		assert.Equal(t, http.StatusOK, w.Code)
	})
}