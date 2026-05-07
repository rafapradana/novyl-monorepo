import { api } from "@/lib/api-client";
import { APIResponse } from "@/types/user";

export interface ExportOutput {
  download_url: string;
  format: string;
  file_size: number;
}

export const exportService = {
  async exportNovel(
    novelId: string,
    format: "pdf" | "epub" | "docx"
  ): Promise<APIResponse<ExportOutput>> {
    return api.post<ExportOutput>(`/novels/${novelId}/export`, { format });
  },
};
