import { api } from "@/lib/api-client";
import {
  Character,
  CreateCharacterInput,
  UpdateCharacterInput,
  APIResponse,
} from "@/types/novel";

export const characterService = {
  async list(novelId: string): Promise<APIResponse<Character[]>> {
    return api.get<Character[]>(`/novels/${novelId}/characters`);
  },

  async create(
    novelId: string,
    input: CreateCharacterInput
  ): Promise<APIResponse<Character>> {
    return api.post<Character>(`/novels/${novelId}/characters`, input);
  },

  async update(
    id: string,
    input: UpdateCharacterInput
  ): Promise<APIResponse<Character>> {
    return api.put<Character>(`/characters/${id}`, input);
  },

  async remove(id: string): Promise<APIResponse<null>> {
    return api.delete<null>(`/characters/${id}`);
  },
};
