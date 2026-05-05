package repository

import (
	"context"

	"github.com/DataM1d/digital-library/internal/domain"
	"github.com/DataM1d/digital-library/internal/models"
)

type UserRepository struct {
	db domain.DBTX
}

func NewUserRepository(db domain.DBTX) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, u *models.User) error {
	query := `INSERT INTO users (username, email, password_hash, role) 
              VALUES ($1, $2, $3, $4) RETURNING id, created_at`

	return r.db.QueryRowContext(
		ctx,
		query,
		u.Username,
		u.Email,
		u.PasswordHash,
		u.Role,
	).Scan(&u.ID, &u.CreatedAt)
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	u := &models.User{}
	query := `SELECT id, username, email, password_hash, role, created_at 
              FROM users WHERE email = $1`

	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&u.ID,
		&u.Username,
		&u.Email,
		&u.PasswordHash,
		&u.Role,
		&u.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return u, nil
}

func (r *UserRepository) GetByID(ctx context.Context, id int) (*models.User, error) {
	u := &models.User{}
	query := `SELECT id, username, email, role, created_at 
              FROM users WHERE id = $1`

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&u.ID,
		&u.Username,
		&u.Email,
		&u.Role,
		&u.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return u, nil
}
