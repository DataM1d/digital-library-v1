package repository

import (
	"context"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/DataM1d/digital-library/internal/models"
	"github.com/lib/pq"
)

func TestPostRepository_Create(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to open sqlmock: %s", err)
	}
	defer db.Close()

	repo := &PostRepository{db: db}
	ctx := context.Background()

	t.Run("Successful Post Creation", func(t *testing.T) {
		p := &models.Post{
			Title:      "Vasa Ship",
			Content:    "Sunken treasure",
			Slug:       "vasa-ship",
			CreatedBy:  1,
			CategoryID: 5,
		}

		now := time.Now()
		rows := sqlmock.NewRows([]string{"id", "created_at", "updated_at"}).
			AddRow(1, now, now)

		//using sqlmock AnyArg() for fields that are hard to predict or handled by DB(like NOW())
		mock.ExpectQuery(`INSERT INTO posts`).
			WithArgs(
				p.Title, p.Content, p.ImageURL, p.BlurHash, p.AltText,
				p.Slug, p.Status, p.CategoryID, p.MetaDescription, p.OGImage, p.CreatedBy,
			).
			WillReturnRows(rows)

		err := repo.Create(ctx, p)

		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if p.ID != 1 {
			t.Errorf("expected p.ID to be 1, got %d", p.ID)
		}
	})
}

func TestPostRepository_GetAll(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock: %s", err)
	}
	defer db.Close()

	repo := &PostRepository{db: db}
	ctx := context.Background()

	t.Run("Filters by search and tags correctly", func(t *testing.T) {
		search := "Vasa"
		tags := []string{"history", "sweden"}
		limit, offset := 10, 0
		userID := 1

		//Mock the COUNT query
		countRows := sqlmock.NewRows([]string{"count"}).AddRow(1)
		//The query building logic adds tags as the 2nd argument because statusFilter is empty
		mock.ExpectQuery(`SELECT COUNT\(DISTINCT p.id\)`).
			WithArgs("%"+search+"%", pq.Array(tags)).
			WillReturnRows(countRows)

		//Mock the SELECT query
		now := time.Now()
		postRows := sqlmock.NewRows([]string{
			"id", "created_by", "category_id", "last_modified_by",
			"title", "content", "image_url", "blur_hash", "alt_text", "slug", "status",
			"created_at", "updated_at", "category_name", "like_count", "user_has_liked",
		}).AddRow(1, 1, 5, 0, "Vasa Ship", "Content", "", "", "", "vasa-ship", "published", now, now, "History", 10, true)

		// argCount logic: $1=search, $2=tags, $3=userID, $4=limit, $5=offset
		mock.ExpectQuery(`SELECT p.id, p.created_by`).
			WithArgs("%"+search+"%", pq.Array(tags), userID, limit, offset).
			WillReturnRows(postRows)

		posts, total, err := repo.GetAll(ctx, "", search, tags, limit, offset, "", userID)

		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if total != 1 {
			t.Errorf("expected total 1, got %d", total)
		}
		if len(posts) != 1 || posts[0].Title != "Vasa Ship" {
			t.Error("failed to scan post correctly")
		}
	})
}

func TestPostRepository_ToggleLike(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock: %s", err)
	}
	defer db.Close()

	repo := &PostRepository{db: db}
	ctx := context.Background()

	t.Run("Likes a post when not already liked", func(t *testing.T) {
		userID, postID := 1, 10

		//Mock the check for existence (returns false)
		mock.ExpectQuery(`SELECT EXISTS`).
			WithArgs(userID, postID).
			WillReturnRows(sqlmock.NewRows([]string{"exists"}).AddRow(false))

		//Mock the isnert
		mock.ExpectExec(`INSERT INTO post_likes`).
			WithArgs(userID, postID).
			WillReturnResult(sqlmock.NewResult(1, 1))

		liked, err := repo.ToggleLike(ctx, userID, postID)

		if err != nil || !liked {
			t.Errorf("expected liked=true, error=nil; got liked=%v, error=%v", liked, err)
		}
	})
}
