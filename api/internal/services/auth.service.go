package services

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/novyl/novyl/internal/config"
	"github.com/novyl/novyl/internal/models"
	"github.com/novyl/novyl/internal/repositories"
	"github.com/novyl/novyl/internal/utils"
)

var (
	ErrEmailAlreadyExists = errors.New("email sudah terdaftar")
	ErrInvalidCredentials = errors.New("email atau password salah")
	ErrUserNotFound       = errors.New("user tidak ditemukan")
	ErrInvalidPassword    = errors.New("password lama salah")
	ErrTokenNotFound      = errors.New("refresh token tidak valid")
)

// RegisterInput adalah input untuk registrasi.
type RegisterInput struct {
	Name     string `json:"name" validate:"required,min=2,max=100"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

// LoginInput adalah input untuk login.
type LoginInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// ChangePasswordInput adalah input untuk ganti password.
type ChangePasswordInput struct {
	OldPassword string `json:"old_password" validate:"required"`
	NewPassword string `json:"new_password" validate:"required,min=6"`
}

// UpdateProfileInput adalah input untuk update profil.
type UpdateProfileInput struct {
	Name       string  `json:"name" validate:"required,min=2,max=100"`
	AvatarPath *string `json:"avatar_path"`
}

// AuthResponse adalah response setelah login/register.
type AuthResponse struct {
	User         models.User `json:"user"`
	AccessToken  string      `json:"access_token"`
	RefreshToken string      `json:"refresh_token"`
}

// Register membuat user baru dan mengembalikan token.
func Register(input RegisterInput, cfg *config.Config) (*AuthResponse, error) {
	// Cek email duplikat
	existing, _ := repositories.FindUserByEmail(input.Email)
	if existing != nil {
		return nil, ErrEmailAlreadyExists
	}

	// Hash password
	hash, err := utils.HashPassword(input.Password)
	if err != nil {
		return nil, err
	}

	// Buat user
	user := &models.User{
		ID:           uuid.New(),
		Name:         input.Name,
		Email:        input.Email,
		PasswordHash: hash,
	}

	if err := repositories.CreateUser(user); err != nil {
		return nil, err
	}

	// Generate tokens
	accessExpiry := utils.ParseTokenExpiry(cfg.JWTAccessExpiry, 15*time.Minute)
	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, cfg.JWTSecret, accessExpiry)
	if err != nil {
		return nil, err
	}

	refreshToken, err := createRefreshToken(user.ID, cfg)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		User:         *user,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

// Login memverifikasi credentials dan mengembalikan token.
func Login(input LoginInput, cfg *config.Config) (*AuthResponse, error) {
	user, err := repositories.FindUserByEmail(input.Email)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	if !utils.CheckPassword(input.Password, user.PasswordHash) {
		return nil, ErrInvalidCredentials
	}

	// Generate tokens
	accessExpiry := utils.ParseTokenExpiry(cfg.JWTAccessExpiry, 15*time.Minute)
	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, cfg.JWTSecret, accessExpiry)
	if err != nil {
		return nil, err
	}

	refreshToken, err := createRefreshToken(user.ID, cfg)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		User:         *user,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

// GetProfile mengambil data user berdasarkan ID.
func GetProfile(userID uuid.UUID) (*models.User, error) {
	user, err := repositories.FindUserByID(userID)
	if err != nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}

// UpdateProfile mengupdate nama dan avatar user.
func UpdateProfile(userID uuid.UUID, input UpdateProfileInput) (*models.User, error) {
	if err := repositories.UpdateUserProfile(userID, input.Name, input.AvatarPath); err != nil {
		return nil, err
	}
	return repositories.FindUserByID(userID)
}

// ChangePassword mengganti password user.
func ChangePassword(userID uuid.UUID, input ChangePasswordInput) error {
	user, err := repositories.FindUserByID(userID)
	if err != nil {
		return ErrUserNotFound
	}

	if !utils.CheckPassword(input.OldPassword, user.PasswordHash) {
		return ErrInvalidPassword
	}

	hash, err := utils.HashPassword(input.NewPassword)
	if err != nil {
		return err
	}

	// Update password dan revoke semua refresh token (force re-login)
	if err := repositories.UpdateUserPassword(userID, hash); err != nil {
		return err
	}

	return repositories.RevokeAllUserTokens(userID)
}

// RefreshAccessToken membuat access token baru dari refresh token.
func RefreshAccessToken(refreshTokenString string, cfg *config.Config) (string, error) {
	token, err := repositories.FindRefreshToken(refreshTokenString)
	if err != nil {
		return "", ErrTokenNotFound
	}

	user, err := repositories.FindUserByID(token.UserID)
	if err != nil {
		return "", ErrUserNotFound
	}

	accessExpiry := utils.ParseTokenExpiry(cfg.JWTAccessExpiry, 15*time.Minute)
	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, cfg.JWTSecret, accessExpiry)
	if err != nil {
		return "", err
	}

	return accessToken, nil
}

// Logout me-revoke refresh token user.
func Logout(refreshTokenString string) error {
	return repositories.RevokeRefreshToken(refreshTokenString)
}

// createRefreshToken helper untuk membuat dan menyimpan refresh token.
func createRefreshToken(userID uuid.UUID, cfg *config.Config) (string, error) {
	refreshExpiry := utils.ParseTokenExpiry(cfg.JWTRefreshExpiry, 7*24*time.Hour)
	tokenString := utils.GenerateRefreshToken()

	token := &models.RefreshToken{
		ID:        uuid.New(),
		UserID:    userID,
		Token:     tokenString,
		ExpiresAt: time.Now().Add(refreshExpiry),
	}

	if err := repositories.CreateRefreshToken(token); err != nil {
		return "", err
	}

	return tokenString, nil
}
