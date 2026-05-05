package dto

type PostResponse struct {
	ID           int      `json:"id"`
	Title        string   `json:"title"`
	Content      string   `json:"content"`
	ImageURL     string   `json:"image_url"`
	Slug         string   `json:"slug"`
	CategoryName string   `json:"category_name"`
	Tags         []string `json:"tags,omitempty"`
	LikeCount    int      `json:"like_count"`
	UserHasLiked bool     `json:"user_has_liked"`
	CreatedAt    string   `json:"created_at"`
}

type CreatePostRequest struct {
	Title           string   `json:"title"`
	Content         string   `json:"content"`
	CategoryID      int      `json:"category_id"`
	ImageURL        string   `json:"image_url"`
	Status          string   `json:"status"`
	AltText         *string  `json:"alt_text"`
	MetaDescription *string  `json:"meta_description"`
	Tags            []string `json:"tags"`
}
