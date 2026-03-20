package repository

import (
	"context"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/DataM1d/digital-library/internal/models"
)

func TestCategoryRepository_GetAll(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("an error '%s' was not expected when opening a stub database connection", err)
	}
	defer db.Close()

	repo := NewCategoryRepository(db)
	ctx := context.Background()

	t.Run("Successfully returns all categories", func(t *testing.T) {
		rows := sqlmock.NewRows([]string{"id", "name", "slug", "created_at"}).
			AddRow(1, "History", "history", time.Now()).
			AddRow(2, "Art", "art", time.Now()) //Expeted rows

		mock.ExpectQuery(`SELECT id, name, slug, created_at FROM categories ORDER BY name ASC`).
			WillReturnRows(rows) //Specific query

		cats, err := repo.GetAll(ctx)

		//Assertions
		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if len(cats) != 2 {
			t.Errorf("expected 2 categories, got %d", len(cats))
		}
		if cats[0].Name != "History" {
			t.Errorf("expected first category name 'History', got %s", cats[0].Name)
		}

		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("there were unfulfilled expectations: %s", err)
		}
	})
}

func TestCategoryRepository_Create(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("error opening mock db: %s", err)
	}
	defer db.Close()

	repo := NewCategoryRepository(db)
	ctx := context.Background()

	t.Run("Successfully creates a category", func(t *testing.T) {
		cat := &models.Category{Name: "Science", Slug: "science"}

		rows := sqlmock.NewRows([]string{"id"}).AddRow(10)

		mock.ExpectQuery(`INSERT INTO categories \(name, slug\) VALUES \(\$1, \$2\) RETURNING id`).
			WithArgs(cat.Name, cat.Slug).
			WillReturnRows(rows)

		err := repo.Create(ctx, cat)

		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if cat.ID != 10 {
			t.Errorf("expected ID 10 to be scanned into struct, got %d", cat.ID)
		}
	})
}
