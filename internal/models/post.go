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
	ID             int       `json:"id"`
	Title          string    `json:"title"`
	Content        string    `json:"content"`
	ImageURL       string    `json:"image_url"`
	BlurHash       string    `json:"blur_hash"`
	AltText        string    `json:"alt_text"`
	Slug           string    `json:"slug"`
	Status         string    `json:"status"`
	CategoryID     int       `json:"category_id"`
	CategoryName   string    `json:"category_name"`
	CreatedBy      int       `json:"created_by"`
	LastModifiedBy int       `json:"last_modified_by"`
	Tags           []string  `json:"tags,omitempty"`
	LikeCount      int       `json:"like_count"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
