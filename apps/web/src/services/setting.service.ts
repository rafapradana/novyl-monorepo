import { api } from "@/lib/api-client";
import {
  Setting,
  CreateSettingInput,
  UpdateSettingInput,
  APIResponse,
} from "@/types/novel";

export const settingService = {
  async list(novelId: string): Promise<APIResponse<Setting[]>> {
    return api.get<Setting[]>(`/novels/${novelId}/settings`);
  },

  async create(
    novelId: string,
    input: CreateSettingInput
  ): Promise<APIResponse<Setting>> {
    return api.post<Setting>(`/novels/${novelId}/settings`, input);
  },

  async update(
    id: string,
    input: UpdateSettingInput
  ): Promise<APIResponse<Setting>> {
    return api.put<Setting>(`/settings/${id}`, input);
  },

  async remove(id: string): Promise<APIResponse<null>> {
    return api.delete<null>(`/settings/${id}`);
  },
};
