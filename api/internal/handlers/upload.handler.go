package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/novyl/novyl/internal/config"
	"github.com/novyl/novyl/internal/middleware"
	"github.com/novyl/novyl/internal/services"
	"github.com/novyl/novyl/internal/utils"
)

type UploadHandler struct {
	cfg *config.Config
}

func NewUploadHandler(cfg *config.Config) *UploadHandler {
	return &UploadHandler{cfg: cfg}
}

// POST /v1/upload/presign
func (h *UploadHandler) PresignUpload(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	var input services.PresignUploadInput
	if err := c.BodyParser(&input); err != nil {
		return utils.BadRequest(c, "Invalid request body")
	}

	if errs := utils.ValidateStruct(input); errs != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"errors":  errs,
		})
	}

	result, err := services.GeneratePresignedUploadURL(userID, input, h.cfg)
	if err != nil {
		return utils.InternalServerError(c, "Gagal membuat upload URL")
	}

	return utils.Success(c, fiber.StatusOK, result)
}

// POST /v1/upload/confirm
// Frontend calls this after successful upload to MinIO to save the record.
func (h *UploadHandler) ConfirmUpload(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	var body struct {
		services.PresignUploadInput
		ObjectKey string `json:"object_key" validate:"required"`
		FileSize  int64  `json:"file_size"`
	}
	if err := c.BodyParser(&body); err != nil {
		return utils.BadRequest(c, "Invalid request body")
	}

	asset, err := services.SaveFileAsset(userID, body.PresignUploadInput, body.ObjectKey, body.FileSize, h.cfg)
	if err != nil {
		return utils.InternalServerError(c, "Gagal menyimpan record file")
	}

	return utils.SuccessWithMessage(c, fiber.StatusCreated, "File berhasil diupload", asset)
}

// GET /v1/upload/url/*
// Generate presigned download URL for a file.
func (h *UploadHandler) GetDownloadURL(c *fiber.Ctx) error {
	objectKey := c.Params("*")
	if objectKey == "" {
		return utils.BadRequest(c, "Object key required")
	}

	result, err := services.GetPresignedDownloadURL(objectKey, h.cfg)
	if err != nil {
		return utils.InternalServerError(c, "Gagal membuat download URL")
	}

	return utils.Success(c, fiber.StatusOK, result)
}

// DELETE /v1/upload/*
func (h *UploadHandler) DeleteFile(c *fiber.Ctx) error {
	objectKey := c.Params("*")
	if objectKey == "" {
		return utils.BadRequest(c, "Object key required")
	}

	if err := services.DeleteFile(objectKey, h.cfg); err != nil {
		return utils.InternalServerError(c, "Gagal menghapus file")
	}

	return utils.SuccessWithMessage(c, fiber.StatusOK, "File berhasil dihapus", nil)
}
