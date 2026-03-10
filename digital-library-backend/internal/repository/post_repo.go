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

// Create handles the atomic insertion of a post and its associated tags.
func (r *PostRepository) Create(p *models.Post) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	// Ensure rollback on failure to maintain data integrity
	defer tx.Rollback()

	query := `
    INSERT INTO posts (title, content, image_url, blur_hash, alt_text, slug, status, category_id, meta_description, og_image, created_by, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
    RETURNING id, created_at, updated_at`

	err = tx.QueryRow(query,
		p.Title, p.Content, p.ImageURL, p.BlurHash, p.AltText,
		p.Slug, p.Status, p.CategoryID, p.MetaDescription, p.OGImage, p.CreatedBy,
	).Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)

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
            category_id = $6, status = $7, meta_description = $8, og_image = $9, 
            last_modified_by = $10, updated_at = NOW()
        WHERE id = $11 AND deleted_at IS NULL`
	_, err = tx.Exec(query,
		p.Title, p.Content, p.ImageURL, p.BlurHash, p.AltText,
		p.CategoryID, p.Status, p.MetaDescription, p.OGImage, p.LastModifiedBy, p.ID,
	)
	if err != nil {
		return err
	}

	// Refresh tags: Remove existing links and re-insert new tag set
	if _, err = tx.Exec("DELETE FROM post_tags WHERE post_id = $1", p.ID); err != nil {
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

func (r *PostRepository) Delete(id int) error {
	query := `UPDATE posts SET deleted_at = NOW() WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}

