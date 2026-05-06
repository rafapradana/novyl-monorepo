package models

import (
	"time"

	"github.com/google/uuid"
)

// ChapterNote adalah catatan bebas per bab, 1:1 dengan chapter.
// Auto-save dari frontend dengan debounce.
type ChapterNote struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ChapterID uuid.UUID `gorm:"type:uuid;uniqueIndex;not null" json:"chapter_id"`
	Content   string    `gorm:"type:text;not null;default:''" json:"content"`
	CreatedAt time.Time `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt time.Time `gorm:"not null;default:now()" json:"updated_at"`
}

func (ChapterNote) TableName() string {
	return "chapter_notes"
}
