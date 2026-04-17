package models

import "time"

type Post struct {
	ID              int       `json:"id"`
	CreatedBy       int       `json:"created_by"`
	CategoryID      int       `json:"category_id"`
	LastModifiedBy  int       `json:"last_modified_by"`
	LikeCount       int       `json:"like_count"`
	Title           string    `json:"title"`
	Content         string    `json:"content"`
	ImageURL        string    `json:"image_url"`
	BlurHash        string    `json:"blur_hash"`
	Slug            string    `json:"slug"`
	Status          string    `json:"status"`
	AltText         *string   `json:"alt_text,omitempty"`
	MetaDescription *string   `json:"meta_description,omitempty"`
	OGImage         *string   `json:"og_image,omitempty"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}
