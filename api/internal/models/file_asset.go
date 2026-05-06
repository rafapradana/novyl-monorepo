package models

import (
	"time"

	"github.com/google/uuid"
)

// FileType enum: tipe file yang tersimpan di MinIO
type FileType string

const (
	FileTypeProfilePhoto   FileType = "profile_photo"
	FileTypeCover          FileType = "cover"
	FileTypeCharacterImage FileType = "character_image"
	FileTypeSettingImage   FileType = "setting_image"
	FileTypeExportPDF      FileType = "export_pdf"
	FileTypeExportEPUB     FileType = "export_epub"
	FileTypeExportDOCX     FileType = "export_docx"
)

// FileAsset adalah central registry untuk semua file di MinIO.
// Kolom *_path di tabel utama tetap dipertahankan untuk query cepat tanpa join.
type FileAsset struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID     uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	NovelID    *uuid.UUID `gorm:"type:uuid;index" json:"novel_id"`
	EntityType string    `gorm:"type:varchar(50);not null" json:"entity_type"`
	EntityID   *uuid.UUID `gorm:"type:uuid" json:"entity_id"`
	FileType   FileType  `gorm:"type:file_type;not null" json:"file_type"`
	ObjectKey  string    `gorm:"type:varchar(500);uniqueIndex;not null" json:"object_key"`
	FileName   string    `gorm:"type:varchar(255);not null" json:"file_name"`
	FileSize   *int64    `gorm:"type:bigint" json:"file_size"`
	MimeType   *string   `gorm:"type:varchar(100)" json:"mime_type"`
	CreatedAt  time.Time `gorm:"not null;default:now()" json:"created_at"`
}

func (FileAsset) TableName() string {
	return "file_assets"
}
