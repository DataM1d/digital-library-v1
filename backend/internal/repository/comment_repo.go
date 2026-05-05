package repository

import (
	"context"

	"github.com/DataM1d/digital-library/internal/domain"
	"github.com/DataM1d/digital-library/internal/models"
)

type CommentRepository struct {
	db domain.DBTX
}

func NewCommentRepository(db domain.DBTX) *CommentRepository {
	return &CommentRepository{db: db}
}

func (r *CommentRepository) Create(ctx context.Context, c *models.Comment) error {
	query := `
        INSERT INTO comments (post_id, user_id, parent_id, content)
        VALUES ($1, $2, $3, $4)
        RETURNING id, created_at`

	return r.db.QueryRowContext(ctx, query,
		c.PostID, c.UserID, c.ParentID, c.Content,
	).Scan(&c.ID, &c.CreatedAt)
}

func (r *CommentRepository) GetByPostID(ctx context.Context, postID int) ([]models.Comment, error) {
	query := `
        SELECT c.id, c.post_id, c.user_id, c.parent_id, c.content, c.created_at, u.username
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = $1
        ORDER BY c.created_at ASC`

	rows, err := r.db.QueryContext(ctx, query, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []models.Comment
	for rows.Next() {
		var c models.Comment
		err := rows.Scan(
			&c.ID, &c.PostID, &c.UserID, &c.ParentID,
			&c.Content, &c.CreatedAt, &c.Username,
		)
		if err != nil {
			return nil, err
		}
		c.Replies = []models.Comment{}
		comments = append(comments, c)
	}
	return comments, nil
}
