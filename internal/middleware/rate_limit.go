package middleware

import (
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/BryanPMX/CECAE-platform/internal/application"
	httptransport "github.com/BryanPMX/CECAE-platform/internal/transport/http"
)

// LoginRateLimiter applies a small fixed-window limit per remote IP.
type LoginRateLimiter struct {
	maxAttempts int
	window      time.Duration
	now         func() time.Time
	mu          sync.Mutex
	attempts    map[string]loginAttemptWindow
}

type loginAttemptWindow struct {
	count    int
	resetAt  time.Time
	lastSeen time.Time
}

// NewLoginRateLimiter creates the login rate limiter.
func NewLoginRateLimiter(maxAttempts int, window time.Duration) *LoginRateLimiter {
	return &LoginRateLimiter{
		maxAttempts: maxAttempts,
		window:      window,
		now:         func() time.Time { return time.Now().UTC() },
		attempts:    map[string]loginAttemptWindow{},
	}
}

// Middleware limits requests before they reach the login handler.
func (l *LoginRateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !l.allow(clientIP(r)) {
			httptransport.WriteError(w, application.RateLimited("too many login attempts"))
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (l *LoginRateLimiter) allow(key string) bool {
	now := l.now()
	l.mu.Lock()
	defer l.mu.Unlock()

	window := l.attempts[key]
	if window.resetAt.IsZero() || !now.Before(window.resetAt) {
		l.attempts[key] = loginAttemptWindow{
			count:    1,
			resetAt:  now.Add(l.window),
			lastSeen: now,
		}
		l.pruneLocked(now)
		return true
	}

	window.count++
	window.lastSeen = now
	l.attempts[key] = window
	return window.count <= l.maxAttempts
}

func (l *LoginRateLimiter) pruneLocked(now time.Time) {
	for key, window := range l.attempts {
		if now.Sub(window.lastSeen) > 2*l.window {
			delete(l.attempts, key)
		}
	}
}

func clientIP(r *http.Request) string {
	if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
		forwarded = strings.TrimSpace(strings.Split(forwarded, ",")[0])
		host, _, err := net.SplitHostPort(forwarded)
		if err == nil {
			return host
		}
		return forwarded
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}
