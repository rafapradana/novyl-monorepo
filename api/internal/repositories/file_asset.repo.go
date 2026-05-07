package repositories

import (
	"github.com/google/uuid"
	"github.com/novyl/novyl/internal/database"
	"github.com/novyl/novyl/internal/models"
)

// CreateFileAsset menyimpan record file asset baru.
func CreateFileAsset(asset *models.FileAsset) error {
	return database.DB.Create(asset).Error
}

// FindFileAssetByID mencari file asset berdasarkan ID.
func FindFileAssetByID(id uuid.UUID) (*models.FileAsset, error) {
	var asset models.FileAsset
	err := database.DB.Where("id = ?", id).First(&asset).Error
	if err != nil {
		return nil, err
	}
	return &asset, nil
}

// FindFileAssetsByEntity mencari file assets berdasarkan entity type dan ID.
func FindFileAssetsByEntity(entityType string, entityID uuid.UUID) ([]models.FileAsset, error) {
	var assets []models.FileAsset
	err := database.DB.
		Where("entity_type = ? AND entity_id = ?", entityType, entityID).
		Order("created_at DESC").
		Find(&assets).Error
	return assets, err
}

// FindFileAssetsByNovel mencari semua file assets dalam novel.
func FindFileAssetsByNovel(novelID uuid.UUID) ([]models.FileAsset, error) {
	var assets []models.FileAsset
	err := database.DB.
		Where("novel_id = ?", novelID).
		Order("created_at DESC").
		Find(&assets).Error
	return assets, err
}

// DeleteFileAsset menghapus record file asset.
func DeleteFileAsset(id uuid.UUID) error {
	return database.DB.Where("id = ?", id).Delete(&models.FileAsset{}).Error
}

// DeleteFileAssetByObjectKey menghapus record berdasarkan object key.
func DeleteFileAssetByObjectKey(objectKey string) error {
	return database.DB.Where("object_key = ?", objectKey).Delete(&models.FileAsset{}).Error
}
