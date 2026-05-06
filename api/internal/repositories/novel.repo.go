package repositories

import (
	"github.com/google/uuid"
	"github.com/novyl/novyl/internal/database"
	"github.com/novyl/novyl/internal/models"
	"gorm.io/gorm"
)

// CreateNovel membuat novel baru di database.
func CreateNovel(novel *models.Novel) error {
	return database.DB.Create(novel).Error
}

// FindNovelByID mencari novel berdasarkan ID (dengan chapters, characters, settings).
func FindNovelByID(id uuid.UUID) (*models.Novel, error) {
	var novel models.Novel
	err := database.DB.
		Preload("Chapters", func(db *gorm.DB) *gorm.DB {
			return db.Order("order_index ASC")
		}).
		Preload("Characters").
		Preload("Settings").
		Where("id = ?", id).
		First(&novel).Error
	if err != nil {
		return nil, err
	}
	return &novel, nil
}

// FindNovelsByUser mengambil semua novel milik user (tanpa preload relations).
func FindNovelsByUser(userID uuid.UUID) ([]models.Novel, error) {
	var novels []models.Novel
	err := database.DB.
		Where("user_id = ?", userID).
		Order("updated_at DESC").
		Find(&novels).Error
	return novels, err
}

// UpdateNovel mengupdate data novel.
func UpdateNovel(id uuid.UUID, updates map[string]interface{}) error {
	return database.DB.Model(&models.Novel{}).Where("id = ?", id).Updates(updates).Error
}

// UpdateNovelStatus mengupdate status novel.
func UpdateNovelStatus(id uuid.UUID, status models.NovelStatus) error {
	return database.DB.Model(&models.Novel{}).Where("id = ?", id).Update("status", status).Error
}

// DeleteNovel menghapus novel (cascade ke chapters, characters, settings).
func DeleteNovel(id uuid.UUID) error {
	return database.DB.Where("id = ?", id).Delete(&models.Novel{}).Error
}
