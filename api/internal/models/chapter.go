package models

import (
	"time"

	"github.com/google/uuid"
)

// ChapterStatus enum: draft, in_progress, completed, failed
type ChapterStatus string

const (
	ChapterStatusDraft     ChapterStatus = "draft"
	ChapterStatusInProgress ChapterStatus = "in_progress"
	ChapterStatusCompleted ChapterStatus = "completed"
	ChapterStatusFailed    ChapterStatus = "failed"
)

// GenerationStatus enum: waiting, generating, completed, failed, skipped
type GenerationStatus string

const (
	GenerationStatusWaiting    GenerationStatus = "waiting"
	GenerationStatusGenerating GenerationStatus = "generating"
	GenerationStatusCompleted  GenerationStatus = "completed"
	GenerationStatusFailed     GenerationStatus = "failed"
	GenerationStatusSkipped    GenerationStatus = "skipped"
)

// Chapter adalah bab dalam novel. Urutan ditentukan oleh OrderIndex.
// Content menyimpan isi bab (plain text atau Tiptap JSON).
// GenerationStatus untuk tracking AI generation (future feature).
type Chapter struct {
	ID               uuid.UUID        `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	NovelID          uuid.UUID        `gorm:"type:uuid;not null;index" json:"novel_id"`
	Title            string           `gorm:"type:varchar(200);not null" json:"title"`
	Outline          *string          `gorm:"type:text" json:"outline"`
	Content          *string          `gorm:"type:text" json:"content"`
	WordCount        int              `gorm:"not null;default:0" json:"word_count"`
	OrderIndex       int              `gorm:"not null" json:"order_index"`
	Status           ChapterStatus    `gorm:"type:chapter_status;not null;default:'draft'" json:"status"`
	GenerationStatus GenerationStatus `gorm:"type:generation_status;not null;default:'waiting'" json:"generation_status"`
	CreatedAt        time.Time        `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt        time.Time        `gorm:"not null;default:now()" json:"updated_at"`

	// Relations
	Note *ChapterNote `gorm:"foreignKey:ChapterID" json:"note,omitempty"`
}

func (Chapter) TableName() string {
	return "chapters"
}
