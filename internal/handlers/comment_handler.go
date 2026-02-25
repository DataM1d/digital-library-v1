package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/DataM1d/digital-library/internal/middleware"
	"github.com/DataM1d/digital-library/internal/models"
	"github.com/DataM1d/digital-library/internal/service"
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

	val := r.Context().Value(middleware.UserIDKey)
	if val == nil {
		http.Error(w, "user identity not found in context", http.StatusUnauthorized)
		return
	}

	userID := val.(int)

	var c models.Comment
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	c.PostID = postID
	c.UserID = userID

	if err := h.service.AddComment(&c); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(c)
}

func (h *CommentHandler) GetComments(w http.ResponseWriter, r *http.Request) {
	postID, _ := strconv.Atoi(chi.URLParam(r, "id"))

	comments, err := h.service.GetPostComments(postID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(comments)
}
