import { api } from "@/lib/api-client";
import { Novel, CreateNovelInput, UpdateNovelInput, APIResponse } from "@/types/novel";

export const novelService = {
  async list(): Promise<APIResponse<Novel[]>> {
    return api.get<Novel[]>("/novels");
  },

  async get(id: string): Promise<APIResponse<Novel>> {
    return api.get<Novel>(`/novels/${id}`);
  },

  async create(input: CreateNovelInput): Promise<APIResponse<Novel>> {
    return api.post<Novel>("/novels", input);
  },

  async update(id: string, input: UpdateNovelInput): Promise<APIResponse<Novel>> {
    return api.put<Novel>(`/novels/${id}`, input);
  },

  async remove(id: string): Promise<APIResponse<null>> {
    return api.delete<null>(`/novels/${id}`);
  },
};
