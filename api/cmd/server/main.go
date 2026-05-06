package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
	"github.com/novyl/novyl/internal/config"
)
	
func main() {
	// Load .env from root
	if err := godotenv.Load("../.env"); err != nil {
		log.Println("Warning: .env file not found, using system env")
	}

	cfg := config.Load()

	app := fiber.New(fiber.Config{
		AppName:      "Novyl API",
		ServerHeader: "Novyl",
	})

	// Middleware
	app.Use(logger.New())
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:3000,http://localhost:3001",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, PATCH, DELETE, OPTIONS",
		AllowCredentials: true,
	}))

	// Routes
	v1 := app.Group("/v1")

	v1.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
		})
	})

	addr := cfg.APIHost + ":" + cfg.APIPort
	log.Printf("Novyl API running on %s", addr)
	log.Fatal(app.Listen(addr))
}
