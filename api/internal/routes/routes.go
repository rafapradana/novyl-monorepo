package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/novyl/novyl/internal/config"
	"github.com/novyl/novyl/internal/handlers"
	"github.com/novyl/novyl/internal/middleware"
)

func Setup(app *fiber.App, cfg *config.Config) {
	v1 := app.Group("/v1")

	// Health check
	v1.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// Auth routes
	auth := handlers.NewAuthHandler(cfg)
	authGroup := v1.Group("/auth")

	// Public auth routes
	authGroup.Post("/register", auth.Register)
	authGroup.Post("/login", auth.Login)
	authGroup.Post("/refresh", auth.RefreshToken)

	// Protected auth routes
	authProtected := authGroup.Group("", middleware.Protected(cfg.JWTSecret))
	authProtected.Get("/me", auth.Me)
	authProtected.Put("/profile", auth.UpdateProfile)
	authProtected.Put("/password", auth.ChangePassword)
	authProtected.Post("/logout", auth.Logout)

	// Protected routes (semua butuh JWT)
	protected := v1.Group("", middleware.Protected(cfg.JWTSecret))

	// Novel routes
	novel := handlers.NewNovelHandler()
	protected.Get("/novels", novel.List)
	protected.Post("/novels", novel.Create)
	protected.Get("/novels/:id", novel.Get)
	protected.Put("/novels/:id", novel.Update)
	protected.Delete("/novels/:id", novel.Delete)

	// Chapter routes
	chapter := handlers.NewChapterHandler()
	protected.Get("/novels/:novelId/chapters", chapter.List)
	protected.Post("/novels/:novelId/chapters", chapter.Create)
	protected.Put("/chapters/:id", chapter.Update)
	protected.Patch("/chapters/:id/content", chapter.UpdateContent)
	protected.Patch("/chapters/:id/status", chapter.UpdateStatus)
	protected.Delete("/chapters/:id", chapter.Delete)
	protected.Patch("/novels/:novelId/chapters/reorder", chapter.Reorder)

	// Character routes
	character := handlers.NewCharacterHandler()
	protected.Get("/novels/:novelId/characters", character.List)
	protected.Post("/novels/:novelId/characters", character.Create)
	protected.Put("/characters/:id", character.Update)
	protected.Delete("/characters/:id", character.Delete)

	// Setting routes
	setting := handlers.NewSettingHandler()
	protected.Get("/novels/:novelId/settings", setting.List)
	protected.Post("/novels/:novelId/settings", setting.Create)
	protected.Put("/settings/:id", setting.Update)
	protected.Delete("/settings/:id", setting.Delete)

	// Chapter note routes
	note := handlers.NewNoteHandler()
	protected.Get("/chapters/:chapterId/notes", note.Get)
	protected.Put("/chapters/:chapterId/notes", note.Upsert)
	protected.Delete("/chapters/:chapterId/notes", note.Delete)

	// Upload routes
	upload := handlers.NewUploadHandler(cfg)
	protected.Post("/upload/presign", upload.PresignUpload)
	protected.Post("/upload/confirm", upload.ConfirmUpload)
	protected.Get("/upload/url/*", upload.GetDownloadURL)
	protected.Delete("/upload/*", upload.DeleteFile)

	// Export routes
	export := handlers.NewExportHandler(cfg)
	protected.Post("/novels/:id/export", export.Export)
}
