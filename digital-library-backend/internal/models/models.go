package models

type Like struct {
	ID     int `json:"id"`
	UserID int `json:"user_id"`
	PostID int `json:"post_id"`
}

type PaginationMeta struct {
	CurrentPage int   `json:"current_page"`
	TotalItems  int64 `json:"total_items"`
	TotalPages  int   `json:"total_pages"`
	Limit       int   `json:"limit"`
}
