package main

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/BryanPMX/CECAE-platform/internal/application"
	"github.com/BryanPMX/CECAE-platform/internal/config"
	"github.com/BryanPMX/CECAE-platform/internal/database"
	"github.com/BryanPMX/CECAE-platform/internal/logger"
	"github.com/BryanPMX/CECAE-platform/internal/middleware"
	"github.com/BryanPMX/CECAE-platform/internal/repository"
	"github.com/BryanPMX/CECAE-platform/internal/security"
	"github.com/BryanPMX/CECAE-platform/internal/storage"
	httptransport "github.com/BryanPMX/CECAE-platform/internal/transport/http"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func main() {
	os.Exit(run())
}

func run() int {
	cfg, err := config.Load()
	if err != nil {
		fallbackLogger().Error("configuration failed", slog.Any("error", err))
		return 1
	}

	log := logger.New(cfg.App)
	slog.SetDefault(log)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	pool, err := database.Connect(ctx, cfg.Database)
	if err != nil {
		log.Error("database connection failed", slog.Any("error", err))
		return 1
	}
	defer pool.Close()

	validator, err := httptransport.NewValidator()
	if err != nil {
		log.Error("validator initialization failed", slog.Any("error", err))
		return 1
	}

	adminRepository := repository.NewPostgresAdminRepository(pool)
	eventRepository := repository.NewPostgresEventRepository(pool)
	tokenManager := security.NewTokenManager(cfg.Auth)
	authService := application.NewAuthService(
		adminRepository,
		security.NewPasswordHasher(),
		tokenIssuerAdapter{manager: tokenManager},
		security.NewRefreshTokenManager(cfg.Auth),
	)
	eventService := application.NewEventService(eventRepository)
	imageStorage := storage.NewLocalImageStorage(cfg.Uploads.Directory)
	imageUploadService := application.NewImageUploadService(imageStorage, cfg.Uploads.MaxImageBytes)

	server := &http.Server{
		Addr: cfg.Address(),
		Handler: buildRouter(routerDependencies{
			Pinger:     pool,
			CORS:       cfg.CORS,
			Logger:     log,
			Validator:  validator,
			Auth:       authService,
			Events:     eventService,
			Images:     imageUploadService,
			Uploads:    cfg.Uploads,
			Production: cfg.IsProduction(),
		}),
		ReadTimeout:  cfg.HTTP.ReadTimeout,
		WriteTimeout: cfg.HTTP.WriteTimeout,
		IdleTimeout:  cfg.HTTP.IdleTimeout,
	}

	serverErrors := make(chan error, 1)
	go func() {
		log.Info("api listening", slog.String("address", cfg.Address()))
		serverErrors <- server.ListenAndServe()
	}()

	select {
	case err := <-serverErrors:
		if errors.Is(err, http.ErrServerClosed) {
			return 0
		}
		log.Error("api server failed", slog.Any("error", err))
		return 1
	case <-ctx.Done():
		log.Info("shutdown requested")
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), cfg.HTTP.ShutdownTimeout)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Error("graceful shutdown failed", slog.Any("error", err))
		return 1
	}

	log.Info("api stopped")
	return 0
}

type healthPinger interface {
	Ping(context.Context) error
}

type routerDependencies struct {
	Pinger     healthPinger
	CORS       config.CORSConfig
	Logger     *slog.Logger
	Validator  *httptransport.Validator
	Auth       httptransport.AuthService
	Events     httptransport.EventService
	Images     httptransport.ImageUploadService
	Uploads    config.UploadsConfig
	Production bool
}

