package repositories

import (
	"github.com/google/uuid"
	"github.com/novyl/novyl/internal/database"
	"github.com/novyl/novyl/internal/models"
	"gorm.io/gorm"
)

// CreateChapter membuat chapter baru di database.
func CreateChapter(chapter *models.Chapter) error {
	return database.DB.Create(chapter).Error
}

// FindChaptersByNovel mengambil semua chapter dalam novel, ordered by order_index.
func FindChaptersByNovel(novelID uuid.UUID) ([]models.Chapter, error) {
	var chapters []models.Chapter
	err := database.DB.
		Where("novel_id = ?", novelID).
		Order("order_index ASC").
		Find(&chapters).Error
	return chapters, err
}

// FindChapterByID mencari chapter berdasarkan ID.
func FindChapterByID(id uuid.UUID) (*models.Chapter, error) {
	var chapter models.Chapter
	err := database.DB.Where("id = ?", id).First(&chapter).Error
	if err != nil {
		return nil, err
	}
	return &chapter, nil
}

// UpdateChapter mengupdate data chapter.
func UpdateChapter(id uuid.UUID, updates map[string]interface{}) error {
	return database.DB.Model(&models.Chapter{}).Where("id = ?", id).Updates(updates).Error
}

// UpdateChapterContent mengupdate content dan word_count chapter.
func UpdateChapterContent(id uuid.UUID, content string, wordCount int) error {
	return database.DB.Model(&models.Chapter{}).Where("id = ?", id).Updates(map[string]interface{}{
		"content":     content,
		"word_count":  wordCount,
	}).Error
}

// UpdateChapterStatus mengupdate status chapter.
func UpdateChapterStatus(id uuid.UUID, status models.ChapterStatus) error {
	return database.DB.Model(&models.Chapter{}).Where("id = ?", id).Update("status", status).Error
}

// DeleteChapter menghapus chapter.
func DeleteChapter(id uuid.UUID) error {
	return database.DB.Where("id = ?", id).Delete(&models.Chapter{}).Error
}

// ReorderChapters mengupdate order_index untuk semua chapter dalam novel.
func ReorderChapters(novelID uuid.UUID, chapterIDs []uuid.UUID) error {
	return database.DB.Transaction(func(tx *gorm.DB) error {
		for i, id := range chapterIDs {
			if err := tx.Model(&models.Chapter{}).
				Where("id = ? AND novel_id = ?", id, novelID).
				Update("order_index", i).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

// CountChaptersByNovel menghitung jumlah chapter dalam novel.
func CountChaptersByNovel(novelID uuid.UUID) (int64, error) {
	var count int64
	err := database.DB.Model(&models.Chapter{}).Where("novel_id = ?", novelID).Count(&count).Error
	return count, err
}
