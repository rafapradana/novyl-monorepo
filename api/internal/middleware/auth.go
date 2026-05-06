package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/novyl/novyl/internal/utils"
)

// Protected adalah middleware untuk melindungi route dengan JWT.
// Mengekstrak token dari Authorization header, verifikasi, dan inject user_id ke context.
func Protected(secret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return utils.Unauthorized(c, "Authorization header required")
		}

		// Format: "Bearer <token>"
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			return utils.Unauthorized(c, "Invalid authorization format, use: Bearer <token>")
		}

		claims, err := utils.VerifyToken(parts[1], secret)
		if err != nil {
			if err == utils.ErrTokenExpired {
				return utils.Unauthorized(c, "Token expired")
			}
			return utils.Unauthorized(c, "Invalid token")
		}

		// Inject user data ke context untuk handler
		c.Locals("user_id", claims.UserID)
		c.Locals("email", claims.Email)

		return c.Next()
	}
}

// GetUserID mengambil user_id dari context (di-set oleh Protected middleware).
func GetUserID(c *fiber.Ctx) uuid.UUID {
	id, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return uuid.Nil
	}
	return id
}

// GetEmail mengambil email dari context (di-set oleh Protected middleware).
func GetEmail(c *fiber.Ctx) string {
	email, ok := c.Locals("email").(string)
	if !ok {
		return ""
	}
	return email
}
