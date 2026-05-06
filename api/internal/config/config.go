package config

import (
	"os"
	"strconv"
)

type Config struct {
	// Database
	PostgresHost     string
	PostgresPort     int
	PostgresUser     string
	PostgresPassword string
	PostgresDB       string

	// MinIO
	MinIOEndpoint  string
	MinIOAccessKey string
	MinIOSecretKey string
	MinIOBucket    string
	MinIOUseSSL    bool

	// JWT
	JWTSecret        string
	JWTAccessExpiry  string
	JWTRefreshExpiry string

	// API
	APIPort string
	APIHost string
}

func Load() *Config {
	return &Config{
		// Database
		PostgresHost:     getEnv("POSTGRES_HOST", "localhost"),
		PostgresPort:     getEnvInt("POSTGRES_PORT", 5432),
		PostgresUser:     getEnv("POSTGRES_USER", "novyl"),
		PostgresPassword: getEnv("POSTGRES_PASSWORD", ""),
		PostgresDB:       getEnv("POSTGRES_DB", "novyl"),

		// MinIO
		MinIOEndpoint:  getEnv("MINIO_ENDPOINT", "localhost:9000"),
		MinIOAccessKey: getEnv("MINIO_ACCESS_KEY", "minioadmin"),
		MinIOSecretKey: getEnv("MINIO_SECRET_KEY", "minioadmin"),
		MinIOBucket:    getEnv("MINIO_BUCKET", "novyl"),
		MinIOUseSSL:    getEnvBool("MINIO_USE_SSL", false),

		// JWT
		JWTSecret:        getEnv("JWT_SECRET", "changeme"),
		JWTAccessExpiry:  getEnv("JWT_ACCESS_EXPIRY", "15m"),
		JWTRefreshExpiry: getEnv("JWT_REFRESH_EXPIRY", "7d"),

		// API
		APIPort: getEnv("API_PORT", "8080"),
		APIHost: getEnv("API_HOST", "0.0.0.0"),
	}
}

func (c *Config) DatabaseDSN() string {
	return "host=" + c.PostgresHost +
		" port=" + strconv.Itoa(c.PostgresPort) +
		" user=" + c.PostgresUser +
		" password=" + c.PostgresPassword +
		" dbname=" + c.PostgresDB +
		" sslmode=disable TimeZone=Asia/Jakarta"
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if val := os.Getenv(key); val != "" {
		if n, err := strconv.Atoi(val); err == nil {
			return n
		}
	}
	return fallback
}

func getEnvBool(key string, fallback bool) bool {
	if val := os.Getenv(key); val != "" {
		if b, err := strconv.ParseBool(val); err == nil {
			return b
		}
	}
	return fallback
}
