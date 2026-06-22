package models

import "time"

type Comment struct {
    ID        int       `json:"id,string"`
    PostID    int       `json:"post_id,string"`
    UserID    int       `json:"user_id,string"`
    ParentID  *int      `json:"parent_id,omitempty,string"`
	Content   string    `json:"content"`
	Username  string    `json:"username,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	Replies   []Comment `json:"replies"`
}
