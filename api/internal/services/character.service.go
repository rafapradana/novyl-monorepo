package services

import (
	"errors"

	"github.com/google/uuid"
	"github.com/novyl/novyl/internal/models"
	"github.com/novyl/novyl/internal/repositories"
)

var ErrCharacterNotFound = errors.New("karakter tidak ditemukan")

// CreateCharacterInput adalah input untuk membuat karakter.
type CreateCharacterInput struct {
	Name        string  `json:"name" validate:"required,max=100"`
	Description *string `json:"description"`
}

// UpdateCharacterInput adalah input untuk mengupdate karakter.
type UpdateCharacterInput struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
}

// CreateCharacter membuat karakter baru dalam novel.
func CreateCharacter(novelID, userID uuid.UUID, input CreateCharacterInput) (*models.Character, error) {
	if _, err := GetNovel(novelID, userID); err != nil {
		return nil, err
	}

	character := &models.Character{
		ID:      uuid.New(),
		NovelID: novelID,
		Name:    input.Name,
	}

	if input.Description != nil {
		character.Description = input.Description
	}

	if err := repositories.CreateCharacter(character); err != nil {
		return nil, err
	}

	return character, nil
}

// GetCharactersByNovel mengambil semua karakter dalam novel.
func GetCharactersByNovel(novelID, userID uuid.UUID) ([]models.Character, error) {
	if _, err := GetNovel(novelID, userID); err != nil {
		return nil, err
	}
	return repositories.FindCharactersByNovel(novelID)
}

// UpdateCharacter mengupdate data karakter.
func UpdateCharacter(charID, userID uuid.UUID, input UpdateCharacterInput) (*models.Character, error) {
	character, err := repositories.FindCharacterByID(charID)
	if err != nil {
		return nil, ErrCharacterNotFound
	}

	// Verify ownership via novel
	if _, err := GetNovel(character.NovelID, userID); err != nil {
		return nil, err
	}

	updates := map[string]interface{}{}
	if input.Name != nil {
		updates["name"] = *input.Name
	}
	if input.Description != nil {
		updates["description"] = *input.Description
	}

	if len(updates) > 0 {
		if err := repositories.UpdateCharacter(charID, updates); err != nil {
			return nil, err
		}
	}

	return repositories.FindCharacterByID(charID)
}

// DeleteCharacter menghapus karakter.
func DeleteCharacter(charID, userID uuid.UUID) error {
	character, err := repositories.FindCharacterByID(charID)
	if err != nil {
		return ErrCharacterNotFound
	}

	if _, err := GetNovel(character.NovelID, userID); err != nil {
		return err
	}

	return repositories.DeleteCharacter(charID)
}
