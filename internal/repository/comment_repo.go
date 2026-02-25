package repository

import (
	"database/sql"
	"log"

	"github.com/DataM1d/digital-library/internal/models"
)

type CommentRepository struct {
	db *sql.DB
}

func NewCommentRepository(db *sql.DB) *CommentRepository {
	return &CommentRepository{db: db}
}

func (r *CommentRepository) Create(c *models.Comment) error {
	query := `
        INSERT INTO comments (post_id, user_id, content, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING id, created_at`
	err := r.db.QueryRow(query, c.PostID, c.UserID, c.Content).Scan(&c.ID, &c.CreatedAt)
	if err != nil {
		log.Printf("!!! DB INSERT ERROR: %v", err)
		return err
	}
	return nil
}

func (r *CommentRepository) GetByPostID(postID int) ([]models.Comment, error) {
	query := `
        SELECT c.id, c.post_id, c.user_id, c.content, c.created_at, COALESCE(u.username, 'unknown_user')
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = $1
        ORDER BY c.created_at DESC`
	rows, err := r.db.Query(query, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	comments := []models.Comment{}
	for rows.Next() {
		var c models.Comment
		if err := rows.Scan(&c.ID, &c.PostID, &c.UserID, &c.Content, &c.CreatedAt, &c.Username); err != nil {
			return nil, err
		}
		comments = append(comments, c)
	}
	return comments, nil
}
