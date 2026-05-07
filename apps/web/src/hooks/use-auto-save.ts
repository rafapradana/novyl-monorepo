import { useCallback, useRef } from "react";
import { chapterService } from "@/services/chapter.service";
import { useEditorStore, SaveStatus } from "@/stores/editor-store";

export function useAutoSave(debounceMs = 3000) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setSaveStatus = useEditorStore((s) => s.setSaveStatus);
  const updateChapterLocal = useEditorStore((s) => s.updateChapterLocal);

  const save = useCallback(
    async (chapterId: string, content: string) => {
      setSaveStatus("saving");

      const result = await chapterService.updateContent(chapterId, {
        content,
      });

      if (result.success && result.data) {
        setSaveStatus("saved");
        updateChapterLocal(chapterId, {
          content: result.data.content,
          word_count: result.data.word_count,
          status: result.data.status,
        });
      } else {
        setSaveStatus("error");
      }
    },
    [setSaveStatus, updateChapterLocal]
  );

  const debouncedSave = useCallback(
    (chapterId: string, content: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        save(chapterId, content);
      }, debounceMs);
    },
    [save, debounceMs]
  );

  const forceSave = useCallback(
    async (chapterId: string, content: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      await save(chapterId, content);
    },
    [save]
  );

  return { debouncedSave, forceSave };
}
