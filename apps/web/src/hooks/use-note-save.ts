import { useCallback, useRef, useState } from "react";
import { noteService } from "@/services/note.service";

export function useNoteSave(debounceMs = 2000) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saving, setSaving] = useState(false);

  const debouncedSave = useCallback(
    (chapterId: string, content: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(async () => {
        setSaving(true);
        await noteService.upsert(chapterId, { content });
        setSaving(false);
      }, debounceMs);
    },
    [debounceMs]
  );

  return { debouncedSave, saving };
}
