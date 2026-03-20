package repository

import (
	"context"
	"database/sql"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/DataM1d/digital-library/internal/models"
)

func TestUserRepository_Create(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock: %s", err)
	}
	defer db.Close()

	repo := NewUserRepository(db)
	ctx := context.Background()

	t.Run("Successfully creates a user", func(t *testing.T) {
		user := &models.User{
			Username:     "SvenDev",
			Email:        "sven@digital-library.se",
			PasswordHash: "hashed_string",
			Role:         "admin",
		}

		now := time.Now()
		rows := sqlmock.NewRows([]string{"id", "created_at"}).AddRow(1, now)

		mock.ExpectQuery(`INSERT INTO users`).
			WithArgs(user.Username, user.Email, user.PasswordHash, user.Role).
			WillReturnRows(rows)

		err := repo.Create(ctx, user)

		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if user.ID != 1 {
			t.Errorf("expected ID 1, got %d", user.ID)
		}
	})
}

func TestUserRepository_GetByEmail(t *testing.T) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to open sqlmock: %s", err)
	}
	defer db.Close()

	repo := NewUserRepository(db)
	ctx := context.Background()

	t.Run("Returns user when email exists", func(t *testing.T) {
		email := "test@example.com"
		now := time.Now()

		rows := sqlmock.NewRows([]string{"id", "username", "email", "password_hash", "role", "created_at"}).
			AddRow(1, "tester", email, "secret_hash", "user", now)

		mock.ExpectQuery(`SELECT id, username, email, password_hash, role, created_at FROM users WHERE email = \$1`).
			WithArgs(email).
			WillReturnRows(rows)

		user, err := repo.GetByEmail(ctx, email)

		if err != nil {
			t.Errorf("expected no error, got %v", err)
		}
		if user.Email != email || user.PasswordHash != "secret_hash" {
			t.Error("user data mismatch after scan")
		}
	})

	t.Run("Returns error when user not found", func(t *testing.T) {
		email := "missing@example.com"
		mock.ExpectQuery(`SELECT .* FROM users WHERE email = \$1`).
			WithArgs(email).
			WillReturnError(sql.ErrNoRows)

		user, err := repo.GetByEmail(ctx, email)

		if err != sql.ErrNoRows {
			t.Errorf("expected sql.ErrNoRows, got %v", err)
		}
		if user != nil {
			t.Error("expected nil user on error")
		}
	})
}