func (r *PostRepository) GetAll(category string, search string, tags []string, limit, offset int, statusFilter string) ([]models.Post, int, error) {
	// baseQuery ensures we only ever fetch artifacts that haven't been soft-deleted
	baseQuery := `
        FROM posts p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN post_tags pt ON p.id = pt.post_id
        LEFT JOIN tags t ON pt.tag_id = t.id
        WHERE p.deleted_at IS NULL AND (p.title ILIKE $1 OR p.content ILIKE $1)`

	args := []interface{}{"%" + search + "%"}
	argCount := 2

	// Dynamic Filter injection
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
		baseQuery += fmt.Sprintf(" AND t.name = ANY($%d)", argCount)
		args = append(args, pq.Array(tags))
		argCount++
	}

	var total int
	err := r.db.QueryRow("SELECT COUNT(DISTINCT p.id) "+baseQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	finalQuery := `SELECT DISTINCT p.id, COALESCE(p.created_by, 1), COALESCE(p.category_id, 1), COALESCE(p.last_modified_by, 1), p.title, p.content, p.image_url, p.blur_hash, p.alt_text, p.slug, p.status, p.created_at, p.updated_at, COALESCE(c.name, '') as category_name, (SELECT COUNT(*)::INT FROM post_likes WHERE post_id = p.id) as like_count ` + baseQuery + fmt.Sprintf(" ORDER BY p.created_at DESC LIMIT $%d OFFSET $%d", argCount, argCount+1)
	args = append(args, limit, offset)

	rows, err := r.db.Query(finalQuery, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	posts := []models.Post{}
	for rows.Next() {
		var p models.Post
		var catName, img, blur, alt, slug, content, status sql.NullString

		err := rows.Scan(
			&p.ID, &p.CreatedBy, &p.CategoryID, &p.LastModifiedBy,
			&p.Title, &content, &img, &blur, &alt, &slug, &status,
			&p.CreatedAt, &p.UpdatedAt, &catName, &p.LikeCount,
		)
		if err != nil {
			return nil, 0, err
		}

		// Mapping NullStrings back to models
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
	return posts, total, nil
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

func (r *PostRepository) SlugExists(slug string) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM posts WHERE slug = $1 AND deleted_at IS NULL)`
	err := r.db.QueryRow(query, slug).Scan(&exists)
	return exists, err
}

func (r *PostRepository) GetUserLikedPosts(userID int) ([]models.Post, error) {
	query := `
    SELECT 
        p.id, 
        COALESCE(p.created_by, 1), 
        COALESCE(p.category_id, 1), 
        COALESCE(p.last_modified_by, 1),
        p.title, 
        p.content, 
        p.slug, 
        p.image_url, 
        p.status, 
        p.created_at, 
        p.updated_at, 
        COALESCE(c.name, '') as category_name,
        (SELECT COUNT(*)::INT FROM post_likes WHERE post_id = p.id) as like_count
    FROM posts p
    JOIN post_likes pl ON p.id = pl.post_id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE pl.user_id = $1 AND p.status = 'published'
    ORDER BY pl.created_at DESC`

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	posts := []models.Post{}
	for rows.Next() {
		var p models.Post
		var content, slug, img, status, catName sql.NullString

		err := rows.Scan(
			&p.ID, &p.CreatedBy, &p.CategoryID, &p.LastModifiedBy,
			&p.Title, &content, &slug, &img, &status,
			&p.CreatedAt, &p.UpdatedAt, &catName, &p.LikeCount,
		)
		if err != nil {
			return nil, err
		}

		p.Content = content.String
		p.ImageURL = img.String
		p.Slug = slug.String
		p.Status = status.String
		p.CategoryName = catName.String
		posts = append(posts, p)
	}
	return posts, nil
}

// UpdateBlurHash is called asynchronously to update the image placeholder after processing.
func (r *PostRepository) UpdateBlurHash(id int, hash string) error {
	query := `UPDATE posts SET blur_hash = $1, updated_at = NOW() WHERE id = $2`
	_, err := r.db.Exec(query, hash, id)
	return err
}

func (r *PostRepository) GetBySlug(slug string) (*models.Post, error) {
	query := `
        SELECT p.id, COALESCE(p.created_by, 1), COALESCE(p.category_id, 1), COALESCE(p.last_modified_by, 1), 
               p.title, p.content, p.image_url, p.blur_hash, p.alt_text, p.slug, p.status,
               p.meta_description, p.og_image, p.created_at, p.updated_at, COALESCE(c.name, '') as category_name
        FROM posts p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.slug = $1 AND p.deleted_at IS NULL`

	var p models.Post
	var content, img, blur, alt, sVal, status, meta, og, catName sql.NullString
	err := r.db.QueryRow(query, slug).Scan(
		&p.ID, &p.CreatedBy, &p.CategoryID, &p.LastModifiedBy,
		&p.Title, &content, &img, &blur, &alt, &sVal, &status,
		&meta, &og, &p.CreatedAt, &p.UpdatedAt, &catName,
	)
	if err != nil {
		return nil, err
	}
	p.Content = content.String
	p.CategoryName = catName.String
	p.ImageURL = img.String
	p.BlurHash = blur.String
	p.AltText = alt.String
	p.Slug = sVal.String
	p.Status = status.String
	p.MetaDescription = meta.String
	p.OGImage = og.String
	return &p, nil
}

func (r *PostRepository) GetByID(id int) (*models.Post, error) {
	query := `
        SELECT p.id, COALESCE(p.created_by, 1), COALESCE(p.category_id, 1), COALESCE(p.last_modified_by, 1), 
               p.title, p.content, p.image_url, p.blur_hash, p.alt_text, p.slug, p.status,
               p.meta_description, p.og_image, p.created_at, p.updated_at, COALESCE(c.name, '') as category_name
        FROM posts p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = $1 AND p.deleted_at IS NULL`

	var p models.Post
	var content, img, blur, alt, sVal, status, meta, og, catName sql.NullString

	err := r.db.QueryRow(query, id).Scan(
		&p.ID, &p.CreatedBy, &p.CategoryID, &p.LastModifiedBy,
		&p.Title, &content, &img, &blur, &alt, &sVal, &status,
		&meta, &og, &p.CreatedAt, &p.UpdatedAt, &catName,
	)
	if err != nil {
		return nil, err
	}

	p.Content = content.String
	p.CategoryName = catName.String
	p.ImageURL = img.String
	p.BlurHash = blur.String
	p.AltText = alt.String
	p.Slug = sVal.String
	p.Status = status.String
	p.MetaDescription = meta.String
	p.OGImage = og.String

	return &p, nil
}
