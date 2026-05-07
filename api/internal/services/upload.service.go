package services

import (
	"context"
	"errors"
	"path/filepath"
	"time"

	"github.com/google/uuid"
	"github.com/novyl/novyl/internal/config"
	"github.com/novyl/novyl/internal/models"
	"github.com/novyl/novyl/internal/repositories"
	"github.com/novyl/novyl/internal/utils"
)

var ErrFileNotFound = errors.New("file tidak ditemukan")

// PresignUploadInput adalah input untuk generate presigned upload URL.
type PresignUploadInput struct {
	FileName   string `json:"file_name" validate:"required"`
	FileType   string `json:"file_type" validate:"required"`
	EntityType string `json:"entity_type" validate:"required"`
	EntityID   string `json:"entity_id"`
	NovelID    string `json:"novel_id"`
}

// PresignUploadOutput adalah output presigned upload URL.
type PresignUploadOutput struct {
	UploadURL string `json:"upload_url"`
	ObjectKey string `json:"object_key"`
	ExpiresIn int    `json:"expires_in"`
}

// PresignDownloadOutput adalah output presigned download URL.
type PresignDownloadOutput struct {
	URL       string `json:"url"`
	ExpiresIn int    `json:"expires_in"`
}

// GeneratePresignedUploadURL membuat presigned URL untuk upload file ke MinIO.
func GeneratePresignedUploadURL(userID uuid.UUID, input PresignUploadInput, cfg *config.Config) (*PresignUploadOutput, error) {
	ext := filepath.Ext(input.FileName)
	if ext == "" {
		ext = ".bin"
	} else {
		ext = ext[1:] // remove dot
	}

	entityID := input.EntityID
	if entityID == "" {
		entityID = userID.String()
	}

	novelID := ""
	if input.NovelID != "" {
		novelID = input.NovelID
	}

	objectKey := utils.BuildObjectKey(
		userID.String(),
		novelID,
		input.EntityType,
		entityID,
		ext,
	)

	expiry := 15 * time.Minute
	presignedURL, err := utils.PresignedPutURL(context.Background(), cfg.MinIOBucket, objectKey, expiry)
	if err != nil {
		return nil, err
	}

	return &PresignUploadOutput{
		UploadURL: presignedURL.String(),
		ObjectKey: objectKey,
		ExpiresIn: int(expiry.Seconds()),
	}, nil
}

// SaveFileAsset menyimpan record file asset setelah upload berhasil dari frontend.
func SaveFileAsset(userID uuid.UUID, input PresignUploadInput, objectKey string, fileSize int64, cfg *config.Config) (*models.FileAsset, error) {
	var novelID *uuid.UUID
	if input.NovelID != "" {
		id, err := uuid.Parse(input.NovelID)
		if err == nil {
			novelID = &id
		}
	}

	var entityID *uuid.UUID
	if input.EntityID != "" {
		id, err := uuid.Parse(input.EntityID)
		if err == nil {
			entityID = &id
		}
	}

	asset := &models.FileAsset{
		ID:         uuid.New(),
		UserID:     userID,
		NovelID:    novelID,
		EntityType: input.EntityType,
		EntityID:   entityID,
		FileType:   models.FileType(input.FileType),
		ObjectKey:  objectKey,
		FileName:   input.FileName,
		FileSize:   &fileSize,
		MimeType:   getMimeType(input.FileName),
	}

	if err := repositories.CreateFileAsset(asset); err != nil {
		return nil, err
	}

	return asset, nil
}

// GetPresignedDownloadURL membuat presigned URL untuk download/view file dari MinIO.
func GetPresignedDownloadURL(objectKey string, cfg *config.Config) (*PresignDownloadOutput, error) {
	expiry := 60 * time.Minute
	presignedURL, err := utils.PresignedGetURL(context.Background(), cfg.MinIOBucket, objectKey, expiry)
	if err != nil {
		return nil, err
	}

	return &PresignDownloadOutput{
		URL:       presignedURL.String(),
		ExpiresIn: int(expiry.Seconds()),
	}, nil
}

// DeleteFile menghapus file dari MinIO dan record dari database.
func DeleteFile(objectKey string, cfg *config.Config) error {
	// Delete from MinIO
	if err := utils.DeleteFile(context.Background(), cfg.MinIOBucket, objectKey); err != nil {
		// Log error but continue to delete DB record
	}

	// Delete from database
	return repositories.DeleteFileAssetByObjectKey(objectKey)
}

func getMimeType(filename string) *string {
	ext := filepath.Ext(filename)
	mimeMap := map[string]string{
		".jpg":  "image/jpeg",
		".jpeg": "image/jpeg",
		".png":  "image/png",
		".webp": "image/webp",
		".gif":  "image/gif",
		".pdf":  "application/pdf",
		".epub": "application/epub+zip",
		".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	}
	if mime, ok := mimeMap[ext]; ok {
		return &mime
	}
	return nil
}
