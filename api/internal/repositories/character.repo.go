package repositories

import (
	"github.com/google/uuid"
	"github.com/novyl/novyl/internal/database"
	"github.com/novyl/novyl/internal/models"
)

// CreateCharacter membuat karakter baru.
func CreateCharacter(character *models.Character) error {
	return database.DB.Create(character).Error
}

// FindCharactersByNovel mengambil semua karakter dalam novel.
func FindCharactersByNovel(novelID uuid.UUID) ([]models.Character, error) {
	var characters []models.Character
	err := database.DB.Where("novel_id = ?", novelID).Order("created_at ASC").Find(&characters).Error
	return characters, err
}

// FindCharacterByID mencari karakter berdasarkan ID.
func FindCharacterByID(id uuid.UUID) (*models.Character, error) {
	var character models.Character
	err := database.DB.Where("id = ?", id).First(&character).Error
	if err != nil {
		return nil, err
	}
	return &character, nil
}

// UpdateCharacter mengupdate data karakter.
func UpdateCharacter(id uuid.UUID, updates map[string]interface{}) error {
	return database.DB.Model(&models.Character{}).Where("id = ?", id).Updates(updates).Error
}

// DeleteCharacter menghapus karakter.
func DeleteCharacter(id uuid.UUID) error {
	return database.DB.Where("id = ?", id).Delete(&models.Character{}).Error
}
