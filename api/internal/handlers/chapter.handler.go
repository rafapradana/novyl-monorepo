package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/novyl/novyl/internal/middleware"
	"github.com/novyl/novyl/internal/services"
	"github.com/novyl/novyl/internal/utils"
)

type ChapterHandler struct{}

func NewChapterHandler() *ChapterHandler {
	return &ChapterHandler{}
}

// GET /v1/novels/:novelId/chapters
func (h *ChapterHandler) List(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	novelID, err := uuid.Parse(c.Params("novelId"))
	if err != nil {
		return utils.BadRequest(c, "ID novel tidak valid")
	}

	chapters, err := services.GetChaptersByNovel(novelID, userID)
	if err != nil {
		if err == services.ErrNovelNotFound || err == services.ErrNotOwner {
			return utils.NotFound(c, "Novel tidak ditemukan")
		}
		return utils.InternalServerError(c, "Gagal mengambil chapters")
	}

	return utils.Success(c, fiber.StatusOK, chapters)
}

// POST /v1/novels/:novelId/chapters
func (h *ChapterHandler) Create(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	novelID, err := uuid.Parse(c.Params("novelId"))
	if err != nil {
		return utils.BadRequest(c, "ID novel tidak valid")
	}

	var input services.CreateChapterInput
	if err := c.BodyParser(&input); err != nil {
		return utils.BadRequest(c, "Invalid request body")
	}

	if errs := utils.ValidateStruct(input); errs != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"errors":  errs,
		})
	}

	// Verify novel ownership
	if _, err := services.GetNovel(novelID, userID); err != nil {
		return utils.NotFound(c, "Novel tidak ditemukan")
	}

	chapter, err := services.CreateChapter(novelID, input)
	if err != nil {
		return utils.InternalServerError(c, "Gagal membuat chapter")
	}

	return utils.SuccessWithMessage(c, fiber.StatusCreated, "Chapter berhasil dibuat", chapter)
}

// PUT /v1/chapters/:id
func (h *ChapterHandler) Update(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	chapterID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequest(c, "ID chapter tidak valid")
	}

	var input services.UpdateChapterInput
	if err := c.BodyParser(&input); err != nil {
		return utils.BadRequest(c, "Invalid request body")
	}

	chapter, err := services.UpdateChapter(chapterID, userID, input)
	if err != nil {
		if err == services.ErrChapterNotFound {
			return utils.NotFound(c, err.Error())
		}
		if err == services.ErrNotOwner {
			return utils.Forbidden(c, err.Error())
		}
		return utils.InternalServerError(c, "Gagal mengupdate chapter")
	}

	return utils.SuccessWithMessage(c, fiber.StatusOK, "Chapter berhasil diupdate", chapter)
}

// PATCH /v1/chapters/:id/content
func (h *ChapterHandler) UpdateContent(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	chapterID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequest(c, "ID chapter tidak valid")
	}

	var input services.UpdateChapterContentInput
	if err := c.BodyParser(&input); err != nil {
		return utils.BadRequest(c, "Invalid request body")
	}

	if errs := utils.ValidateStruct(input); errs != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"errors":  errs,
		})
	}

	chapter, err := services.UpdateChapterContent(chapterID, userID, input)
	if err != nil {
		if err == services.ErrChapterNotFound {
			return utils.NotFound(c, err.Error())
		}
		return utils.InternalServerError(c, "Gagal mengupdate content")
	}

	return utils.Success(c, fiber.StatusOK, chapter)
}

// PATCH /v1/chapters/:id/status
func (h *ChapterHandler) UpdateStatus(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	chapterID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequest(c, "ID chapter tidak valid")
	}

	var input services.UpdateChapterStatusInput
	if err := c.BodyParser(&input); err != nil {
		return utils.BadRequest(c, "Invalid request body")
	}

	chapter, err := services.UpdateChapterStatus(chapterID, userID, input.Status)
	if err != nil {
		if err == services.ErrChapterNotFound {
			return utils.NotFound(c, err.Error())
		}
		return utils.InternalServerError(c, "Gagal mengupdate status")
	}

	return utils.Success(c, fiber.StatusOK, chapter)
}

// DELETE /v1/chapters/:id
func (h *ChapterHandler) Delete(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	chapterID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequest(c, "ID chapter tidak valid")
	}

	if err := services.DeleteChapter(chapterID, userID); err != nil {
		if err == services.ErrChapterNotFound {
			return utils.NotFound(c, err.Error())
		}
		return utils.InternalServerError(c, "Gagal menghapus chapter")
	}

	return utils.SuccessWithMessage(c, fiber.StatusOK, "Chapter berhasil dihapus", nil)
}

// PATCH /v1/novels/:novelId/chapters/reorder
func (h *ChapterHandler) Reorder(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	novelID, err := uuid.Parse(c.Params("novelId"))
	if err != nil {
		return utils.BadRequest(c, "ID novel tidak valid")
	}

	var input services.ReorderChaptersInput
	if err := c.BodyParser(&input); err != nil {
		return utils.BadRequest(c, "Invalid request body")
	}

	if err := services.ReorderChapters(novelID, userID, input); err != nil {
		if err == services.ErrNotOwner {
			return utils.Forbidden(c, err.Error())
		}
		return utils.InternalServerError(c, "Gagal mengurutkan chapter")
	}

	return utils.SuccessWithMessage(c, fiber.StatusOK, "Chapter berhasil diurutkan", nil)
}
