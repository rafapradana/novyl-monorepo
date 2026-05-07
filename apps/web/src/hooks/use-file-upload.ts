import { useState, useCallback } from "react";
import { uploadService, PresignUploadInput } from "@/services/upload.service";

export type UploadStatus = "idle" | "uploading" | "done" | "error";

interface UseFileUploadOptions {
  maxSizeMB?: number;
  acceptedTypes?: string[];
  onSuccess?: (objectKey: string) => void;
  onError?: (error: string) => void;
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const {
    maxSizeMB = 2,
    acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
    onSuccess,
    onError,
  } = options;

  const [status, setStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        return `File terlalu besar. Maksimal ${maxSizeMB}MB`;
      }
      if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
        return "Format file tidak didukung";
      }
      return null;
    },
    [maxSizeMB, acceptedTypes]
  );

  const upload = useCallback(
    async (file: File, meta: Omit<PresignUploadInput, "file_name">) => {
      // Validate
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setStatus("error");
        onError?.(validationError);
        return null;
      }

      setError(null);
      setStatus("uploading");
      setProgress(0);

      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // 1. Get presigned URL
      const presignResult = await uploadService.getPresignedUrl({
        file_name: file.name,
        ...meta,
      });

      if (!presignResult.success || !presignResult.data) {
        const msg = presignResult.error || "Gagal membuat upload URL";
        setError(msg);
        setStatus("error");
        onError?.(msg);
        return null;
      }

      const { upload_url, object_key } = presignResult.data;

      // 2. Upload directly to MinIO
      try {
        const xhr = new XMLHttpRequest();

        const uploadPromise = new Promise<boolean>((resolve) => {
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          });

          xhr.addEventListener("load", () => {
            resolve(xhr.status >= 200 && xhr.status < 300);
          });

          xhr.addEventListener("error", () => resolve(false));

          xhr.open("PUT", upload_url);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });

        const success = await uploadPromise;

        if (!success) {
          const msg = "Gagal mengupload file";
          setError(msg);
          setStatus("error");
          onError?.(msg);
          return null;
        }

        // 3. Confirm upload
        await uploadService.confirmUpload({
          ...meta,
          file_name: file.name,
          object_key,
          file_size: file.size,
        });

        setStatus("done");
        setProgress(100);
        onSuccess?.(object_key);
        return object_key;
      } catch {
        const msg = "Gagal mengupload file";
        setError(msg);
        setStatus("error");
        onError?.(msg);
        return null;
      }
    },
    [validateFile, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setProgress(0);
    setError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  }, [previewUrl]);

  return {
    upload,
    status,
    progress,
    error,
    previewUrl,
    reset,
    isUploading: status === "uploading",
    isDone: status === "done",
    isError: status === "error",
  };
}
