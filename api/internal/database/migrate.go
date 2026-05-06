package database

import (
	"log"

	"github.com/novyl/novyl/internal/models"
)

// Migrate runs auto-migration for all models.
// Skips if tables already exist (created by db.sql).
// GORM will only add missing columns/indexes, not modify existing ones.
func Migrate() {
	// Check if tables already exist (created by db.sql init)
	var exists bool
	DB.Raw("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')").Scan(&exists)

	if exists {
		log.Println("Database schema already exists, skipping GORM migration")
		return
	}

	err := DB.AutoMigrate(
		&models.User{},
		&models.PasswordReset{},
		&models.RefreshToken{},
		&models.Novel{},
		&models.Chapter{},
		&models.Character{},
		&models.Setting{},
		&models.ChapterNote{},
		&models.FileAsset{},
		&models.NovelExport{},
		&models.Genre{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	log.Println("Database migration completed")
}
