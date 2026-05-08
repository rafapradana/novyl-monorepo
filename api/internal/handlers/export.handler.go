package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/novyl/novyl/internal/config"
	"github.com/novyl/novyl/internal/middleware"
	"github.com/novyl/novyl/internal/services"
	"github.com/novyl/novyl/internal/utils"
)

type ExportHandler struct {
	cfg *config.Config
}

func NewExportHandler(cfg *config.Config) *ExportHandler {
	return &ExportHandler{cfg: cfg}
}

// POST /v1/novels/:id/export
func (h *ExportHandler) Export(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	novelID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return utils.BadRequest(c, "ID novel tidak valid")
	}

	var input services.ExportInput
	if err := c.BodyParser(&input); err != nil {
		return utils.BadRequest(c, "Invalid request body")
	}

	if errs := utils.ValidateStruct(input); errs != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"errors":  errs,
		})
	}

	result, err := services.ExportNovel(novelID, userID, input, h.cfg)
	if err != nil {
		if err == services.ErrNovelNotFound {
			return utils.NotFound(c, err.Error())
		}
		if err == services.ErrNotOwner {
			return utils.Forbidden(c, err.Error())
		}
		return utils.InternalServerError(c, "Gagal export novel")
	}

	return utils.SuccessWithMessage(c, fiber.StatusOK, "Novel berhasil di-export", result)
}
