package models

import (
	"time"

	"github.com/google/uuid"
)

// NovelStatus enum: draft, in_progress, completed, archived
type NovelStatus string

const (
	NovelStatusDraft     NovelStatus = "draft"
	NovelStatusInProgess NovelStatus = "in_progress"
	NovelStatusCompleted NovelStatus = "completed"
	NovelStatusArchived  NovelStatus = "archived"
)

// Novel adalah project novel milik user, root entity untuk semua data novel.
// Status di-update otomatis: draft → in_progress (saat mulai menulis)
// → completed (saat semua bab selesai).
type Novel struct {
	ID             uuid.UUID   `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID         uuid.UUID   `gorm:"type:uuid;not null;index" json:"user_id"`
	Title          string      `gorm:"type:varchar(200);not null" json:"title"`
	Premise        *string     `gorm:"type:varchar(500)" json:"premise"`
	Genre          *string     `gorm:"type:varchar(50)" json:"genre"`
	Synopsis       *string     `gorm:"type:text" json:"synopsis"`
	CoverPath      *string     `gorm:"type:varchar(500)" json:"cover_path"`
	Blurb          *string     `gorm:"type:text" json:"blurb"`
	WordCountTarget *int       `gorm:"type:integer" json:"word_count_target"`
	Status         NovelStatus `gorm:"type:novel_status;not null;default:'draft'" json:"status"`
	CreatedAt      time.Time   `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt      time.Time   `gorm:"not null;default:now()" json:"updated_at"`

	// Relations
	Chapters    []Chapter    `gorm:"foreignKey:NovelID" json:"chapters,omitempty"`
	Characters  []Character  `gorm:"foreignKey:NovelID" json:"characters,omitempty"`
	Settings    []Setting    `gorm:"foreignKey:NovelID" json:"settings,omitempty"`
	FileAssets  []FileAsset  `gorm:"foreignKey:NovelID" json:"-"`
	Exports     []NovelExport `gorm:"foreignKey:NovelID" json:"-"`
}

func (Novel) TableName() string {
	return "novels"
}
