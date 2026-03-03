package middleware

import (
	"net/http"
	"sync"

	"github.com/DataM1d/digital-library/pkg/utils"

	"golang.org/x/time/rate"
)

var (
	limiters = make(map[string]*rate.Limiter)
	mu       sync.Mutex
)

func getLimiter(ip string) *rate.Limiter {
	mu.Lock()
	defer mu.Unlock()

	if _, exists := limiters[ip]; !exists {
		limiters[ip] = rate.NewLimiter(rate.Limit(5.0/60.0), 3)
	}

	return limiters[ip]
}

func RateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := r.RemoteAddr

		limiter := getLimiter(ip)
		if !limiter.Allow() {
			utils.JSONError(w, "Too many requests. Please slow down.", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, r)
	})
}
