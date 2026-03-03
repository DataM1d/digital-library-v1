package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"github.com/DataM1d/digital-library/internal/handlers"
	customMiddleware "github.com/DataM1d/digital-library/internal/middleware"
	"github.com/DataM1d/digital-library/internal/repository"
	"github.com/DataM1d/digital-library/internal/service"
	"github.com/DataM1d/digital-library/pkg/database"
	"github.com/DataM1d/digital-library/pkg/utils"
	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
	_ = godotenv.Load()

	uploadsDir := "./uploads"
	if _, err := os.Stat(uploadsDir); os.IsNotExist(err) {
		_ = os.MkdirAll(uploadsDir, 0755)
	}

	db, err := database.NewPostgresDB(
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	postRepo := repository.NewPostRepository(db)
	userRepo := repository.NewUserRepository(db)
	commentRepo := repository.NewCommentRepository(db)
	categoryRepo := repository.NewCategoryRepository(db)

	postService := service.NewPostService(postRepo)
	commentService := service.NewCommentService(commentRepo)
	categoryService := service.NewCategoryService(categoryRepo)
	userService := service.NewUserService(userRepo)

	postHandler := handlers.NewPostHandler(postService)
	authHandler := handlers.NewAuthHandler(userService)
	commentHandler := handlers.NewCommentHandler(commentService)
	categoryHandler := handlers.NewCategoryHandler(categoryService)

	r := chi.NewRouter()

	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.StripSlashes)
	r.Use(chimiddleware.Recoverer)

	workDir, _ := os.Getwd()
	filesDir := http.Dir(filepath.Join(workDir, "uploads"))
	r.Handle("/uploads/*", http.StripPrefix("/uploads/", http.FileServer(filesDir)))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		utils.JSONResponse(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	r.Group(func(r chi.Router) {
		r.With(customMiddleware.RateLimitMiddleware).Post("/register", authHandler.Register)
		r.With(customMiddleware.RateLimitMiddleware).Post("/login", authHandler.Login)
		r.Get("/posts", postHandler.GetPosts)
		r.Get("/posts/s/{slug}", postHandler.GetBySlug)
		r.Get("/categories", categoryHandler.GetCategories)
	})

	r.Group(func(r chi.Router) {
		r.Use(customMiddleware.AuthMiddleware)
		r.Post("/categories", categoryHandler.CreateCategory)
		r.Delete("/categories/{id}", categoryHandler.DeleteCategory)
		r.Get("/users/me/likes", postHandler.GetMyLikedPosts)
		r.With(customMiddleware.RateLimitMiddleware).Post("/upload", postHandler.UploadImage)
		r.Post("/posts", postHandler.CreatePost)
		r.Put("/posts/{id}", postHandler.UpdatePost)
		r.Delete("/posts/{id}", postHandler.DeletePost)
		r.Post("/posts/{id}/like", postHandler.ToggleLike)
		r.Post("/posts/{id}/comments", commentHandler.CreateComment)
	})

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
		MaxAge:           300,
	})

	srv := &http.Server{
		Addr:         ":8080",
		Handler:      c.Handler(r),
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	go func() {
		log.Println("Starting server on :8080")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal(err)
	}
}
