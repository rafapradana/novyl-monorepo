package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/novyl/novyl/internal/middleware"
	"github.com/novyl/novyl/internal/services"
	"github.com/novyl/novyl/internal/utils"
)

type CharacterHandler struct{}

func NewCharacterHandler() *CharacterHandler {
	return &CharacterHandler{}
}

// GET /v1/novels/:novelId/characters
func (h *CharacterHandler) List(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	novelID, err := uuid.Parse(c.Params("novelId"))
	if err != nil {
		return utils.BadRequest(c, "ID novel tidak valid")
	}

	characters, err := services.GetCharactersByNovel(novelID, userID)
	if err != nil {
		return utils.NotFound(c, "Novel tidak ditemukan")
	}

	return utils.Success(c, fiber.StatusOK, characters)
}

// POST /v1/novels/:novelId/characters
func (h *CharacterHandler) Create(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	novelID, err := uuid.Parse(c.Params("novelId"))
	if err != nil {
		return utils.BadRequest(c, "ID novel tidak valid")
	}

	var input services.CreateCharacterInput
	if err := c.BodyParser(&input); err != nil {
		return utils.BadRequest(c, "Invalid request body")
	}

	if errs := utils.ValidateStruct(input); errs != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"errors":  errs,
		})
	}

	character, err := services.CreateCharacter(novelID, userID, input)
	if err != nil {
		return utils.InternalServerError(c, "Gagal membuat karakter")
	}

	return utils.SuccessWithMessage(c, fiber.StatusCreated, "Karakter berhasil dibuat", character)
}

// PUT /v1/characters/:id
func (h *CharacterHandler) Update(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	charID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequest(c, "ID karakter tidak valid")
	}

	var input services.UpdateCharacterInput
	if err := c.BodyParser(&input); err != nil {
		return utils.BadRequest(c, "Invalid request body")
	}

	character, err := services.UpdateCharacter(charID, userID, input)
	if err != nil {
		if err == services.ErrCharacterNotFound {
			return utils.NotFound(c, err.Error())
		}
		return utils.InternalServerError(c, "Gagal mengupdate karakter")
	}

	return utils.SuccessWithMessage(c, fiber.StatusOK, "Karakter berhasil diupdate", character)
}

// DELETE /v1/characters/:id
func (h *CharacterHandler) Delete(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	charID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequest(c, "ID karakter tidak valid")
	}

	if err := services.DeleteCharacter(charID, userID); err != nil {
		if err == services.ErrCharacterNotFound {
			return utils.NotFound(c, err.Error())
		}
		return utils.InternalServerError(c, "Gagal menghapus karakter")
	}

	return utils.SuccessWithMessage(c, fiber.StatusOK, "Karakter berhasil dihapus", nil)
}
