package repository

import (
	"context"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/DataM1d/digital-library/internal/models"
)

func TestCommentRepository_Create(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock: %s", err)
	}
	defer db.Close()

	repo := NewCommentRepository(db)
	ctx := context.Background()

	t.Run("Successfully inserts a comment", func(t *testing.T) {
		parentID := 1
		comment := &models.Comment{
			PostID:   10,
			UserID:   5,
			ParentID: &parentID,
			Content:  "Informative artifact!",
		}

		now := time.Now()

		rows := sqlmock.NewRows([]string{"id", "created_at"}).AddRow(100, now)

		mock.ExpectQuery(`INSERT INTO comments`).
			WithArgs(comment.PostID, comment.UserID, comment.ParentID, comment.Content).
			WillReturnRows(rows)

		err := repo.Create(ctx, comment)

		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if comment.ID != 100 {
			t.Errorf("expected ID 100, got %d", comment.ID)
		}
		if !comment.CreatedAt.Equal(now) {
			t.Error("expected CreatedAt to be populated from DB")
		}
	})
}

func TestCommentRepository_GetPostByID(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock: %s", err)
	}
	defer db.Close()

	repo := NewCommentRepository(db)
	ctx := context.Background()

	t.Run("Returns comments with username join", func(t *testing.T) {
		postID := 10
		now := time.Now()

		rows := sqlmock.NewRows([]string{"id", "post_id", "user_id", "parent_id", "content", "created_at", "username"}).
			AddRow(1, postID, 5, nil, "First comment", now, "johndoe").
			AddRow(2, postID, 6, 1, "A reply", now.Add(time.Minute), "janedoe")

		mock.ExpectQuery(`SELECT c.id, c.post_id, c.user_id, c.parent_id, c.content, c.created_at, u.username`).
			WithArgs(postID).
			WillReturnRows(rows)

		comments, err := repo.GetByPostID(ctx, postID)

		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if len(comments) != 2 {
			t.Errorf("expected 2 comments, got %d", len(comments))
		}
		if comments[0].Username != "johndoe" {
			t.Errorf("expected username 'johndoe', got %s", comments[0].Username)
		}

		if comments[0].Replies == nil {
			t.Error("expected Replies slice to be initialized, got nil")
		}

		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("unfulfilled expectations: %s", err)
		}
	})
}
