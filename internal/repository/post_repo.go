package repository

import (
	"database/sql"

	"github.com/DataM1d/digital-library/internal/models"
)

type PostRepository struct {
	db *sql.DB
}

func NewPostRepository(db *sql.DB) *PostRepository {
	return &PostRepository{db: db}
}

func (r *PostRepository) Create(p *models.Post) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `INSERT INTO posts (title, content, category_id) VALUES ($1, $2, $3) RETURNING id`
	err = tx.QueryRow(query, p.Title, p.Content, p.CategoryID).Scan(&p.ID)
	if err != nil {
		return err
	}

	for _, tagName := range p.Tags {
		var tagID int

		err := tx.QueryRow("INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id", tagName).Scan(&tagID)
		if err != nil {
			return err
		}

		_, err = tx.Exec("INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2)", p.ID, tagID)
		if err != nil {
			return err
		}
	}
	return tx.Commit()
}

func (r *PostRepository) GetAll() ([]models.Post, error) {
	query := `
		SELECT p.id, p.title, p.content, p.category_id, c.name 
		FROM posts p
		LEFT JOIN categories c ON p.category_id = c.id
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []models.Post
	for rows.Next() {
		var p models.Post
		var categoryName sql.NullString

		err := rows.Scan(&p.ID, &p.Title, &p.Content, &p.CategoryID, &categoryName)
		if err != nil {
			return nil, err
		}

		if categoryName.Valid {
			p.CategoryName = categoryName.String
		}

		tagQuery := `
			SELECT t.name 
			FROM tags t
			JOIN post_tags pt ON t.id = pt.tag_id
			WHERE pt.post_id = $1
		`

		tagRows, err := r.db.Query(tagQuery, p.ID)
		if err == nil {
			for tagRows.Next() {
				var tagName string
				tagRows.Scan(&tagName)
				p.Tags = append(p.Tags, tagName)
			}
			tagRows.Close()
		}

		posts = append(posts, p)
	}

	return posts, nil
}
