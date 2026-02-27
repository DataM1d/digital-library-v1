package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/DataM1d/digital-library/internal/handlers"
	customMiddleware "github.com/DataM1d/digital-library/internal/middleware"
	"github.com/DataM1d/digital-library/internal/repository"
	"github.com/DataM1d/digital-library/internal/service"
	"github.com/DataM1d/digital-library/pkg/database"
	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"
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

	//REPOSITORIES
	postRepo := repository.NewPostRepository(db)
	userRepo := repository.NewUserRepository(db)
	commentRepo := repository.NewCommentRepository(db)

	//SERVICES
	postService := service.NewPostService(postRepo)
	commentService := service.NewCommentService(commentRepo)

	//HANDLERS
	postHandler := handlers.NewPostHandler(postService)
	authHandler := handlers.NewAuthHandler(userRepo)
	commentHandler := handlers.NewCommentHandler(commentService)

	r := chi.NewRouter()

	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.StripSlashes)
	r.Use(chimiddleware.Recoverer)

	//STATIC FILES
	workDir, _ := os.Getwd()
	filesDir := http.Dir(filepath.Join(workDir, "uploads"))
	r.Handle("/uploads/*", http.StripPrefix("/uploads/", http.FileServer(filesDir)))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status": "ok"}`))
	})

	//PUBLIC
	r.Group(func(r chi.Router) {
		r.Post("/register", authHandler.Register)
		r.Post("/login", authHandler.Login)
		r.Get("/posts", postHandler.GetPosts)
		r.Get("/posts/s/{slug}", postHandler.GetBySlug)
	})

	//PROTECTED
	r.Group(func(r chi.Router) {
		r.Use(customMiddleware.AuthMiddleware)

		r.Post("/posts", postHandler.CreatePost)
		r.Put("/posts/{id}", postHandler.UpdatePost)
		r.Delete("/posts/{id}", postHandler.DeletePost)
		r.Post("/posts/{id}/like", postHandler.ToggleLike)
		r.Post("/posts/{id}/comments", commentHandler.CreateComment)
		r.Post("/upload", postHandler.UploadImage)
	})

	log.Println("Server starting on :8080...")
	http.ListenAndServe(":8080", r)
}