func buildRouter(deps routerDependencies) http.Handler {
	router := chi.NewRouter()
	log := deps.Logger
	if log == nil {
		log = fallbackLogger()
	}

	router.Use(middleware.RequestID())
	router.Use(middleware.SecurityHeaders(deps.Production))
	router.Use(middleware.Recoverer(log))
	router.Use(middleware.RequestLogger(log))
	if len(deps.CORS.AllowedOrigins) > 0 {
		router.Use(middleware.CORS(deps.CORS))
	}

	router.Get("/", func(w http.ResponseWriter, r *http.Request) {
		writeRoot(w)
	})

	healthHandler := func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), time.Second)
		defer cancel()

		if err := deps.Pinger.Ping(ctx); err != nil {
			writeHealthForRequest(w, r, http.StatusServiceUnavailable, "unavailable")
			return
		}

		writeHealthForRequest(w, r, http.StatusOK, "ok")
	}
	router.Get("/healthz", healthHandler)
	router.Head("/healthz", healthHandler)
	if deps.Uploads.Directory != "" {
		router.Handle("/uploads/*", uploadedFilesHandler(deps.Uploads.Directory))
	}

	if deps.Auth != nil && deps.Validator != nil {
		authHandler := httptransport.NewAuthHandler(deps.Auth, deps.Validator)
		loginLimiter := middleware.NewLoginRateLimiter(5, 5*time.Minute)

		router.With(loginLimiter.Middleware).Post("/api/admin/auth/login", authHandler.Login)
		router.Post("/api/admin/auth/refresh", authHandler.Refresh)
		router.Post("/api/admin/auth/logout", authHandler.Logout)
	}

	if deps.Events != nil && deps.Validator != nil {
		eventHandler := httptransport.NewEventHandler(deps.Events, deps.Validator)

		router.Get("/api/events", eventHandler.ListPublic)
		router.Get("/api/events/featured", eventHandler.ListFeatured)
		router.Get("/api/events/{id}", eventHandler.GetPublic)

		if deps.Auth != nil {
			router.Group(func(admin chi.Router) {
				admin.Use(middleware.RequireAdmin(deps.Auth))
				admin.Get("/api/admin/events", eventHandler.ListAdmin)
				admin.Get("/api/admin/events/{id}", eventHandler.GetAdmin)
				admin.Post("/api/admin/events", eventHandler.CreateAdmin)
				admin.Put("/api/admin/events/{id}", eventHandler.UpdateAdmin)
				admin.Patch("/api/admin/events/{id}", eventHandler.PatchAdmin)
				admin.Delete("/api/admin/events/{id}", eventHandler.DeleteAdmin)
				if deps.Images != nil {
					imageUploadHandler := httptransport.NewImageUploadHandler(
						deps.Images,
						deps.Uploads.MaxImageBytes,
						deps.Uploads.PublicBaseURL,
					)
					admin.Post("/api/admin/events/images", imageUploadHandler.UploadEventImage)
				}
			})
		}
	}

	return router
}

func uploadedFilesHandler(rootDir string) http.Handler {
	fileServer := http.StripPrefix("/uploads", http.FileServer(http.Dir(rootDir)))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, "/") {
			http.NotFound(w, r)
			return
		}
		w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
		fileServer.ServeHTTP(w, r)
	})
}

func writeRoot(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"service": "cecae-api",
		"status":  "ok",
		"health":  "/healthz",
		"api":     "/api",
	})
}

func writeHealthForRequest(w http.ResponseWriter, r *http.Request, statusCode int, status string) {
	if r.Method == http.MethodHead {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(statusCode)
		return
	}
	writeHealth(w, statusCode, status)
}

func writeHealth(w http.ResponseWriter, statusCode int, status string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(map[string]string{"status": status})
}

func fallbackLogger() *slog.Logger {
	return slog.New(slog.NewJSONHandler(os.Stderr, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
}

type tokenIssuerAdapter struct {
	manager security.TokenManager
}

func (a tokenIssuerAdapter) IssueAccessToken(adminUserID uuid.UUID, now time.Time) (application.IssuedToken, error) {
	token, err := a.manager.IssueAccessToken(adminUserID, now)
	return application.IssuedToken{
		Value:     token.Value,
		ExpiresAt: token.ExpiresAt,
	}, err
}

func (a tokenIssuerAdapter) VerifyAccessToken(value string) (application.AccessClaims, error) {
	claims, err := a.manager.VerifyAccessToken(value)
	return application.AccessClaims{
		AdminUserID: claims.AdminUserID,
		ExpiresAt:   claims.ExpiresAt,
	}, err
}

func (a tokenIssuerAdapter) RefreshTokenTTL() time.Duration {
	return a.manager.RefreshTokenTTL()
}
