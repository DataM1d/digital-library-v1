package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/DataM1d/digital-library/internal/handlers"
	customMiddleware "github.com/DataM1d/digital-library/internal/middleware"
	"github.com/DataM1d/digital-library/internal/repository"
	"github.com/DataM1d/digital-library/internal/service"
	"github.com/DataM1d/digital-library/pkg/database"
	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	db, err := database.NewPostgresDB(
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)
	if err != nil {
		log.Fatal("Could not connect to database: ", err)
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
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status": "ok"}`))
	})

	//PUBLIC ROUTES
	r.Group(func(r chi.Router) {
		r.With(customMiddleware.RateLimitMiddleware).Post("/register", authHandler.Register)
		r.With(customMiddleware.RateLimitMiddleware).Post("/login", authHandler.Login)
		r.Get("/posts", postHandler.GetPosts)
		r.Get("/posts/s/{slug}", postHandler.GetBySlug)
		r.Get("/categories", categoryHandler.GetCategories)
	})

	//PROTECTED ROUTES
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
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	})

	handler := c.Handler(r)

	srv := &http.Server{
		Addr:         ":8080",
		Handler:      handler,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	log.Println("Server starting on :8080...")
	log.Fatal(srv.ListenAndServe())
}
