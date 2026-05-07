package utils

import (
	"context"
	"fmt"
	"log"
	"net/url"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/novyl/novyl/internal/config"
)

var MinioClient *minio.Client

// InitMinIO initializes the MinIO client and ensures the bucket exists.
func InitMinIO(cfg *config.Config) {
	endpoint := cfg.MinIOEndpoint
	accessKey := cfg.MinIOAccessKey
	secretKey := cfg.MinIOSecretKey
	useSSL := cfg.MinIOUseSSL

	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		log.Fatalf("Failed to initialize MinIO client: %v", err)
	}

	MinioClient = client

	// Ensure bucket exists
	ctx := context.Background()
	bucket := cfg.MinIOBucket
	exists, err := client.BucketExists(ctx, bucket)
	if err != nil {
		log.Fatalf("Failed to check MinIO bucket: %v", err)
	}
	if !exists {
		err = client.MakeBucket(ctx, bucket, minio.MakeBucketOptions{})
		if err != nil {
			log.Fatalf("Failed to create MinIO bucket: %v", err)
		}
		log.Printf("MinIO bucket '%s' created", bucket)
	}

	log.Printf("MinIO connected to %s, bucket: %s", endpoint, bucket)
}

// PresignedPutURL generates a presigned URL for uploading a file.
// Frontend uses this URL to upload directly to MinIO without going through backend.
func PresignedPutURL(ctx context.Context, bucket, objectKey string, expiry time.Duration) (*url.URL, error) {
	return MinioClient.PresignedPutObject(ctx, bucket, objectKey, expiry)
}

// PresignedGetURL generates a presigned URL for downloading/viewing a file.
func PresignedGetURL(ctx context.Context, bucket, objectKey string, expiry time.Duration) (*url.URL, error) {
	reqParams := make(url.Values)
	return MinioClient.PresignedGetObject(ctx, bucket, objectKey, expiry, reqParams)
}

// DeleteFile deletes a file from MinIO.
func DeleteFile(ctx context.Context, bucket, objectKey string) error {
	return MinioClient.RemoveObject(ctx, bucket, objectKey, minio.RemoveObjectOptions{})
}

// BuildObjectKey constructs the MinIO object key path.
// Format: {user_id}/{entity_type}/{entity_id}.{ext}
// Examples:
//   - user_id/avatar.jpg (profile photo)
//   - user_id/novel_id/cover.jpg (novel cover)
//   - user_id/novel_id/characters/char_id.jpg (character image)
//   - user_id/novel_id/settings/setting_id.jpg (setting image)
func BuildObjectKey(userID, novelID, entityType, entityID, ext string) string {
	if novelID != "" {
		return fmt.Sprintf("%s/%s/%s/%s.%s", userID, novelID, entityType, entityID, ext)
	}
	return fmt.Sprintf("%s/%s/%s.%s", userID, entityType, entityID, ext)
}

// FileExtension returns the file extension from a filename.
func FileExtension(filename string) string {
	for i := len(filename) - 1; i >= 0; i-- {
		if filename[i] == '.' {
			return filename[i+1:]
		}
	}
	return ""
}

// MinioPutOptions returns empty PutObjectOptions for MinIO uploads.
func MinioPutOptions() minio.PutObjectOptions {
	return minio.PutObjectOptions{}
}
