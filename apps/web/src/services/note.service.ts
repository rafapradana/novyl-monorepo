import { api } from "@/lib/api-client";
import { ChapterNote, UpdateNoteInput, APIResponse } from "@/types/novel";

export const noteService = {
  async get(chapterId: string): Promise<APIResponse<ChapterNote>> {
    return api.get<ChapterNote>(`/chapters/${chapterId}/notes`);
  },

  async upsert(
    chapterId: string,
    input: UpdateNoteInput
  ): Promise<APIResponse<ChapterNote>> {
    return api.put<ChapterNote>(`/chapters/${chapterId}/notes`, input);
  },

  async remove(chapterId: string): Promise<APIResponse<null>> {
    return api.delete<null>(`/chapters/${chapterId}/notes`);
  },
};
