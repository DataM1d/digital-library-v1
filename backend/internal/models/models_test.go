package models

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestCategoryModelSerialization(t *testing.T) {
	category := Category{
		ID:        1,
		Name:      "Technology",
		Slug:      "technology",
		CreatedAt: time.Now(),
	}

	bytes, err := json.Marshal(category)
	assert.NoError(t, err)
	assert.Contains(t, string(bytes), "Technology")
}

func TestUserModelOmitPassword(t *testing.T) {
	user := User{
		ID:           1,
		Username:     "developer",
		Email:        "dev@digital.com",
		PasswordHash: "super_secret_hash",
		Role:         "user",
	}

	bytes, err := json.Marshal(user)
	assert.NoError(t, err)

	// Ensure the password hash is excluded from JSON output
	assert.NotContains(t, string(bytes), "super_secret_hash")
	assert.Contains(t, string(bytes), "dev@digital.com")
}

func TestCommentRepliesTree(t *testing.T) {
	comment := Comment{
		ID:       10,
		PostID:   1,
		UserID:   2,
		Content:  "Original comment",
		Replies: []Comment{
			{
				ID:      11,
				PostID:  1,
				UserID:  3,
				Content: "Reply to comment",
			},
		},
	}

	assert.Equal(t, 1, len(comment.Replies))
	assert.Equal(t, "Reply to comment", comment.Replies[0].Content)
}