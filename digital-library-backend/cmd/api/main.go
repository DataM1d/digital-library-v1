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

	host := os.Getenv("DB_HOST")
	portDB := os.Getenv("DB_PORT")
	userDB := os.Getenv("DB_USER")
	passDB := os.Getenv("DB_PASSWORD")
	nameDB := os.Getenv("DB_NAME")

	db, err := database.NewPostgresDB(host, portDB, userDB, passDB, nameDB)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	userRepo := repository.NewUserRepository(db)
	postRepo := repository.NewPostRepository(db)
	catRepo := repository.NewCategoryRepository(db)

	userService := service.NewUserService(userRepo)
	postService := service.NewPostService(postRepo)
	catService := service.NewCategoryService(catRepo)

	authHandler := handlers.NewAuthHandler(userService)
	postHandler := handlers.NewPostHandler(postService)
	catHandler := handlers.NewCategoryHandler(catService)

	r := gin.Default()

	r.Use(middleware.CORSMiddleware())

	if _, err := os.Stat("./uploads"); os.IsNotExist(err) {
		os.Mkdir("./uploads", 0755)
	}
	r.Static("/uploads", "./uploads")

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
		}

		user := api.Group("/user")
		user.Use(middleware.AuthMiddleware())
		{
			user.POST("/posts/like/:id", postHandler.ToggleLike)
			user.GET("/liked", postHandler.GetMyLikedPosts)
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

	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal(err)
	}
}
