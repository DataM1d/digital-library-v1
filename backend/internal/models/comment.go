package models

import "time"

type Comment struct {
	ID        int       `json:"id"`
	PostID    int       `json:"post_id"`
	UserID    int       `json:"user_id"`
	ParentID  *int      `json:"parent_id,omitempty"`
	Content   string    `json:"content"`
	Username  string    `json:"username,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	Replies   []Comment `json:"replies"`
}
