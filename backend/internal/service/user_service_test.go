package service

import (
	"context"
	"errors"
	"testing"

	"github.com/DataM1d/digital-library/internal/models"
	"github.com/DataM1d/digital-library/pkg/utils"
)

type mockUserRepo struct {
	getByEmailFunc   func(context.Context, string) (*models.User, error)
	createFunc       func(context.Context, *models.User) error
	getAuthInfoFunc  func(context.Context, int) (*models.User, error)
}

func (m *mockUserRepo) Create(ctx context.Context, user *models.User) error {
	if m.createFunc != nil {
		return m.createFunc(ctx, user)
	}
	return nil
}

func (m *mockUserRepo) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	if m.getByEmailFunc != nil {
		return m.getByEmailFunc(ctx, email)
	}
	return nil, nil
}

func (m *mockUserRepo) GetAuthInfoByID(ctx context.Context, id int) (*models.User, error) {
	if m.getAuthInfoFunc != nil {
		return m.getAuthInfoFunc(ctx, id)
	}
	return nil, nil
}

func TestRegister_Success(t *testing.T) {
	ctx := context.Background()

	mockRepo := &mockUserRepo{
		getByEmailFunc: func(ctx context.Context, email string) (*models.User, error) {
			return nil, nil
		},
		createFunc: func(ctx context.Context, user *models.User) error {
			return nil
		},
	}

	service := NewUserService(mockRepo)

	user, err := service.Register(
		ctx,
		"john",
		"john@example.com",
		"password123",
	)

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if user == nil {
		t.Fatal("expected user")
	}

	if user.Username != "john" {
		t.Errorf("expected username john, got %s", user.Username)
	}

	if user.Email != "john@example.com" {
		t.Errorf("expected email john@example.com, got %s", user.Email)
	}

	if user.Role != "user" {
		t.Errorf("expected role user, got %s", user.Role)
	}

	if user.PasswordHash == "password123" {
		t.Error("expected password to be hashed")
	}
}

func TestRegister_UserAlreadyExists(t *testing.T) {
	ctx := context.Background()

	mockRepo := &mockUserRepo{
		getByEmailFunc: func(ctx context.Context, email string) (*models.User, error) {
			return &models.User{
				ID:    1,
				Email: email,
			}, nil
		},
	}

	service := NewUserService(mockRepo)

	user, err := service.Register(
		ctx,
		"john",
		"john@example.com",
		"password123",
	)

	if err == nil {
		t.Fatal("expected error")
	}

	if err.Error() != "user already exists" {
		t.Errorf("unexpected error: %v", err)
	}

	if user != nil {
		t.Error("expected nil user")
	}
}

func TestLogin_Success(t *testing.T) {
	ctx := context.Background()

	hash, err := utils.HashPassword("password123")
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}

	mockRepo := &mockUserRepo{
		getByEmailFunc: func(ctx context.Context, email string) (*models.User, error) {
			return &models.User{
				ID:           1,
				Email:        email,
				PasswordHash: hash,
				Role:         "user",
			}, nil
		},
	}

	service := NewUserService(mockRepo)

	token, user, err := service.Login(
		ctx,
		"john@example.com",
		"password123",
	)

	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if token == "" {
		t.Error("expected token")
	}

	if user == nil {
		t.Fatal("expected user")
	}

	if user.Email != "john@example.com" {
		t.Errorf("expected john@example.com, got %s", user.Email)
	}
}

func TestLogin_InvalidPassword(t *testing.T) {
	ctx := context.Background()

	hash, err := utils.HashPassword("correctpassword")
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}

	mockRepo := &mockUserRepo{
		getByEmailFunc: func(ctx context.Context, email string) (*models.User, error) {
			return &models.User{
				ID:           1,
				Email:        email,
				PasswordHash: hash,
				Role:         "user",
			}, nil
		},
	}

	service := NewUserService(mockRepo)

	token, user, err := service.Login(
		ctx,
		"john@example.com",
		"wrongpassword",
	)

	if err == nil {
		t.Fatal("expected error")
	}

	if err.Error() != "invalid email or password" {
		t.Errorf("unexpected error: %v", err)
	}

	if token != "" {
		t.Error("expected empty token")
	}

	if user != nil {
		t.Error("expected nil user")
	}
}

func TestLogin_InvalidEmail(t *testing.T) {
	ctx := context.Background()

	mockRepo := &mockUserRepo{
		getByEmailFunc: func(ctx context.Context, email string) (*models.User, error) {
			return nil, errors.New("not found")
		},
	}

	service := NewUserService(mockRepo)

	token, user, err := service.Login(
		ctx,
		"missing@example.com",
		"password123",
	)

	if err == nil {
		t.Fatal("expected error")
	}

	if err.Error() != "invalid email or password" {
		t.Errorf("unexpected error: %v", err)
	}

	if token != "" {
		t.Error("expected empty token")
	}

	if user != nil {
		t.Error("expected nil user")
	}
}