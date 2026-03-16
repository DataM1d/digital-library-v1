package repository

import (
	"database/sql"
	"fmt"

	"github.com/DataM1d/digital-library/internal/models"
	"github.com/lib/pq"
)

type PostRepository struct {
	db DBTX
}

type DBTX interface {
	Exec(query string, args ...interface{}) (sql.Result, error)
	Prepare(query string) (*sql.Stmt, error)
	Query(query string, args ...interface{}) (*sql.Rows, error)
	QueryRow(query string, args ...interface{}) *sql.Row
}

func NewPostRepository(db *sql.DB) *PostRepository {
	return &PostRepository{db: db}
}

func (r *PostRepository) WithTransaction(fn func(*PostRepository) error) error {
	db, ok := r.db.(*sql.DB)
	if !ok {
		return fmt.Errorf("repository: transaction already in progress")
	}

	tx, err := db.Begin()
	if err != nil {
		return err
	}

	repo := &PostRepository{db: tx}

	err = fn(repo)
	if err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit()
}

func (r *PostRepository) Create(p *models.Post) error {
	query := `
    INSERT INTO posts (title, content, image_url, blur_hash, alt_text, slug, status, category_id, meta_description, og_image, created_by, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
    RETURNING id, created_at, updated_at`

	return r.db.QueryRow(query,
		p.Title, p.Content, p.ImageURL, p.BlurHash, p.AltText,
		p.Slug, p.Status, p.CategoryID, p.MetaDescription, p.OGImage, p.CreatedBy,
	).Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)
}

func (r *PostRepository) Update(p *models.Post) error {
	query := `
        UPDATE posts 
        SET title = $1, content = $2, image_url = $3, blur_hash = $4, alt_text = $5, 
            category_id = $6, status = $7, meta_description = $8, og_image = $9, 
            last_modified_by = $10, updated_at = NOW(), slug = $11
        WHERE id = $12 AND deleted_at IS NULL`
	_, err := r.db.Exec(query,
		p.Title, p.Content, p.ImageURL, p.BlurHash, p.AltText,
		p.CategoryID, p.Status, p.MetaDescription, p.OGImage, p.LastModifiedBy, p.Slug, p.ID,
	)
	return err
}

