package repositories

import (
	"github.com/google/uuid"
	"github.com/novyl/novyl/internal/database"
	"github.com/novyl/novyl/internal/models"
)

// FindNoteByChapter mengambil catatan berdasarkan chapter ID.
func FindNoteByChapter(chapterID uuid.UUID) (*models.ChapterNote, error) {
	var note models.ChapterNote
	err := database.DB.Where("chapter_id = ?", chapterID).First(&note).Error
	if err != nil {
		return nil, err
	}
	return &note, nil
}

// UpsertNote membuat atau mengupdate catatan chapter.
func UpsertNote(chapterID uuid.UUID, content string) (*models.ChapterNote, error) {
	var note models.ChapterNote
	err := database.DB.Where("chapter_id = ?", chapterID).First(&note).Error

	if err != nil {
		// Not found, create new
		note = models.ChapterNote{
			ID:        uuid.New(),
			ChapterID: chapterID,
			Content:   content,
		}
		if err := database.DB.Create(&note).Error; err != nil {
			return nil, err
		}
	} else {
		// Found, update
		note.Content = content
		if err := database.DB.Save(&note).Error; err != nil {
			return nil, err
		}
	}

	return &note, nil
}

// DeleteNoteByChapter menghapus catatan berdasarkan chapter ID.
func DeleteNoteByChapter(chapterID uuid.UUID) error {
	return database.DB.Where("chapter_id = ?", chapterID).Delete(&models.ChapterNote{}).Error
}
