package service

import (
	"context"
	"io"
	"testing"

	"github.com/DataM1d/digital-library/internal/domain"
	"github.com/DataM1d/digital-library/internal/models"
)

type mockPostRepo struct {
	createFunc            func(context.Context, *models.Post) error
	updateFunc            func(context.Context, *models.Post) error
	deleteFunc            func(context.Context, int) error
	getByIDFunc           func(context.Context, int) (*models.Post, error)
	getAuthInfoByIDFunc   func(context.Context, int) (*models.Post, error)
	getBySlugFunc         func(context.Context, string, int) (*models.Post, error)
	getAllFunc            func(context.Context, string, string, []string, int, int, string, int) ([]models.Post, int, error)
	syncTagsFunc          func(context.Context, int, []string) error
	toggleLikeFunc        func(context.Context, int, int) (bool, error)
	getUserLikedPostsFunc func(context.Context, int) ([]models.Post, error)
	slugExistsFunc        func(context.Context, string) (bool, error)
	updateBlurHashFunc    func(context.Context, int, string) error
	getAllImageURLsFunc   func(context.Context) ([]string, error)
	withTransactionFunc   func(context.Context, func(domain.PostRepo) error) error
}

func (m *mockPostRepo) Create(ctx context.Context, p *models.Post) error { return m.createFunc(ctx, p) }
func (m *mockPostRepo) Update(ctx context.Context, p *models.Post) error { return m.updateFunc(ctx, p) }
func (m *mockPostRepo) Delete(ctx context.Context, id int) error         { return m.deleteFunc(ctx, id) }
func (m *mockPostRepo) GetByID(ctx context.Context, id int) (*models.Post, error) {
	return m.getByIDFunc(ctx, id)
}
func (m *mockPostRepo) GetAuthInfoByID(ctx context.Context, id int) (*models.Post, error) {
	return m.getAuthInfoByIDFunc(ctx, id)
}
func (m *mockPostRepo) GetBySlug(ctx context.Context, s string, c int) (*models.Post, error) {
	return m.getBySlugFunc(ctx, s, c)
}
func (m *mockPostRepo) GetAll(ctx context.Context, c, s string, t []string, l, o int, st string, uid int) ([]models.Post, int, error) {
	return m.getAllFunc(ctx, c, s, t, l, o, st, uid)
}
func (m *mockPostRepo) SyncTags(ctx context.Context, id int, t []string) error {
	return m.syncTagsFunc(ctx, id, t)
}
func (m *mockPostRepo) ToggleLike(ctx context.Context, u, p int) (bool, error) {
	return m.toggleLikeFunc(ctx, u, p)
}
func (m *mockPostRepo) GetUserLikedPosts(ctx context.Context, u int) ([]models.Post, error) {
	return m.getUserLikedPostsFunc(ctx, u)
}
func (m *mockPostRepo) SlugExists(ctx context.Context, s string) (bool, error) {
	return m.slugExistsFunc(ctx, s)
}
func (m *mockPostRepo) UpdateBlurHash(ctx context.Context, id int, h string) error {
	return m.updateBlurHashFunc(ctx, id, h)
}
func (m *mockPostRepo) GetAllImageURLs(ctx context.Context) ([]string, error) {
	return m.getAllImageURLsFunc(ctx)
}
func (m *mockPostRepo) WithTransaction(ctx context.Context, fn func(domain.PostRepo) error) error {
	return m.withTransactionFunc(ctx, fn)
}

type mockTagRepo struct {
	syncPostTagsFunc func(context.Context, int, []string) error
}

func (m *mockTagRepo) SyncPostTags(ctx context.Context, p int, t []string) error {
	return m.syncPostTagsFunc(ctx, p, t)
}

type mockImageService struct {
	genBlurHashFunc     func(string) (string, error)
	cleanupOrphanedFunc func(context.Context, []string) (int, error)
	saveFunc            func(io.Reader, string) (string, string, error)
}

func (m *mockImageService) GenerateBlurHash(l string) (string, error) { return m.genBlurHashFunc(l) }
func (m *mockImageService) CleanupOrphanedFiles(ctx context.Context, a []string) (int, error) {
	return m.cleanupOrphanedFunc(ctx, a)
}
func (m *mockImageService) Save(r io.Reader, filename string) (string, string, error) {
	return m.saveFunc(r, filename)
}

