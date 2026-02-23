package models

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
	ID           int      `json:"id"`
	Title        string   `json:"title"`
	Content      string   `json:"content"`
	CategoryID   int      `json:"category_id"`
	CategoryName string   `json:"category_name,omitempty"`
	Tags         []string `json:"tags,omitempty"`
}
