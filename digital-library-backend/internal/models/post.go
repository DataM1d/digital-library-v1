package models

import "time"

type Post struct {
	ID              int
	CreatedBy       int
	CategoryID      int
	LastModifiedBy  int
	LikeCount       int
	Title           string
	Content         string
	ImageURL        string
	BlurHash        string
	Slug            string
	Status          string
	AltText         *string
	MetaDescription *string
	OGImage         *string
	CreatedAt       time.Time
	UpdatedAt       time.Time
	CategoryName    string
	UserHasLiked    bool
	Tags            []string
}
