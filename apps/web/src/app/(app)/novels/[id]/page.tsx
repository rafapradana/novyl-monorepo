"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { EditorTopbar } from "@/components/editor/editor-topbar";
import { ChapterSidebar } from "@/components/editor/chapter-sidebar";
import { NovelEditor } from "@/components/editor/novel-editor";
import { ReferencePanel } from "@/components/editor/reference-panel";
import { useEditorStore } from "@/stores/editor-store";
import { useAutoSave } from "@/hooks/use-auto-save";
import { novelService } from "@/services/novel.service";
import { chapterService } from "@/services/chapter.service";
import { characterService } from "@/services/character.service";
import { settingService } from "@/services/setting.service";
import { Chapter, ChapterStatus, Character, Setting } from "@/types/novel";
import { toast } from "sonner";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const novelId = params.id as string;

  const {
    novel,
    chapters,
    activeChapterId,
    sidebarOpen,
    panelOpen,
    fullscreen,
    setNovel,
    setChapters,
    setActiveChapter,
    updateChapterLocal,
  } = useEditorStore();

  const { debouncedSave } = useAutoSave(3000);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);

  // Load novel + chapters
  useEffect(() => {
    async function load() {
      const [novelRes, chaptersRes, charsRes, settingsRes] = await Promise.all([
        novelService.get(novelId),
        chapterService.list(novelId),
        characterService.list(novelId),
        settingService.list(novelId),
      ]);

      if (!novelRes.success || !novelRes.data) {
        toast.error("Novel tidak ditemukan");
        router.push("/dashboard");
        return;
      }

      setNovel(novelRes.data);

      if (chaptersRes.success && chaptersRes.data) {
        setChapters(chaptersRes.data);
        if (chaptersRes.data.length > 0) {
          const firstChapter = chaptersRes.data[0];
          setActiveChapter(firstChapter.id);
          setContent(firstChapter.content || "");
        }
      }

      if (charsRes.success && charsRes.data) {
        setCharacters(charsRes.data);
      }

      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data);
      }

      setLoading(false);
    }
    load();
  }, [novelId]);

  // Handle chapter select
  const handleSelectChapter = useCallback(
    (id: string) => {
      setActiveChapter(id);
      const ch = chapters.find((c) => c.id === id);
      setContent(ch?.content || "");
    },
    [chapters, setActiveChapter]
  );

  // Handle add chapter
  const handleAddChapter = useCallback(async () => {
    const result = await chapterService.create(novelId, {
      title: "",
      order_index: chapters.length,
    });
    if (result.success && result.data) {
      setChapters([...chapters, result.data]);
      setActiveChapter(result.data.id);
      setContent("");
    }
  }, [novelId, chapters, setChapters, setActiveChapter]);

  // Handle update chapter
  const handleUpdateChapter = useCallback(
    async (id: string, updates: { title?: string; outline?: string }) => {
      const result = await chapterService.update(id, updates);
      if (result.success && result.data) {
        updateChapterLocal(id, result.data);
      }
    },
    [updateChapterLocal]
  );

  // Handle update status
  const handleUpdateStatus = useCallback(
    async (id: string, status: ChapterStatus) => {
      const result = await chapterService.updateStatus(id, status);
      if (result.success && result.data) {
        updateChapterLocal(id, { status: result.data.status });
      }
    },
    [updateChapterLocal]
  );

  // Handle delete chapter
  const handleDeleteChapter = useCallback(
    async (id: string) => {
      const result = await chapterService.remove(id);
      if (result.success) {
        const remaining = chapters.filter((c) => c.id !== id);
        setChapters(remaining);
        if (activeChapterId === id) {
          if (remaining.length > 0) {
            setActiveChapter(remaining[0].id);
            setContent(remaining[0].content || "");
          } else {
            setActiveChapter("");
            setContent("");
          }
        }
        toast.success("Bab berhasil dihapus");
      }
    },
    [chapters, activeChapterId, setChapters, setActiveChapter]
  );

  // Word count (strip HTML tags first)
  const plainText = content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const wordCount = plainText ? plainText.split(/\s+/).length : 0;
  const charCount = plainText.length;

  // Active chapter
  const activeChapter = chapters.find((c) => c.id === activeChapterId);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className={`flex h-screen flex-col ${fullscreen ? "bg-gray-50" : ""}`}>
      <EditorTopbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && !fullscreen && (
          <ChapterSidebar
            chapters={chapters}
            activeChapterId={activeChapterId}
            onSelect={handleSelectChapter}
            onAdd={handleAddChapter}
            onUpdate={handleUpdateChapter}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteChapter}
          />
        )}

        {/* Editor Area */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Editor Content */}
          <div className="flex-1 overflow-y-auto">
            {activeChapterId ? (
              <div className="mx-auto max-w-[720px] px-8">
                {/* Chapter Title */}
                {activeChapter && (
                  <div className="pt-8">
                    <input
                      type="text"
                      value={activeChapter.title}
                      onChange={(e) =>
                        handleUpdateChapter(activeChapter.id, {
                          title: e.target.value,
                        })
                      }
                      placeholder="Judul bab..."
                      className="w-full border-none bg-transparent text-2xl font-bold text-gray-900 outline-none placeholder:text-gray-300"
                    />
                  </div>
                )}
                <NovelEditor
                  content={content}
                  onChange={(text) => {
                    setContent(text);
                    if (activeChapterId) {
                      updateChapterLocal(activeChapterId, { content: text });
                      debouncedSave(activeChapterId, text);
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex min-h-[40vh] items-center justify-center text-gray-400">
                <p>Pilih bab dari sidebar untuk mulai menulis</p>
              </div>
            )}
          </div>

          {/* Bottom Bar */}
          {activeChapterId && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-2">
              <span className="text-xs text-gray-400">
                {wordCount.toLocaleString("id-ID")} kata ·{" "}
                {charCount.toLocaleString("id-ID")} karakter
              </span>
              <div className="flex items-center gap-2">
                {chapters.map((ch, i) => (
                  <button
                    key={ch.id}
                    onClick={() => handleSelectChapter(ch.id)}
                    className={`rounded px-2 py-0.5 text-xs ${
                      ch.id === activeChapterId
                        ? "bg-indigo-100 text-indigo-700 font-medium"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Reference Panel */}
        {panelOpen && !fullscreen && (
          <ReferencePanel
            activeChapter={activeChapter || null}
            characters={characters}
            settings={settings}
          />
        )}
      </div>
    </div>
  );
}
