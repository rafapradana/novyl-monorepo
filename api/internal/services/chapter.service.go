package services

import (
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/novyl/novyl/internal/models"
	"github.com/novyl/novyl/internal/repositories"
)

var (
	ErrChapterNotFound = errors.New("chapter tidak ditemukan")
)

// CreateChapterInput adalah input untuk membuat chapter baru.
type CreateChapterInput struct {
	Title      string  `json:"title" validate:"required,max=200"`
	Outline    *string `json:"outline"`
	OrderIndex *int    `json:"order_index"`
}

// UpdateChapterInput adalah input untuk mengupdate chapter.
type UpdateChapterInput struct {
	Title   *string `json:"title"`
	Outline *string `json:"outline"`
}

// UpdateChapterContentInput adalah input untuk mengupdate content chapter.
type UpdateChapterContentInput struct {
	Content string `json:"content" validate:"required"`
}

// UpdateChapterStatusInput adalah input untuk mengupdate status chapter.
type UpdateChapterStatusInput struct {
	Status models.ChapterStatus `json:"status" validate:"required"`
}

// ReorderChaptersInput adalah input untuk reorder chapters.
type ReorderChaptersInput struct {
	ChapterIDs []uuid.UUID `json:"chapter_ids" validate:"required"`
}

// CreateChapter membuat chapter baru dalam novel.
func CreateChapter(novelID uuid.UUID, input CreateChapterInput) (*models.Chapter, error) {
	// Hitung order_index jika tidak diberikan
	orderIndex := 0
	if input.OrderIndex != nil {
		orderIndex = *input.OrderIndex
	} else {
		count, _ := repositories.CountChaptersByNovel(novelID)
		orderIndex = int(count)
	}

	chapter := &models.Chapter{
		ID:               uuid.New(),
		NovelID:          novelID,
		Title:            input.Title,
		Outline:          input.Outline,
		OrderIndex:       orderIndex,
		Status:           models.ChapterStatusDraft,
		GenerationStatus: models.GenerationStatusWaiting,
	}

	if err := repositories.CreateChapter(chapter); err != nil {
		return nil, err
	}

	// Update novel status ke in_progress jika masih draft
	novel, _ := repositories.FindNovelByID(novelID)
	if novel != nil && novel.Status == models.NovelStatusDraft {
		_ = repositories.UpdateNovelStatus(novelID, models.NovelStatusInProgess)
	}

	return chapter, nil
}

// GetChaptersByNovel mengambil semua chapter dalam novel.
func GetChaptersByNovel(novelID, userID uuid.UUID) ([]models.Chapter, error) {
	// Verify ownership
	novel, err := repositories.FindNovelByID(novelID)
	if err != nil {
		return nil, ErrNovelNotFound
	}
	if novel.UserID != userID {
		return nil, ErrNotOwner
	}

	return repositories.FindChaptersByNovel(novelID)
}

// GetChapter mengambil satu chapter berdasarkan ID.
func GetChapter(chapterID, userID uuid.UUID) (*models.Chapter, error) {
	chapter, err := repositories.FindChapterByID(chapterID)
	if err != nil {
		return nil, ErrChapterNotFound
	}

	// Verify ownership via novel
	novel, err := repositories.FindNovelByID(chapter.NovelID)
	if err != nil {
		return nil, ErrNovelNotFound
	}
	if novel.UserID != userID {
		return nil, ErrNotOwner
	}

	return chapter, nil
}

// UpdateChapter mengupdate data chapter (title, outline).
func UpdateChapter(chapterID, userID uuid.UUID, input UpdateChapterInput) (*models.Chapter, error) {
	if _, err := GetChapter(chapterID, userID); err != nil {
		return nil, err
	}

	updates := map[string]interface{}{}
	if input.Title != nil {
		updates["title"] = *input.Title
	}
	if input.Outline != nil {
		updates["outline"] = *input.Outline
	}

	if len(updates) > 0 {
		if err := repositories.UpdateChapter(chapterID, updates); err != nil {
			return nil, err
		}
	}

	return repositories.FindChapterByID(chapterID)
}

// UpdateChapterContent mengupdate content dan word count.
func UpdateChapterContent(chapterID, userID uuid.UUID, input UpdateChapterContentInput) (*models.Chapter, error) {
	if _, err := GetChapter(chapterID, userID); err != nil {
		return nil, err
	}

	wordCount := len(strings.Fields(input.Content))

	if err := repositories.UpdateChapterContent(chapterID, input.Content, wordCount); err != nil {
		return nil, err
	}

	// Auto-update status ke in_progress jika masih draft
	chapter, _ := repositories.FindChapterByID(chapterID)
	if chapter != nil && chapter.Status == models.ChapterStatusDraft {
		_ = repositories.UpdateChapterStatus(chapterID, models.ChapterStatusInProgress)
	}

	return repositories.FindChapterByID(chapterID)
}

// UpdateChapterStatus mengupdate status chapter.
func UpdateChapterStatus(chapterID, userID uuid.UUID, status models.ChapterStatus) (*models.Chapter, error) {
	if _, err := GetChapter(chapterID, userID); err != nil {
		return nil, err
	}

	if err := repositories.UpdateChapterStatus(chapterID, status); err != nil {
		return nil, err
	}

	return repositories.FindChapterByID(chapterID)
}

// DeleteChapter menghapus chapter.
func DeleteChapter(chapterID, userID uuid.UUID) error {
	if _, err := GetChapter(chapterID, userID); err != nil {
		return err
	}
	return repositories.DeleteChapter(chapterID)
}

// ReorderChapters mengurutkan ulang chapter.
func ReorderChapters(novelID, userID uuid.UUID, input ReorderChaptersInput) error {
	// Verify ownership
	novel, err := repositories.FindNovelByID(novelID)
	if err != nil {
		return ErrNovelNotFound
	}
	if novel.UserID != userID {
		return ErrNotOwner
	}

	return repositories.ReorderChapters(novelID, input.ChapterIDs)
}
