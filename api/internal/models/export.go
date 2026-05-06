package models

import (
	"time"

	"github.com/google/uuid"
)

// NovelExport adalah log export novel ke PDF/EPUB/DOCX.
type NovelExport struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	NovelID   uuid.UUID `gorm:"type:uuid;not null;index" json:"novel_id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	Format    string    `gorm:"type:varchar(10);not null" json:"format"`
	FilePath  string    `gorm:"type:varchar(500);not null" json:"file_path"`
	FileSize  *int64    `gorm:"type:bigint" json:"file_size"`
	CreatedAt time.Time `gorm:"not null;default:now()" json:"created_at"`
}

func (NovelExport) TableName() string {
	return "novel_exports"
}

// Genre adalah daftar genre yang tersedia di dropdown wizard.
type Genre struct {
	ID        int    `gorm:"primaryKey;autoIncrement" json:"id"`
	Name      string `gorm:"type:varchar(50);uniqueIndex;not null" json:"name"`
	SortOrder int    `gorm:"not null;default:0" json:"sort_order"`
}

func (Genre) TableName() string {
	return "genres"
}
