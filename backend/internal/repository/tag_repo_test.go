package repository

import (
	"context"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
)

func TestTagRepository_SyncPostTags(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock: %s", err)
	}
	defer db.Close()

	repo := NewTagRepository(db)
	ctx := context.Background()

	t.Run("Successfully syncs multiple tags to a post", func(t *testing.T) {
		postID := 1
		tagNames := []string{"History", "Sweden"}

		//Expect the initial cleanup
		mock.ExpectExec("DELETE FROM post_tags WHERE post_id = \\$1").
			WithArgs(postID).
			WillReturnResult(sqlmock.NewResult(0, 1))

		//Loop through the tags
		for i, name := range tagNames {
			tagID := i + 10

			mock.ExpectQuery(`INSERT INTO tags \(name\) VALUES \(\$1\)`).
				WithArgs(name).
				WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(tagID))

			mock.ExpectExec(`INSERT INTO post_tags \(post_id, tag_id\) VALUES \(\$1, \$2\)`).
				WithArgs(postID, tagID).
				WillReturnResult(sqlmock.NewResult(1, 1))
		}

		err := repo.SyncPostTags(ctx, postID, tagNames)
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}

		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("unfulfilled expectations: %s", err)
		}
	})
}
