package main

import (
	"log"
	"net/http"
	"os"

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

	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	pass := os.Getenv("DB_PASSWORD")
	name := os.Getenv("DB_NAME")

	db, err := database.NewPostgresDB(host, port, user, pass, name)
	if err != nil {
		log.Fatal("Could not connect to database: ", err)
	}
	defer db.Close()

	postRepo := repository.NewPostRepository(db)
	userRepo := repository.NewUserRepository(db)

	postService := service.NewPostService(postRepo)

	postHandler := handlers.NewPostHandler(postService)
	authHandler := handlers.NewAuthHandler(userRepo)

	commentRepo := repository.NewCommentRepository(db)
	commentService := service.NewCommentService(commentRepo)
	commentHandler := handlers.NewCommentHandler(commentService)

	r := chi.NewRouter()

	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.StripSlashes)
	r.Use(chimiddleware.Recoverer)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status": "ok"}`))
	})

	r.Post("/register", authHandler.Register)
	r.Post("/login", authHandler.Login)

	r.Group(func(r chi.Router) {
		r.Get("/posts", postHandler.GetPosts)
		r.Get("/posts/{id}", postHandler.GetPosts)
		r.Get("/posts/{id}/comments", commentHandler.GetComments)
	})

	r.Group(func(r chi.Router) {
		r.Use(customMiddleware.AuthMiddleware)
		r.Post("/posts", postHandler.CreatePost)
		r.Post("/posts/{id}/like", postHandler.ToggleLike)
		r.Post("/posts/{id}/comments", commentHandler.CreateComment)
	})

	log.Println("Server starting on :8080...")
	log.Printf("V2 Roadmap: Public routes enabled. Ready for endless scroll.")
	http.ListenAndServe(":8080", r)
}
