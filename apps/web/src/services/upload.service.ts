import { api } from "@/lib/api-client";
import { APIResponse } from "@/types/user";

export interface PresignUploadInput {
  file_name: string;
  file_type: string;
  entity_type: string;
  entity_id?: string;
  novel_id?: string;
}

export interface PresignUploadOutput {
  upload_url: string;
  object_key: string;
  expires_in: number;
}

export interface PresignDownloadOutput {
  url: string;
  expires_in: number;
}

export interface ConfirmUploadInput extends PresignUploadInput {
  object_key: string;
  file_size?: number;
}

export const uploadService = {
  async getPresignedUrl(
    input: PresignUploadInput
  ): Promise<APIResponse<PresignUploadOutput>> {
    return api.post<PresignUploadOutput>("/upload/presign", input);
  },

  async confirmUpload(
    input: ConfirmUploadInput
  ): Promise<APIResponse<unknown>> {
    return api.post<unknown>("/upload/confirm", input);
  },

  async getDownloadUrl(
    objectKey: string
  ): Promise<APIResponse<PresignDownloadOutput>> {
    return api.get<PresignDownloadOutput>(
      `/upload/url/${encodeURIComponent(objectKey)}`
    );
  },

  async deleteFile(objectKey: string): Promise<APIResponse<null>> {
    return api.delete<null>(
      `/upload/${encodeURIComponent(objectKey)}`
    );
  },
};
