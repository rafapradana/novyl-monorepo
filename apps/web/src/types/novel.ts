export type NovelStatus = "draft" | "in_progress" | "completed" | "archived";

export type { APIResponse } from "@/types/user";

export type ChapterStatus = "draft" | "in_progress" | "completed" | "failed";

export type GenerationStatus =
  | "waiting"
  | "generating"
  | "completed"
  | "failed"
  | "skipped";

export interface Novel {
  id: string;
  user_id: string;
  title: string;
  premise: string | null;
  genre: string | null;
  synopsis: string | null;
  cover_path: string | null;
  blurb: string | null;
  word_count_target: number | null;
  status: NovelStatus;
  created_at: string;
  updated_at: string;
  chapters?: Chapter[];
  characters?: Character[];
  settings?: Setting[];
}

export interface Chapter {
  id: string;
  novel_id: string;
  title: string;
  outline: string | null;
  content: string | null;
  word_count: number;
  order_index: number;
  status: ChapterStatus;
  generation_status: GenerationStatus;
  created_at: string;
  updated_at: string;
  note?: ChapterNote;
}

export interface Character {
  id: string;
  novel_id: string;
  name: string;
  description: string | null;
  image_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  id: string;
  novel_id: string;
  name: string;
  description: string | null;
  image_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChapterNote {
  id: string;
  chapter_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNovelInput {
  title: string;
  premise?: string;
  genre?: string;
  synopsis?: string;
}

export interface UpdateNovelInput {
  title?: string;
  premise?: string;
  genre?: string;
  synopsis?: string;
  blurb?: string;
}

export interface CreateChapterInput {
  title: string;
  outline?: string;
  order_index?: number;
}

export interface UpdateChapterInput {
  title?: string;
  outline?: string;
}

export interface UpdateChapterContentInput {
  content: string;
}

export interface ReorderChaptersInput {
  chapter_ids: string[];
}

export interface CreateCharacterInput {
  name: string;
  description?: string;
}

export interface UpdateCharacterInput {
  name?: string;
  description?: string;
}

export interface CreateSettingInput {
  name: string;
  description?: string;
}

export interface UpdateSettingInput {
  name?: string;
  description?: string;
}

export interface UpdateNoteInput {
  content: string;
}
