package models

import (
	"time"

	"github.com/google/uuid"
)

// User menyimpan data autentikasi dan profil user.
// Password di-hash pakai bcrypt sebelum insert (di level aplikasi).
// AvatarPath menyimpan object key di MinIO, bukan URL langsung.
type User struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name         string     `gorm:"type:varchar(100);not null" json:"name"`
	Email        string     `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	PasswordHash string     `gorm:"type:varchar(255);not null" json:"-"`
	AvatarPath   *string    `gorm:"type:varchar(500)" json:"avatar_path"`
	CreatedAt    time.Time  `gorm:"not null;default:now()" json:"created_at"`
	UpdatedAt    time.Time  `gorm:"not null;default:now()" json:"updated_at"`

	// Relations
	RefreshTokens  []RefreshToken  `gorm:"foreignKey:UserID" json:"-"`
	PasswordResets []PasswordReset `gorm:"foreignKey:UserID" json:"-"`
	Novels         []Novel         `gorm:"foreignKey:UserID" json:"-"`
}

func (User) TableName() string {
	return "users"
}
