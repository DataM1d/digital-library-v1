package models

type Like struct {
	ID     int `json:"id"`
	UserID int `json:"user_id"`
	PostID int `json:"post_id"`
}

type PaginationMeta struct {
	TotalItems  int  `json:"total_items"`
	TotalPages  int  `json:"total_pages"`
	CurrentPage int  `json:"current_page"`
	Limit       int  `json:"limit"`
	HasNextPage bool `json:"has_next_page"`
	HasPrevPage bool `json:"has_prev_page"`
}
