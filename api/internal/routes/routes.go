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

	// Public routes (tanpa auth)
	authGroup.Post("/register", auth.Register)
	authGroup.Post("/login", auth.Login)
	authGroup.Post("/refresh", auth.RefreshToken)

	// Protected routes (butuh JWT)
	protected := authGroup.Group("", middleware.Protected(cfg.JWTSecret))
	protected.Get("/me", auth.Me)
	protected.Put("/profile", auth.UpdateProfile)
	protected.Put("/password", auth.ChangePassword)
	protected.Post("/logout", auth.Logout)
}
