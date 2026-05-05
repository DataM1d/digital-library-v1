package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

type client struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

var (
	clients = make(map[string]*client)
	mu      sync.Mutex
)

func init() {
	go cleanupLimiters()
}

func cleanupLimiters() {
	for {
		time.Sleep(time.Minute)
		mu.Lock()
		for ip, c := range clients {
			if time.Since(c.lastSeen) > 3*time.Minute {
				delete(clients, ip)
			}
		}
		mu.Unlock()
	}
}

func getLimiter(ip string) *rate.Limiter {
	mu.Lock()
	defer mu.Unlock()

	v, exists := clients[ip]
	if !exists {
		limiter := rate.NewLimiter(rate.Limit(5), 10)
		v = &client{limiter: limiter}
		clients[ip] = v
	}

	v.lastSeen = time.Now()
	return v.limiter
}

func RateLimitMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()

		if ip == "127.0.0.1" || ip == "::1" {
			c.Next()
			return
		}

		limiter := getLimiter(ip)
		if !limiter.Allow() {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "Archive synchronization limit reached. Please wait.",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}
