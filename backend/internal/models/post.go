package models

import "time"

type Post struct {
    ID              int       `json:"id,string"`
    CreatedBy       int       `json:"created_by,string"`
    CategoryID      int       `json:"category_id,string"`
    LastModifiedBy  int       `json:"last_modified_by,string"`
    IsPermanent     bool      `json:"is_permanent"`
    AspectRatio     string    `json:"aspect_ratio"`
    LikeCount       int       `json:"like_count"`
    Title           string    `json:"title"`
    Content         string    `json:"content"`
    ImageURL        string    `json:"image_url"`
    BlurHash        string    `json:"blur_hash"`
    Slug            string    `json:"slug"`
    Status          string    `json:"status"`
    AltText         *string   `json:"alt_text"`
    MetaDescription *string   `json:"meta_description"`
    OGImage         *string   `json:"og_image"`
    CreatedAt       time.Time `json:"created_at"`
    UpdatedAt       time.Time `json:"updated_at"`
    CategoryName    string    `json:"category_name"`
    UserHasLiked    bool      `json:"user_has_liked"`
    Tags            []string  `json:"tags"`
}