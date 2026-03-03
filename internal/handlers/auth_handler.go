package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/DataM1d/digital-library/pkg/utils"

	"github.com/DataM1d/digital-library/internal/service"
)

type AuthHandler struct {
	userService *service.UserService
}

func NewAuthHandler(s *service.UserService) *AuthHandler {
	return &AuthHandler{userService: s}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		utils.JSONError(w, "Invalid input", http.StatusBadRequest)
		return
	}

	user, err := h.userService.Register(input.Email, input.Password)
	if err != nil {
		utils.JSONError(w, "User already exists or internal error", http.StatusConflict)
		return
	}

	utils.JSONResponse(w, http.StatusCreated, user)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		utils.JSONError(w, "Invalid input", http.StatusBadRequest)
		return
	}

	token, err := h.userService.Login(input.Email, input.Password)
	if err != nil {
		utils.JSONError(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	utils.JSONResponse(w, http.StatusOK, map[string]string{"token": token})
}