func (r *PostRepository) Delete(id int) error {
	query := `UPDATE posts SET deleted_at = NOW() WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}

func (r *PostRepository) GetAll(category string, search string, tags []string, limit, offset int, statusFilter string, currentUserID int) ([]models.Post, int, error) {
	baseQuery := `
        FROM posts p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.deleted_at IS NULL AND (p.title ILIKE $1 OR p.content ILIKE $1)`

	args := []interface{}{"%" + search + "%"}
	argCount := 2

	if statusFilter != "" {
		baseQuery += fmt.Sprintf(" AND p.status = $%d", argCount)
		args = append(args, statusFilter)
		argCount++
	}

	if category != "" {
		baseQuery += fmt.Sprintf(" AND c.slug = $%d", argCount)
		args = append(args, category)
		argCount++
	}

	if len(tags) > 0 {
		baseQuery += fmt.Sprintf(" AND EXISTS (SELECT 1 FROM post_tags pt JOIN tags t ON pt.tag_id = t.id WHERE pt.post_id = p.id AND t.name = ANY($%d))", argCount)
		args = append(args, pq.Array(tags))
		argCount++
	}

	var total int
	err := r.db.QueryRow("SELECT COUNT(DISTINCT p.id) "+baseQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	finalQuery := fmt.Sprintf(`
    SELECT 
        p.id, 
        p.created_by, 
        COALESCE(p.category_id, 0), 
        COALESCE(p.last_modified_by, 0), 
        p.title, 
        p.content, 
        COALESCE(p.image_url, ''), 
        COALESCE(p.blur_hash, ''), 
        COALESCE(p.alt_text, ''), 
        p.slug, 
        p.status, 
        p.created_at, 
        p.updated_at, 
        COALESCE(c.name, '') as category_name, 
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count,
        EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = $%d) as user_has_liked `, argCount) +
		baseQuery +
		fmt.Sprintf(" ORDER BY p.created_at DESC LIMIT $%d OFFSET $%d", argCount+1, argCount+2)

	args = append(args, currentUserID, limit, offset)

	rows, err := r.db.Query(finalQuery, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var posts []models.Post
	for rows.Next() {
		var p models.Post
		err := rows.Scan(
			&p.ID, &p.CreatedBy, &p.CategoryID, &p.LastModifiedBy,
			&p.Title, &p.Content, &p.ImageURL, &p.BlurHash, &p.AltText, &p.Slug, &p.Status,
			&p.CreatedAt, &p.UpdatedAt, &p.CategoryName, &p.LikeCount, &p.UserHasLiked,
		)
		if err != nil {
			return nil, 0, err
		}
		posts = append(posts, p)
	}
	return posts, total, nil
}

func (r *PostRepository) GetBySlug(slug string, currentUserID int) (*models.Post, error) {
	query := `
    SELECT 
        p.id, p.created_by, COALESCE(p.category_id, 0), COALESCE(p.last_modified_by, 0), 
        p.title, p.content, p.image_url, p.blur_hash, p.alt_text, p.slug, p.status,
        COALESCE(p.meta_description, ''), COALESCE(p.og_image, ''), 
        p.created_at, p.updated_at, 
        COALESCE(c.name, '') as category_name,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count,
        EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = $2) as user_has_liked
    FROM posts p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.slug = $1 AND p.deleted_at IS NULL`

	var p models.Post
	err := r.db.QueryRow(query, slug, currentUserID).Scan(
		&p.ID, &p.CreatedBy, &p.CategoryID, &p.LastModifiedBy,
		&p.Title, &p.Content, &p.ImageURL, &p.BlurHash, &p.AltText, &p.Slug, &p.Status,
		&p.MetaDescription, &p.OGImage, &p.CreatedAt, &p.UpdatedAt, &p.CategoryName,
		&p.LikeCount, &p.UserHasLiked,
	)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *PostRepository) ToggleLike(userID, postID int) (bool, error) {
	var exists bool
	err := r.db.QueryRow(`SELECT EXISTS(SELECT 1 FROM post_likes WHERE user_id = $1 AND post_id = $2)`, userID, postID).Scan(&exists)
	if err != nil {
		return false, err
	}
	if exists {
		_, err = r.db.Exec("DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2", userID, postID)
		return false, err
	}
	_, err = r.db.Exec("INSERT INTO post_likes (user_id, post_id) VALUES ($1, $2)", userID, postID)
	return true, err
}

func (r *PostRepository) SlugExists(slug string) (bool, error) {
	var exists bool
	err := r.db.QueryRow(`SELECT EXISTS(SELECT 1 FROM posts WHERE slug = $1 AND deleted_at IS NULL)`, slug).Scan(&exists)
	return exists, err
}

func (r *PostRepository) GetUserLikedPosts(userID int) ([]models.Post, error) {
	query := `
    SELECT p.id, p.title, p.slug, p.image_url, p.created_at
    FROM posts p
    JOIN post_likes pl ON p.id = pl.post_id
    WHERE pl.user_id = $1 AND p.deleted_at IS NULL
    ORDER BY pl.created_at DESC`

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []models.Post
	for rows.Next() {
		var p models.Post
		if err := rows.Scan(&p.ID, &p.Title, &p.Slug, &p.ImageURL, &p.CreatedAt); err != nil {
			return nil, err
		}
		posts = append(posts, p)
	}
	return posts, nil
}

func (r *PostRepository) GetByID(id int) (*models.Post, error) {
	var p models.Post
	err := r.db.QueryRow(`SELECT id, image_url FROM posts WHERE id = $1`, id).Scan(&p.ID, &p.ImageURL)
	return &p, err
}

func (r *PostRepository) UpdateBlurHash(id int, hash string) error {
	query := `UPDATE posts SET blur_hash = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL`
	_, err := r.db.Exec(query, hash, id)
	return err
}
