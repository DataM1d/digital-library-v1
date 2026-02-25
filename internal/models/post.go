package models

import "time"

type Category struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Slug string `json:"slug"`
}

type Tag struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type Post struct {
	ID           int       `json:"id"`
	Title        string    `json:"title"`
	Content      string    `json:"content"`
	ImageURL     string    `json:"image_url"`
	BlurHash     string    `json:"blur_hash"`
	Slug         string    `json:"slug"`
	UserID       int       `json:"user_id"`
	CategoryID   int       `json:"category_id"`
	CategoryName string    `json:"category_name"`
	Tags         []string  `json:"tags,omitempty"`
	LikeCount    int       `json:"like_count"`
	CreatedAt    time.Time `json:"created_at"`
}
