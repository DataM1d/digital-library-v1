package models

import "time"

type Category struct {
    ID        int       `json:"id,string"`
    Name      string    `json:"name"`
    Slug      string    `json:"slug"`
    CreatedAt time.Time `json:"created_at"`
}