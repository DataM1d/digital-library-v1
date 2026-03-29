package main

import (
	"log"
	"net/http"
	"os"

	"github.com/DataM1d/digital-library/internal/handlers"
	"github.com/DataM1d/digital-library/internal/middleware"
	"github.com/DataM1d/digital-library/internal/repository"
	"github.com/DataM1d/digital-library/internal/service"
	"github.com/DataM1d/digital-library/pkg/database"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
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

	userRepo := repository.NewUserRepository(db)
	postRepo := repository.NewPostRepository(db)
	catRepo := repository.NewCategoryRepository(db)
	commentRepo := repository.NewCommentRepository(db)
	tagRepo := repository.NewTagRepository(db)

	userService := service.NewUserService(userRepo)
	postService := service.NewPostService(postRepo, tagRepo)
	catService := service.NewCategoryService(catRepo)
	commentService := service.NewCommentService(commentRepo, postRepo)

	authHandler := handlers.NewAuthHandler(userService)
	postHandler := handlers.NewPostHandler(postService)
	catHandler := handlers.NewCategoryHandler(catService)
	commentHandler := handlers.NewCommentHandler(commentService)

	r := gin.New()

	r.RedirectTrailingSlash = true
	r.RedirectFixedPath = true
	r.HandleMethodNotAllowed = true

	r.Use(gin.Recovery())
	r.Use(middleware.LoggerMiddleware())
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.SecurityMiddleware())
	r.Use(middleware.RateLimitMiddleware())

	r.MaxMultipartMemory = 8 << 20
	if _, err := os.Stat("./uploads"); os.IsNotExist(err) {
		os.MkdirAll("./uploads", 0755)
	}
	r.Static("/uploads", "./uploads")

	r.GET("/ping", func(c *gin.Context) {
		c.String(200, "pong")
	})

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		posts := api.Group("/posts")
		{
			posts.GET("", postHandler.GetPosts)
			posts.GET("/s/:slug", postHandler.GetBySlug)
			posts.GET("/categories", catHandler.GetCategories)
			posts.GET("/id/:id/comments", commentHandler.GetByPost)
		}

		user := api.Group("/user")
		user.Use(middleware.AuthMiddleware())
		{
			user.POST("/posts/id/:id/like", postHandler.ToggleLike)
			user.GET("/liked", postHandler.GetMyLikedPosts)
			user.POST("/posts/id/:id/comments", commentHandler.Create)
		}

		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(), middleware.AdminOnly())
		{
			admin.POST("/posts", postHandler.CreatePost)
			admin.PUT("/posts/:slug", postHandler.UpdatePost)
			admin.DELETE("/posts/:id", postHandler.DeletePost)
			admin.POST("/categories", catHandler.CreateCategory)
			admin.DELETE("/categories/:id", catHandler.DeleteCategory)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	log.Printf("Swedish Digital Library API starting on port %s", port)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Listen: %s\n", err)
	}
}
