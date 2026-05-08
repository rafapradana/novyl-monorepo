package services

import (
	"errors"

	"github.com/google/uuid"
	"github.com/novyl/novyl/internal/models"
	"github.com/novyl/novyl/internal/repositories"
)

var ErrSettingNotFound = errors.New("latar tidak ditemukan")

// CreateSettingInput adalah input untuk membuat latar.
type CreateSettingInput struct {
	Name        string  `json:"name" validate:"required,max=100"`
	Description *string `json:"description"`
	ImagePath   *string `json:"image_path"`
}

// UpdateSettingInput adalah input untuk mengupdate latar.
type UpdateSettingInput struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
	ImagePath   *string `json:"image_path"`
}

// CreateSetting membuat latar baru dalam novel.
func CreateSetting(novelID, userID uuid.UUID, input CreateSettingInput) (*models.Setting, error) {
	if _, err := GetNovel(novelID, userID); err != nil {
		return nil, err
	}

	setting := &models.Setting{
		ID:      uuid.New(),
		NovelID: novelID,
		Name:    input.Name,
	}

	if input.Description != nil {
		setting.Description = input.Description
	}
	if input.ImagePath != nil {
		setting.ImagePath = input.ImagePath
	}

	if err := repositories.CreateSetting(setting); err != nil {
		return nil, err
	}

	return setting, nil
}

// GetSettingsByNovel mengambil semua latar dalam novel.
func GetSettingsByNovel(novelID, userID uuid.UUID) ([]models.Setting, error) {
	if _, err := GetNovel(novelID, userID); err != nil {
		return nil, err
	}
	return repositories.FindSettingsByNovel(novelID)
}

// UpdateSetting mengupdate data latar.
func UpdateSetting(settingID, userID uuid.UUID, input UpdateSettingInput) (*models.Setting, error) {
	setting, err := repositories.FindSettingByID(settingID)
	if err != nil {
		return nil, ErrSettingNotFound
	}

	if _, err := GetNovel(setting.NovelID, userID); err != nil {
		return nil, err
	}

	updates := map[string]interface{}{}
	if input.Name != nil {
		updates["name"] = *input.Name
	}
	if input.Description != nil {
		updates["description"] = *input.Description
	}
	if input.ImagePath != nil {
		updates["image_path"] = *input.ImagePath
	}

	if len(updates) > 0 {
		if err := repositories.UpdateSetting(settingID, updates); err != nil {
			return nil, err
		}
	}

	return repositories.FindSettingByID(settingID)
}

// DeleteSetting menghapus latar.
func DeleteSetting(settingID, userID uuid.UUID) error {
	setting, err := repositories.FindSettingByID(settingID)
	if err != nil {
		return ErrSettingNotFound
	}

	if _, err := GetNovel(setting.NovelID, userID); err != nil {
		return err
	}

	return repositories.DeleteSetting(settingID)
}
