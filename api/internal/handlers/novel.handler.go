package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/novyl/novyl/internal/middleware"
	"github.com/novyl/novyl/internal/services"
	"github.com/novyl/novyl/internal/utils"
)

type NovelHandler struct{}

func NewNovelHandler() *NovelHandler {
	return &NovelHandler{}
}

// GET /v1/novels
func (h *NovelHandler) List(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	novels, err := services.GetUserNovels(userID)
	if err != nil {
		return utils.InternalServerError(c, "Gagal mengambil daftar novel")
	}

	return utils.Success(c, fiber.StatusOK, novels)
}

// POST /v1/novels
func (h *NovelHandler) Create(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	var input services.CreateNovelInput
	if err := c.BodyParser(&input); err != nil {
		return utils.BadRequest(c, "Invalid request body")
	}

	if errs := utils.ValidateStruct(input); errs != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"errors":  errs,
		})
	}

	novel, err := services.CreateNovel(userID, input)
	if err != nil {
		return utils.InternalServerError(c, "Gagal membuat novel")
	}

	return utils.SuccessWithMessage(c, fiber.StatusCreated, "Novel berhasil dibuat", novel)
}

// GET /v1/novels/:id
func (h *NovelHandler) Get(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	novelID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequest(c, "ID novel tidak valid")
	}

	novel, err := services.GetNovel(novelID, userID)
	if err != nil {
		if err == services.ErrNovelNotFound {
			return utils.NotFound(c, err.Error())
		}
		if err == services.ErrNotOwner {
			return utils.Forbidden(c, err.Error())
		}
		return utils.InternalServerError(c, "Gagal mengambil novel")
	}

	return utils.Success(c, fiber.StatusOK, novel)
}

// PUT /v1/novels/:id
func (h *NovelHandler) Update(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	novelID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequest(c, "ID novel tidak valid")
	}

	var input services.UpdateNovelInput
	if err := c.BodyParser(&input); err != nil {
		return utils.BadRequest(c, "Invalid request body")
	}

	novel, err := services.UpdateNovel(novelID, userID, input)
	if err != nil {
		if err == services.ErrNovelNotFound {
			return utils.NotFound(c, err.Error())
		}
		if err == services.ErrNotOwner {
			return utils.Forbidden(c, err.Error())
		}
		return utils.InternalServerError(c, "Gagal mengupdate novel")
	}

	return utils.SuccessWithMessage(c, fiber.StatusOK, "Novel berhasil diupdate", novel)
}

// DELETE /v1/novels/:id
func (h *NovelHandler) Delete(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	novelID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequest(c, "ID novel tidak valid")
	}

	if err := services.DeleteNovel(novelID, userID); err != nil {
		if err == services.ErrNovelNotFound {
			return utils.NotFound(c, err.Error())
		}
		if err == services.ErrNotOwner {
			return utils.Forbidden(c, err.Error())
		}
		return utils.InternalServerError(c, "Gagal menghapus novel")
	}

	return utils.SuccessWithMessage(c, fiber.StatusOK, "Novel berhasil dihapus", nil)
}
