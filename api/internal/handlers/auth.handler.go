package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/novyl/novyl/internal/config"
	"github.com/novyl/novyl/internal/middleware"
	"github.com/novyl/novyl/internal/services"
	"github.com/novyl/novyl/internal/utils"
)

type AuthHandler struct {
	cfg *config.Config
}

func NewAuthHandler(cfg *config.Config) *AuthHandler {
	return &AuthHandler{cfg: cfg}
}

// POST /v1/auth/register
func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var input services.RegisterInput
	if err := c.BodyParser(&input); err != nil {
		return utils.BadRequest(c, "Invalid request body")
	}

	// Validasi
	if errs := utils.ValidateStruct(input); errs != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"errors":  errs,
		})
	}

	result, err := services.Register(input, h.cfg)
	if err != nil {
		if err == services.ErrEmailAlreadyExists {
			return utils.Conflict(c, err.Error())
		}
		return utils.InternalServerError(c, "Gagal membuat akun")
	}

	return utils.SuccessWithMessage(c, fiber.StatusCreated, "Akun berhasil dibuat", result)
}

// POST /v1/auth/login
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var input services.LoginInput
	if err := c.BodyParser(&input); err != nil {
		return utils.BadRequest(c, "Invalid request body")
	}

	if errs := utils.ValidateStruct(input); errs != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"errors":  errs,
		})
	}

	result, err := services.Login(input, h.cfg)
	if err != nil {
		if err == services.ErrInvalidCredentials {
			return utils.Unauthorized(c, err.Error())
		}
		return utils.InternalServerError(c, "Gagal login")
	}

	return utils.SuccessWithMessage(c, fiber.StatusOK, "Login berhasil", result)
}

// GET /v1/auth/me (protected)
func (h *AuthHandler) Me(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	user, err := services.GetProfile(userID)
	if err != nil {
		return utils.NotFound(c, "User tidak ditemukan")
	}

	return utils.Success(c, fiber.StatusOK, user)
}

// PUT /v1/auth/profile (protected)
func (h *AuthHandler) UpdateProfile(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	var input services.UpdateProfileInput
	if err := c.BodyParser(&input); err != nil {
		return utils.BadRequest(c, "Invalid request body")
	}

	if errs := utils.ValidateStruct(input); errs != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"errors":  errs,
		})
	}

	user, err := services.UpdateProfile(userID, input)
	if err != nil {
		return utils.InternalServerError(c, "Gagal update profil")
	}

	return utils.SuccessWithMessage(c, fiber.StatusOK, "Profil berhasil diperbarui", user)
}

// PUT /v1/auth/password (protected)
func (h *AuthHandler) ChangePassword(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	var input services.ChangePasswordInput
	if err := c.BodyParser(&input); err != nil {
		return utils.BadRequest(c, "Invalid request body")
	}

	if errs := utils.ValidateStruct(input); errs != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"errors":  errs,
		})
	}

	err := services.ChangePassword(userID, input)
	if err != nil {
		if err == services.ErrInvalidPassword {
			return utils.BadRequest(c, err.Error())
		}
		return utils.InternalServerError(c, "Gagal mengganti password")
	}

	return utils.SuccessWithMessage(c, fiber.StatusOK, "Password berhasil diubah", nil)
}

// POST /v1/auth/refresh
func (h *AuthHandler) RefreshToken(c *fiber.Ctx) error {
	var body struct {
		RefreshToken string `json:"refresh_token" validate:"required"`
	}
	if err := c.BodyParser(&body); err != nil {
		return utils.BadRequest(c, "Invalid request body")
	}

	if body.RefreshToken == "" {
		return utils.BadRequest(c, "Refresh token required")
	}

	accessToken, err := services.RefreshAccessToken(body.RefreshToken, h.cfg)
	if err != nil {
		return utils.Unauthorized(c, "Refresh token tidak valid")
	}

	return utils.Success(c, fiber.StatusOK, fiber.Map{
		"access_token": accessToken,
	})
}

// POST /v1/auth/logout (protected)
func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	var body struct {
		RefreshToken string `json:"refresh_token" validate:"required"`
	}
	if err := c.BodyParser(&body); err != nil {
		return utils.BadRequest(c, "Invalid request body")
	}

	if body.RefreshToken == "" {
		return utils.BadRequest(c, "Refresh token required")
	}

	if err := services.Logout(body.RefreshToken); err != nil {
		return utils.InternalServerError(c, "Gagal logout")
	}

	return utils.SuccessWithMessage(c, fiber.StatusOK, "Logout berhasil", nil)
}
