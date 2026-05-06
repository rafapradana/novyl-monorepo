package services

import (
	"errors"

	"github.com/google/uuid"
	"github.com/novyl/novyl/internal/models"
	"github.com/novyl/novyl/internal/repositories"
)

var (
	ErrNovelNotFound = errors.New("novel tidak ditemukan")
	ErrNotOwner      = errors.New("anda bukan pemilik novel ini")
)

// CreateNovelInput adalah input untuk membuat novel baru.
type CreateNovelInput struct {
	Title    string  `json:"title" validate:"required,max=200"`
	Premise  *string `json:"premise"`
	Genre    *string `json:"genre"`
	Synopsis *string `json:"synopsis"`
}

// UpdateNovelInput adalah input untuk mengupdate novel.
type UpdateNovelInput struct {
	Title    *string `json:"title"`
	Premise  *string `json:"premise"`
	Genre    *string `json:"genre"`
	Synopsis *string `json:"synopsis"`
	Blurb    *string `json:"blurb"`
}

// CreateNovel membuat novel baru.
func CreateNovel(userID uuid.UUID, input CreateNovelInput) (*models.Novel, error) {
	novel := &models.Novel{
		ID:     uuid.New(),
		UserID: userID,
		Title:  input.Title,
		Status: models.NovelStatusDraft,
	}

	if input.Premise != nil {
		novel.Premise = input.Premise
	}
	if input.Genre != nil {
		novel.Genre = input.Genre
	}
	if input.Synopsis != nil {
		novel.Synopsis = input.Synopsis
	}

	if err := repositories.CreateNovel(novel); err != nil {
		return nil, err
	}

	return novel, nil
}

// GetNovel mengambil novel berdasarkan ID (dengan relasi).
func GetNovel(novelID, userID uuid.UUID) (*models.Novel, error) {
	novel, err := repositories.FindNovelByID(novelID)
	if err != nil {
		return nil, ErrNovelNotFound
	}
	if novel.UserID != userID {
		return nil, ErrNotOwner
	}
	return novel, nil
}

// GetUserNovels mengambil semua novel milik user.
func GetUserNovels(userID uuid.UUID) ([]models.Novel, error) {
	return repositories.FindNovelsByUser(userID)
}

// UpdateNovel mengupdate data novel.
func UpdateNovel(novelID, userID uuid.UUID, input UpdateNovelInput) (*models.Novel, error) {
	novel, err := repositories.FindNovelByID(novelID)
	if err != nil {
		return nil, ErrNovelNotFound
	}
	if novel.UserID != userID {
		return nil, ErrNotOwner
	}

	updates := map[string]interface{}{}
	if input.Title != nil {
		updates["title"] = *input.Title
	}
	if input.Premise != nil {
		updates["premise"] = *input.Premise
	}
	if input.Genre != nil {
		updates["genre"] = *input.Genre
	}
	if input.Synopsis != nil {
		updates["synopsis"] = *input.Synopsis
	}
	if input.Blurb != nil {
		updates["blurb"] = *input.Blurb
	}

	if len(updates) > 0 {
		if err := repositories.UpdateNovel(novelID, updates); err != nil {
			return nil, err
		}
	}

	return repositories.FindNovelByID(novelID)
}

// DeleteNovel menghapus novel dan semua relasinya.
func DeleteNovel(novelID, userID uuid.UUID) error {
	novel, err := repositories.FindNovelByID(novelID)
	if err != nil {
		return ErrNovelNotFound
	}
	if novel.UserID != userID {
		return ErrNotOwner
	}
	return repositories.DeleteNovel(novelID)
}
