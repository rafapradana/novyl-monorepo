package services

import (
	"errors"

	"github.com/google/uuid"
	"github.com/novyl/novyl/internal/models"
	"github.com/novyl/novyl/internal/repositories"
)

var ErrNoteNotFound = errors.New("catatan tidak ditemukan")

// UpdateNoteInput adalah input untuk mengupdate catatan.
type UpdateNoteInput struct {
	Content string `json:"content"`
}

// GetNote mengambil catatan chapter (atau buat kosong jika belum ada).
func GetNote(chapterID, userID uuid.UUID) (*models.ChapterNote, error) {
	// Verify ownership via chapter
	if _, err := GetChapter(chapterID, userID); err != nil {
		return nil, err
	}

	note, err := repositories.FindNoteByChapter(chapterID)
	if err != nil {
		// Return empty note if not found
		return &models.ChapterNote{
			ChapterID: chapterID,
			Content:   "",
		}, nil
	}

	return note, nil
}

// UpsertNote membuat atau mengupdate catatan chapter.
func UpsertNote(chapterID, userID uuid.UUID, input UpdateNoteInput) (*models.ChapterNote, error) {
	if _, err := GetChapter(chapterID, userID); err != nil {
		return nil, err
	}

	return repositories.UpsertNote(chapterID, input.Content)
}

// DeleteNote menghapus catatan chapter.
func DeleteNote(chapterID, userID uuid.UUID) error {
	if _, err := GetChapter(chapterID, userID); err != nil {
		return err
	}

	return repositories.DeleteNoteByChapter(chapterID)
}
