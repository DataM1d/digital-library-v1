package repository

import (
	"database/sql"
	"fmt"

	"github.com/DataM1d/digital-library/internal/models"
	"github.com/lib/pq"
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

	query := `
    INSERT INTO posts (title, content, image_url, blur_hash, alt_text, slug, status, category_id, created_by, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    RETURNING id`

	err = tx.QueryRow(query, p.Title, p.Content, p.ImageURL, p.BlurHash, p.AltText, p.Slug, p.Status, p.CategoryID, p.CreatedBy).Scan(&p.ID)
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

func (r *PostRepository) Update(p *models.Post) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `
        UPDATE posts 
        SET title = $1, content = $2, image_url = $3, blur_hash = $4, alt_text = $5, 
            category_id = $6, status = $7, last_modified_by = $8, updated_at = NOW()
        WHERE id = $9`
	_, err = tx.Exec(query, p.Title, p.Content, p.ImageURL, p.BlurHash, p.AltText, p.CategoryID, p.Status, p.LastModifiedBy, p.ID)
	if err != nil {
		return err
	}

	_, err = tx.Exec("DELETE FROM post_tags WHERE post_id = $1", p.ID)
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

func (r *PostRepository) Delete(id int) (string, error) {
	var ImageURL string
	err := r.db.QueryRow("SELECT image_url FROM posts WHERE id = $1", id).Scan(&ImageURL)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", nil
		}
		return "", err
	}

	_, err = r.db.Exec("DELETE FROM posts WHERE id = $1", id)
	return ImageURL, err
}

func (r *PostRepository) GetAll(category string, search string, tags []string, limit, offset int) ([]models.Post, error) {
	query := `
        SELECT DISTINCT p.id, p.title, p.content, p.image_url, p.blur_hash, p.alt_text, p.slug, p.status,
               p.created_at, c.name as category_name,
               (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count
        FROM posts p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN post_tags pt ON p.id = pt.post_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        WHERE (p.title ILIKE $1 OR p.content ILIKE $1)`

	args := []interface{}{"%" + search + "%", limit, offset}
	argCount := 4

	if category != "" {
		query += fmt.Sprintf(" AND c.slug = $%d", argCount)
		args = append(args, category)
		argCount++
	}

	if len(tags) > 0 {
		query += fmt.Sprintf(" AND t.name = ANY($%d)", argCount)
		args = append(args, pq.Array(tags))
		argCount++
	}

	query += " ORDER BY p.created_at DESC LIMIT $2 OFFSET $3"

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []models.Post
	for rows.Next() {
		var p models.Post
		var catName, img, blur, alt, slug, content, status sql.NullString

		err := rows.Scan(
			&p.ID, &p.Title, &content, &img, &blur, &alt, &slug, &status,
			&p.CreatedAt, &catName, &p.LikeCount,
		)
		if err != nil {
			return nil, err
		}

		p.Content = content.String
		p.CategoryName = catName.String
		p.ImageURL = img.String
		p.BlurHash = blur.String
		p.AltText = alt.String
		p.Slug = slug.String
		p.Status = status.String

		tagQuery := `SELECT t.name FROM tags t JOIN post_tags pt ON t.id = pt.tag_id WHERE pt.post_id = $1`
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

func (r *PostRepository) ToggleLike(userID, postID int) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM post_likes WHERE user_id = $1 AND post_id = $2)`
	err := r.db.QueryRow(query, userID, postID).Scan(&exists)
	if err != nil {
		return false, err
	}

	if exists {
		_, err = r.db.Exec("DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2", userID, postID)
		return false, err
	} else {
		_, err = r.db.Exec("INSERT INTO post_likes (user_id, post_id) VALUES ($1, $2)", userID, postID)
		return true, err
	}
}

func (r *PostRepository) GetBySlug(slug string) (*models.Post, error) {
	query := `
        SELECT p.id, p.title, p.content, p.image_url, p.blur_hash, p.alt_text, p.slug, p.status,
               p.created_at, c.name as category_name
        FROM posts p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.slug = $1`

	var p models.Post
	var catName, img, blur, alt, content, slugVal, status sql.NullString

	err := r.db.QueryRow(query, slug).Scan(
		&p.ID, &p.Title, &content, &img, &blur, &alt, &slugVal, &status,
		&p.CreatedAt, &catName,
	)

	if err != nil {
		return nil, err
	}

	p.Content = content.String
	p.CategoryName = catName.String
	p.ImageURL = img.String
	p.BlurHash = blur.String
	p.AltText = alt.String
	p.Slug = slugVal.String
	p.Status = status.String

	return &p, nil
}

func (r *PostRepository) SlugExists(slug string) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM posts WHERE slug = $1)`
	err := r.db.QueryRow(query, slug).Scan(&exists)
	return exists, err
}
