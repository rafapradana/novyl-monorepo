package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
	"github.com/novyl/novyl/internal/config"
	"github.com/novyl/novyl/internal/database"
	"github.com/novyl/novyl/internal/middleware"
	"github.com/novyl/novyl/internal/routes"
)

func main() {
	// Load .env from root
	if err := godotenv.Load("../.env"); err != nil {
		log.Println("Warning: .env file not found, using system env")
	}

	cfg := config.Load()

	// Connect to database and run migrations
	database.Connect(cfg)
	database.Migrate()

	app := fiber.New(fiber.Config{
		AppName:      "Novyl API",
		ServerHeader: "Novyl",
	})

	// Middleware
	app.Use(middleware.RequestLogger())
	app.Use(recover.New())
	app.Use(middleware.CORS())

	// Setup all routes
	routes.Setup(app, cfg)

	addr := cfg.APIHost + ":" + cfg.APIPort
	log.Printf("Novyl API running on %s", addr)
	log.Fatal(app.Listen(addr))
}
