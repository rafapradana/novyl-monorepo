package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/novyl/novyl/internal/middleware"
	"github.com/novyl/novyl/internal/services"
	"github.com/novyl/novyl/internal/utils"
)

type SettingHandler struct{}

func NewSettingHandler() *SettingHandler {
	return &SettingHandler{}
}

// GET /v1/novels/:novelId/settings
func (h *SettingHandler) List(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	novelID, err := uuid.Parse(c.Params("novelId"))
	if err != nil {
		return utils.BadRequest(c, "ID novel tidak valid")
	}

	settings, err := services.GetSettingsByNovel(novelID, userID)
	if err != nil {
		return utils.NotFound(c, "Novel tidak ditemukan")
	}

	return utils.Success(c, fiber.StatusOK, settings)
}

// POST /v1/novels/:novelId/settings
func (h *SettingHandler) Create(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	novelID, err := uuid.Parse(c.Params("novelId"))
	if err != nil {
		return utils.BadRequest(c, "ID novel tidak valid")
	}

	var input services.CreateSettingInput
	if err := c.BodyParser(&input); err != nil {
		return utils.BadRequest(c, "Invalid request body")
	}

	if errs := utils.ValidateStruct(input); errs != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"errors":  errs,
		})
	}

	setting, err := services.CreateSetting(novelID, userID, input)
	if err != nil {
		return utils.InternalServerError(c, "Gagal membuat latar")
	}

	return utils.SuccessWithMessage(c, fiber.StatusCreated, "Latar berhasil dibuat", setting)
}

// PUT /v1/settings/:id
func (h *SettingHandler) Update(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	settingID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequest(c, "ID latar tidak valid")
	}

	var input services.UpdateSettingInput
	if err := c.BodyParser(&input); err != nil {
		return utils.BadRequest(c, "Invalid request body")
	}

	setting, err := services.UpdateSetting(settingID, userID, input)
	if err != nil {
		if err == services.ErrSettingNotFound {
			return utils.NotFound(c, err.Error())
		}
		return utils.InternalServerError(c, "Gagal mengupdate latar")
	}

	return utils.SuccessWithMessage(c, fiber.StatusOK, "Latar berhasil diupdate", setting)
}

// DELETE /v1/settings/:id
func (h *SettingHandler) Delete(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	settingID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequest(c, "ID latar tidak valid")
	}

	if err := services.DeleteSetting(settingID, userID); err != nil {
		if err == services.ErrSettingNotFound {
			return utils.NotFound(c, err.Error())
		}
		return utils.InternalServerError(c, "Gagal menghapus latar")
	}

	return utils.SuccessWithMessage(c, fiber.StatusOK, "Latar berhasil dihapus", nil)
}
