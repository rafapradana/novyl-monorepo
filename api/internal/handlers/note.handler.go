package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/novyl/novyl/internal/middleware"
	"github.com/novyl/novyl/internal/services"
	"github.com/novyl/novyl/internal/utils"
)

type NoteHandler struct{}

func NewNoteHandler() *NoteHandler {
	return &NoteHandler{}
}

// GET /v1/chapters/:chapterId/notes
func (h *NoteHandler) Get(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	chapterID, err := uuid.Parse(c.Params("chapterId"))
	if err != nil {
		return utils.BadRequest(c, "ID chapter tidak valid")
	}

	note, err := services.GetNote(chapterID, userID)
	if err != nil {
		return utils.NotFound(c, "Chapter tidak ditemukan")
	}

	return utils.Success(c, fiber.StatusOK, note)
}

// PUT /v1/chapters/:chapterId/notes
func (h *NoteHandler) Upsert(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	chapterID, err := uuid.Parse(c.Params("chapterId"))
	if err != nil {
		return utils.BadRequest(c, "ID chapter tidak valid")
	}

	var input services.UpdateNoteInput
	if err := c.BodyParser(&input); err != nil {
		return utils.BadRequest(c, "Invalid request body")
	}

	note, err := services.UpsertNote(chapterID, userID, input)
	if err != nil {
		return utils.InternalServerError(c, "Gagal menyimpan catatan")
	}

	return utils.Success(c, fiber.StatusOK, note)
}

// DELETE /v1/chapters/:chapterId/notes
func (h *NoteHandler) Delete(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	chapterID, err := uuid.Parse(c.Params("chapterId"))
	if err != nil {
		return utils.BadRequest(c, "ID chapter tidak valid")
	}

	if err := services.DeleteNote(chapterID, userID); err != nil {
		return utils.InternalServerError(c, "Gagal menghapus catatan")
	}

	return utils.SuccessWithMessage(c, fiber.StatusOK, "Catatan berhasil dihapus", nil)
}
