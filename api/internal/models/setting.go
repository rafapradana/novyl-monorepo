package models

import (
	"time"

	"github.com/google/uuid"
)

// Setting adalah latar/setting dalam novel.
// Lokasi, dunia, tempat-tempat penting.
type Setting struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	NovelID     uuid.UUID `gorm:"type:uuid;not null;index" json:"novel_id"`
	Name        string    `gorm:"type:varchar(100);not null" json:"name"`
	Description *string   `gorm:"type:text" json:"description"`
	ImagePath   *string   `gorm:"type:varchar(500)" json:"image_path"`
	CreatedAt   time.Time `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt   time.Time `gorm:"not null;default:now()" json:"updated_at"`
}

func (Setting) TableName() string {
	return "settings"
}
