package models

import (
	"time"

	"github.com/google/uuid"
)

// RefreshToken menyimpan refresh token untuk JWT dual token auth.
// Access token tidak disimpan di DB (stateless, short-lived).
// Refresh token bisa di-revoke (logout, ganti password).
type RefreshToken struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	Token     string    `gorm:"type:varchar(500);uniqueIndex;not null" json:"-"`
	ExpiresAt time.Time `gorm:"not null" json:"expires_at"`
	Revoked   bool      `gorm:"not null;default:false" json:"revoked"`
	CreatedAt time.Time `gorm:"not null;default:now()" json:"created_at"`
}

func (RefreshToken) TableName() string {
	return "refresh_tokens"
}

// PasswordReset menyimpan token untuk fitur lupa password.
// Token expired setelah 1 jam (di-enforce di aplikasi).
// Sudah dipakai (Used=true) tidak bisa dipakai lagi.
type PasswordReset struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	Token     string    `gorm:"type:varchar(255);uniqueIndex;not null" json:"-"`
	Used      bool      `gorm:"not null;default:false" json:"used"`
	ExpiresAt time.Time `gorm:"not null" json:"expires_at"`
	CreatedAt time.Time `gorm:"not null;default:now()" json:"created_at"`
}

func (PasswordReset) TableName() string {
	return "password_resets"
}
