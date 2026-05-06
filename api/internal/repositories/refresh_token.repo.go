package repositories

import (
	"time"

	"github.com/google/uuid"
	"github.com/novyl/novyl/internal/database"
	"github.com/novyl/novyl/internal/models"
)

// CreateRefreshToken menyimpan refresh token baru ke database.
func CreateRefreshToken(token *models.RefreshToken) error {
	return database.DB.Create(token).Error
}

// FindRefreshToken mencari refresh token yang valid (belum revoked, belum expired).
func FindRefreshToken(tokenString string) (*models.RefreshToken, error) {
	var token models.RefreshToken
	err := database.DB.
		Where("token = ? AND revoked = false AND expires_at > ?", tokenString, time.Now()).
		First(&token).Error
	if err != nil {
		return nil, err
	}
	return &token, nil
}

// RevokeRefreshToken me-revoke satu refresh token (logout).
func RevokeRefreshToken(tokenString string) error {
	return database.DB.Model(&models.RefreshToken{}).
		Where("token = ?", tokenString).
		Update("revoked", true).Error
}

// RevokeAllUserTokens me-revoke semua refresh token milik user (logout all devices).
func RevokeAllUserTokens(userID uuid.UUID) error {
	return database.DB.Model(&models.RefreshToken{}).
		Where("user_id = ? AND revoked = false", userID).
		Update("revoked", true).Error
}

// DeleteExpiredTokens menghapus refresh token yang sudah expired (cleanup).
func DeleteExpiredTokens() error {
	return database.DB.Where("expires_at < ?", time.Now()).Delete(&models.RefreshToken{}).Error
}
