package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"

	"github.com/DataM1d/digital-library/internal/domain"
	"github.com/DataM1d/digital-library/internal/models"
	"github.com/lib/pq"
)

type PostRepository struct {
	db domain.DBTX
}

func NewPostRepository(db *sql.DB) *PostRepository {
	return &PostRepository{db: db}
}

func (r *PostRepository) WithTransaction(ctx context.Context, fn func(domain.PostRepo) error) error {
	db, ok := r.db.(*sql.DB)
	if !ok {
		return fmt.Errorf("repository: transaction already in progress")
	}

	tx, err := db.BeginTx(ctx, nil)
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

func (r *PostRepository) Create(ctx context.Context, p *models.Post) error {
	query := `
    INSERT INTO posts (title, content, image_url, blur_hash, alt_text, slug, status, category_id, meta_description, og_image, created_by, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
    RETURNING id, created_at, updated_at`

	return r.db.QueryRowContext(ctx, query,
		p.Title, p.Content, p.ImageURL, p.BlurHash, p.AltText,
		p.Slug, p.Status, p.CategoryID, p.MetaDescription, p.OGImage, p.CreatedBy,
	).Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)
}

func (r *PostRepository) Update(ctx context.Context, p *models.Post) error {
	query := `
        UPDATE posts 
        SET title = $1, content = $2, image_url = $3, blur_hash = $4, alt_text = $5, 
            category_id = $6, status = $7, meta_description = $8, og_image = $9, 
            last_modified_by = $10, updated_at = NOW(), slug = $11
        WHERE id = $12 AND deleted_at IS NULL`

	_, err := r.db.ExecContext(ctx, query,
		p.Title, p.Content, p.ImageURL, p.BlurHash, p.AltText,
		p.CategoryID, p.Status, p.MetaDescription, p.OGImage, p.LastModifiedBy, p.Slug, p.ID,
	)
	return err
}

func (r *PostRepository) Delete(ctx context.Context, id int) error {
	query := `UPDATE posts SET deleted_at = NOW() WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	return err
}

func (r *PostRepository) GetAll(ctx context.Context, category string, search string, tags []string, limit, offset int, statusFilter string, currentUserID int) ([]models.Post, int, error) {
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
	err := r.db.QueryRowContext(ctx, "SELECT COUNT(DISTINCT p.id) "+baseQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	finalQuery := fmt.Sprintf(`
    SELECT 
        p.id, p.created_by, COALESCE(p.category_id, 0), COALESCE(p.last_modified_by, 0), 
        p.title, p.content, COALESCE(p.image_url, ''), COALESCE(p.blur_hash, ''), 
        COALESCE(p.alt_text, ''), p.slug, p.status, p.created_at, p.updated_at, 
        COALESCE(c.name, '') as category_name, 
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as like_count,
        EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = $%d) as user_has_liked `, argCount) +
		baseQuery +
		fmt.Sprintf(" ORDER BY p.created_at DESC LIMIT $%d OFFSET $%d", argCount+1, argCount+2)

	args = append(args, currentUserID, limit, offset)

	rows, err := r.db.QueryContext(ctx, finalQuery, args...)
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

func (r *PostRepository) GetBySlug(ctx context.Context, slug string, currentUserID int) (*models.Post, error) {
	query := `
		SELECT 
			p.id, p.created_by, COALESCE(p.category_id, 0), COALESCE(p.last_modified_by, 0),
			p.title, p.content, COALESCE(p.image_url, ''), COALESCE(p.blur_hash, ''), 
			COALESCE(p.alt_text, ''), p.slug, p.status, 
			COALESCE(p.meta_description, ''), COALESCE(p.og_image, ''),
			p.created_at, p.updated_at,
			COALESCE(c.name, '') as category_name,
			EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = $1) as user_has_liked,
			COALESCE(json_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '[]') as tags
		FROM posts p
		LEFT JOIN categories c ON p.category_id = c.id
		LEFT JOIN post_tags pt ON p.id = pt.post_id
		LEFT JOIN tags t ON pt.tag_id = t.id
		WHERE p.slug = $2 AND p.deleted_at IS NULL
		GROUP BY p.id, c.name`

	var p models.Post
	var tagsJSON []byte

	err := r.db.QueryRowContext(ctx, query, currentUserID, slug).Scan(
		&p.ID, &p.CreatedBy, &p.CategoryID, &p.LastModifiedBy,
		&p.Title, &p.Content, &p.ImageURL, &p.BlurHash,
		&p.AltText, &p.Slug, &p.Status,
		&p.MetaDescription, &p.OGImage,
		&p.CreatedAt, &p.UpdatedAt, &p.CategoryName,
		&p.UserHasLiked, &tagsJSON,
	)

	if err != nil {
		return nil, err
	}

	if len(tagsJSON) > 0 {
		if err := json.Unmarshal(tagsJSON, &p.Tags); err != nil {
			return nil, fmt.Errorf("failed to unmarshal tags: %w", err)
		}
	}

	return &p, nil
}

func (r *PostRepository) ToggleLike(ctx context.Context, userID, postID int) (bool, error) {
	var exists bool

	err := r.db.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM post_likes WHERE user_id = $1 AND post_id = $2)`, userID, postID).Scan(&exists)
	if err != nil {
		return false, err
	}
	if exists {
		_, err = r.db.ExecContext(ctx, "DELETE FROM post_likes WHERE user_id = $1 AND post_id = $2", userID, postID)
		return false, err
	}
	_, err = r.db.ExecContext(ctx, "INSERT INTO post_likes (user_id, post_id) VALUES ($1, $2)", userID, postID)
	return true, err
}

func (r *PostRepository) SlugExists(ctx context.Context, slug string) (bool, error) {
	var exists bool
	err := r.db.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM posts WHERE slug = $1 AND deleted_at IS NULL)`, slug).Scan(&exists)
	return exists, err
}

func (r *PostRepository) GetUserLikedPosts(ctx context.Context, userID int) ([]models.Post, error) {
	query := `
    SELECT p.id, p.title, p.slug, p.image_url, p.created_at
    FROM posts p
    JOIN post_likes pl ON p.id = pl.post_id
    WHERE pl.user_id = $1 AND p.deleted_at IS NULL
    ORDER BY pl.created_at DESC`

	rows, err := r.db.QueryContext(ctx, query, userID)
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

func (r *PostRepository) GetByID(ctx context.Context, id int) (*models.Post, error) {
	var p models.Post
	err := r.db.QueryRowContext(ctx, `SELECT id, image_url, blur_hash FROM posts WHERE id = $1 AND deleted_at IS NULL`, id).Scan(&p.ID, &p.ImageURL, &p.BlurHash)
	return &p, err
}

func (r *PostRepository) UpdateBlurHash(ctx context.Context, id int, hash string) error {
	query := `UPDATE posts SET blur_hash = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL`
	_, err := r.db.ExecContext(ctx, query, hash, id)
	return err
}

func (r *PostRepository) GetAllImageURLs(ctx context.Context) ([]string, error) {
	query := `SELECT image_url FROM posts WHERE image_url IS NOT NULL AND image_url != '' AND deleted_at IS NULL`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var urls []string
	for rows.Next() {
		var url string
		if err := rows.Scan(&url); err != nil {
			return nil, err
		}
		urls = append(urls, url)
	}

	return urls, nil
}
