import { api } from "@/lib/api-client";
import {
  Chapter,
  CreateChapterInput,
  UpdateChapterInput,
  UpdateChapterContentInput,
  ReorderChaptersInput,
  APIResponse,
} from "@/types/novel";

export const chapterService = {
  async list(novelId: string): Promise<APIResponse<Chapter[]>> {
    return api.get<Chapter[]>(`/novels/${novelId}/chapters`);
  },

  async create(
    novelId: string,
    input: CreateChapterInput
  ): Promise<APIResponse<Chapter>> {
    return api.post<Chapter>(`/novels/${novelId}/chapters`, input);
  },

  async update(
    id: string,
    input: UpdateChapterInput
  ): Promise<APIResponse<Chapter>> {
    return api.put<Chapter>(`/chapters/${id}`, input);
  },

  async updateContent(
    id: string,
    input: UpdateChapterContentInput
  ): Promise<APIResponse<Chapter>> {
    return api.patch<Chapter>(`/chapters/${id}/content`, input);
  },

  async updateStatus(
    id: string,
    status: string
  ): Promise<APIResponse<Chapter>> {
    return api.patch<Chapter>(`/chapters/${id}/status`, { status });
  },

  async remove(id: string): Promise<APIResponse<null>> {
    return api.delete<null>(`/chapters/${id}`);
  },

  async reorder(
    novelId: string,
    input: ReorderChaptersInput
  ): Promise<APIResponse<null>> {
    return api.patch<null>(`/novels/${novelId}/chapters/reorder`, input);
  },
};
