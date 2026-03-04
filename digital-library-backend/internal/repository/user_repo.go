package repository

import (
	"database/sql"

	"github.com/DataM1d/digital-library/internal/models"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(u *models.User) error {
	query := `INSERT INTO users (email, password_hash, role) 
              VALUES ($1, $2, $3) RETURNING id, created_at`
	return r.db.QueryRow(query, u.Email, u.PasswordHash, u.Role).Scan(&u.ID, &u.CreatedAt)
}

func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
	u := &models.User{}
	query := `SELECT id, email, password_hash, role, created_at FROM users WHERE email = $1`
	err := r.db.QueryRow(query, email).Scan(&u.ID, &u.Email, &u.PasswordHash, &u.Role, &u.CreatedAt)

	if err != nil {
		return nil, err
	}
	return u, nil
}
