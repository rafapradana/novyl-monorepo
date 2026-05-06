package repositories

import (
	"github.com/google/uuid"
	"github.com/novyl/novyl/internal/database"
	"github.com/novyl/novyl/internal/models"
)

// CreateUser membuat user baru di database.
func CreateUser(user *models.User) error {
	return database.DB.Create(user).Error
}

// FindUserByEmail mencari user berdasarkan email.
func FindUserByEmail(email string) (*models.User, error) {
	var user models.User
	err := database.DB.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// FindUserByID mencari user berdasarkan ID.
func FindUserByID(id uuid.UUID) (*models.User, error) {
	var user models.User
	err := database.DB.Where("id = ?", id).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// UpdateUserProfile mengupdate nama dan avatar user.
func UpdateUserProfile(id uuid.UUID, name string, avatarPath *string) error {
	updates := map[string]interface{}{
		"name": name,
	}
	if avatarPath != nil {
		updates["avatar_path"] = avatarPath
	}
	return database.DB.Model(&models.User{}).Where("id = ?", id).Updates(updates).Error
}

// UpdateUserPassword mengupdate password hash user.
func UpdateUserPassword(id uuid.UUID, passwordHash string) error {
	return database.DB.Model(&models.User{}).Where("id = ?", id).Update("password_hash", passwordHash).Error
}

// UpdateUserAvatar mengupdate avatar path user.
func UpdateUserAvatar(id uuid.UUID, avatarPath *string) error {
	return database.DB.Model(&models.User{}).Where("id = ?", id).Update("avatar_path", avatarPath).Error
}
