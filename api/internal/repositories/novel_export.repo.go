package repositories

import (
	"github.com/google/uuid"
	"github.com/novyl/novyl/internal/database"
	"github.com/novyl/novyl/internal/models"
)

// CreateNovelExport menyimpan record export baru.
func CreateNovelExport(exp *models.NovelExport) error {
	return database.DB.Create(exp).Error
}

// FindExportsByNovel mengambil semua export history novel.
func FindExportsByNovel(novelID uuid.UUID) ([]models.NovelExport, error) {
	var exports []models.NovelExport
	err := database.DB.
		Where("novel_id = ?", novelID).
		Order("created_at DESC").
		Find(&exports).Error
	return exports, err
}
