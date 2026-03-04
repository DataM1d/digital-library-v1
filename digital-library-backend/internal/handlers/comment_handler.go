package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/DataM1d/digital-library/internal/middleware"
	"github.com/DataM1d/digital-library/internal/models"
	"github.com/DataM1d/digital-library/internal/service"
	"github.com/DataM1d/digital-library/pkg/utils"
	"github.com/go-chi/chi/v5"
)

type CommentHandler struct {
	service *service.CommentService
}

func NewCommentHandler(s *service.CommentService) *CommentHandler {
	return &CommentHandler{service: s}
}

func (h *CommentHandler) CreateComment(w http.ResponseWriter, r *http.Request) {
	postID, _ := strconv.Atoi(chi.URLParam(r, "id"))

	val, ok := r.Context().Value(middleware.UserIDKey).(int)
	if !ok {
		utils.JSONError(w, "User identity not found or invalid", http.StatusUnauthorized)
		return
	}

	userID := val

	var c models.Comment
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		utils.JSONError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	c.PostID = postID
	c.UserID = userID

	if err := h.service.AddComment(&c); err != nil {
		utils.JSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	utils.JSONResponse(w, http.StatusCreated, c)
}

func (h *CommentHandler) GetComments(w http.ResponseWriter, r *http.Request) {
	postID, _ := strconv.Atoi(chi.URLParam(r, "id"))

	comments, err := h.service.GetPostComments(postID)
	if err != nil {
		utils.JSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	utils.JSONResponse(w, http.StatusOK, comments)
}
