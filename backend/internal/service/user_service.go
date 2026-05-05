package service

import (
	"context"
	"errors"

	"github.com/DataM1d/digital-library/internal/domain"
	"github.com/DataM1d/digital-library/internal/models"
	"github.com/DataM1d/digital-library/pkg/utils"
)

type userService struct {
	repo domain.UserRepo
}

func NewUserService(repo domain.UserRepo) domain.UserService {
	return &userService{repo: repo}
}

func (s *userService) Register(ctx context.Context, username, email, password string) (*models.User, error) {
	existing, _ := s.repo.GetByEmail(ctx, email)
	if existing != nil {
		return nil, errors.New("user already exists")
	}

	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Username:     username,
		Email:        email,
		PasswordHash: hashedPassword,
		Role:         "user",
	}

	if err := s.repo.Create(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *userService) Login(ctx context.Context, email, password string) (string, *models.User, error) {
	user, err := s.repo.GetByEmail(ctx, email)
	if err != nil {
		return "", nil, errors.New("invalid email or password")
	}

	if !utils.CheckPassword(password, user.PasswordHash) {
		return "", nil, errors.New("invalid email or password")
	}

	token, err := utils.GenerateToken(user.ID, user.Role)
	if err != nil {
		return "", nil, err
	}

	return token, user, nil
}