type mockSlugService struct {
	genSlugFunc func(context.Context, string) (string, error)
}

func (m *mockSlugService) GenerateUniqueSlug(ctx context.Context, t string) (string, error) {
	return m.genSlugFunc(ctx, t)
}

type mockSanitizer struct {
	sanitizeFunc func(*models.Post)
}

func (m *mockSanitizer) Sanitize(p *models.Post) {
	if m.sanitizeFunc != nil {
		m.sanitizeFunc(p)
	}
}

func TestCreateLibraryEntry_Success(t *testing.T) {
	ctx := context.Background()
	post := &models.Post{Title: "Test"}

	mockRepo := &mockPostRepo{}
	mockRepo.withTransactionFunc = func(ctx context.Context, fn func(domain.PostRepo) error) error {
		return fn(mockRepo)
	}
	mockRepo.createFunc = func(ctx context.Context, p *models.Post) error {
		p.ID = 1
		return nil
	}
	mockSlug := &mockSlugService{
		genSlugFunc: func(ctx context.Context, t string) (string, error) {
			return "test", nil
		},
	}
	mockSan := &mockSanitizer{sanitizeFunc: func(p *models.Post) {}}

	svc := NewPostService(mockRepo, &mockTagRepo{}, &mockImageService{}, mockSlug, mockSan)

	err := svc.CreateLibraryEntry(ctx, post, nil, "author", 1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if post.Slug != "test" {
		t.Errorf("expected slug test, got %s", post.Slug)
	}
}

func TestUpdatePost_Unauthorized(t *testing.T) {
	ctx := context.Background()
	mockRepo := &mockPostRepo{
		getAuthInfoByIDFunc: func(ctx context.Context, id int) (*models.Post, error) {
			return &models.Post{CreatedBy: 99}, nil
		},
	}
	svc := NewPostService(mockRepo, nil, nil, nil, nil)
	err := svc.UpdatePost(ctx, &models.Post{ID: 1}, nil, "author", 1)
	if err == nil || err.Error() != "unauthorized" {
		t.Errorf("expected unauthorized, got %v", err)
	}
}

func TestDeletePost_Success(t *testing.T) {
	ctx := context.Background()
	mockRepo := &mockPostRepo{
		getAuthInfoByIDFunc: func(ctx context.Context, id int) (*models.Post, error) {
			return &models.Post{CreatedBy: 1}, nil
		},
		deleteFunc: func(ctx context.Context, id int) error {
			return nil
		},
	}
	svc := NewPostService(mockRepo, nil, nil, nil, nil)
	err := svc.DeletePost(ctx, 1, "author", 1)
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
}

func TestGetAllPosts_Pagination(t *testing.T) {
	ctx := context.Background()
	mockRepo := &mockPostRepo{
		getAllFunc: func(ctx context.Context, c, s string, t []string, l, o int, st string, uid int) ([]models.Post, int, error) {
			return []models.Post{{ID: 1}}, 25, nil
		},
	}
	svc := NewPostService(mockRepo, nil, nil, nil, nil)
	_, meta, err := svc.GetAllPosts(ctx, "", "", nil, 1, 10, "user", 0)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if meta.TotalPages != 3 {
		t.Errorf("expected 3 pages, got %d", meta.TotalPages)
	}
}

func TestCleanupOrphanedFiles_Success(t *testing.T) {
	ctx := context.Background()
	mockRepo := &mockPostRepo{
		getAllImageURLsFunc: func(ctx context.Context) ([]string, error) {
			return []string{"a.jpg"}, nil
		},
	}
	mockImg := &mockImageService{
		cleanupOrphanedFunc: func(ctx context.Context, files []string) (int, error) {
			return 1, nil
		},
	}
	svc := NewPostService(mockRepo, nil, mockImg, nil, nil)
	count, err := svc.CleanupOrphanedFiles(ctx)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if count != 1 {
		t.Errorf("expected 1, got %d", count)
	}
}

func TestToggleLike_Success(t *testing.T) {
	ctx := context.Background()
	mockRepo := &mockPostRepo{
		toggleLikeFunc: func(ctx context.Context, u, p int) (bool, error) {
			return true, nil
		},
	}
	svc := NewPostService(mockRepo, nil, nil, nil, nil)
	res, err := svc.ToggleLike(ctx, 1, 1)
	if err != nil || !res {
		t.Errorf("expected true, got %v", res)
	}
}