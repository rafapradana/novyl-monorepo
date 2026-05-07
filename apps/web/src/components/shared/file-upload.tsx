"use client";

import { useRef } from "react";
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFileUpload, UploadStatus } from "@/hooks/use-file-upload";
import { PresignUploadInput } from "@/services/upload.service";

interface FileUploadProps {
  label?: string;
  description?: string;
  currentUrl?: string | null;
  previewShape?: "circle" | "rectangle";
  meta: Omit<PresignUploadInput, "file_name">;
  onUploaded?: (objectKey: string) => void;
  onDeleted?: () => void;
  maxSizeMB?: number;
}

function StatusIndicator({ status, progress }: { status: UploadStatus; progress: number }) {
  switch (status) {
    case "uploading":
      return (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Mengupload... {progress}%</span>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      );
    case "done":
      return (
        <span className="flex items-center gap-1.5 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          Berhasil diupload
        </span>
      );
    case "error":
      return (
        <span className="flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          Gagal mengupload
        </span>
      );
    default:
      return null;
  }
}

export function FileUpload({
  label,
  description,
  currentUrl,
  previewShape = "circle",
  meta,
  onUploaded,
  onDeleted,
  maxSizeMB = 2,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    upload,
    status,
    progress,
    error,
    previewUrl,
    reset,
    isUploading,
  } = useFileUpload({
    maxSizeMB,
    onSuccess: onUploaded,
  });

  const displayUrl = previewUrl || currentUrl;
  const shapeClass = previewShape === "circle" ? "rounded-full" : "rounded-lg";

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await upload(file, meta);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}

      <div className="flex items-start gap-4">
        {/* Preview */}
        <div
          className={`relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 ${shapeClass} cursor-pointer transition-colors hover:border-indigo-300`}
          onClick={() => !isUploading && inputRef.current?.click()}
        >
          {displayUrl ? (
            <div className={`h-full w-full bg-gray-200 ${shapeClass}`} />
          ) : (
            <Upload className="h-8 w-8 text-gray-300" />
          )}

          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            {displayUrl ? "Ganti" : "Upload"}
          </Button>

          {displayUrl && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600"
              onClick={() => {
                reset();
                onDeleted?.();
              }}
              disabled={isUploading}
            >
              <X className="mr-1 h-3 w-3" />
              Hapus
            </Button>
          )}

          {description && (
            <p className="text-xs text-gray-400">{description}</p>
          )}

          <StatusIndicator status={status} progress={progress} />

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
