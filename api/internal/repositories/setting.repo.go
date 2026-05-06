package repositories

import (
	"github.com/google/uuid"
	"github.com/novyl/novyl/internal/database"
	"github.com/novyl/novyl/internal/models"
)

// CreateSetting membuat latar baru.
func CreateSetting(setting *models.Setting) error {
	return database.DB.Create(setting).Error
}

// FindSettingsByNovel mengambil semua latar dalam novel.
func FindSettingsByNovel(novelID uuid.UUID) ([]models.Setting, error) {
	var settings []models.Setting
	err := database.DB.Where("novel_id = ?", novelID).Order("created_at ASC").Find(&settings).Error
	return settings, err
}

// FindSettingByID mencari latar berdasarkan ID.
func FindSettingByID(id uuid.UUID) (*models.Setting, error) {
	var setting models.Setting
	err := database.DB.Where("id = ?", id).First(&setting).Error
	if err != nil {
		return nil, err
	}
	return &setting, nil
}

// UpdateSetting mengupdate data latar.
func UpdateSetting(id uuid.UUID, updates map[string]interface{}) error {
	return database.DB.Model(&models.Setting{}).Where("id = ?", id).Updates(updates).Error
}

// DeleteSetting menghapus latar.
func DeleteSetting(id uuid.UUID) error {
	return database.DB.Where("id = ?", id).Delete(&models.Setting{}).Error
}
