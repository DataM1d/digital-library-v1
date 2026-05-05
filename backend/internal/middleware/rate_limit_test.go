package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestRateLimitMiddleware(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Run("Bypass Rate Limit For Localhost", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		c.Request = httptest.NewRequest("GET", "/", nil)
		c.Request.Header.Set("X-Forwarded-For", "127.0.0.1")

		handler := RateLimitMiddleware()
		handler(c)

		assert.Equal(t, http.StatusOK, w.Code)
	})

	t.Run("Enforce Rate Limit For External IPs", func(t *testing.T) {
		handler := RateLimitMiddleware()

		for i := 0; i < 15; i++ {
			w := httptest.NewRecorder()
			c, _ := gin.CreateTestContext(w)
			c.Request = httptest.NewRequest("GET", "/", nil)
			c.Request.Header.Set("X-Forwarded-For", "192.168.1.50")
			
			handler(c)

			if i < 10 {
				assert.NotEqual(t, http.StatusTooManyRequests, w.Code)
			} else {
				assert.Equal(t, http.StatusTooManyRequests, w.Code)
				break
			}
		}
	})
}