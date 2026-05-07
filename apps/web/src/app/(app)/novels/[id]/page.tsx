"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, PanelRightOpen, PanelRightClose } from "lucide-react";
import { EditorTopbar } from "@/components/editor/editor-topbar";
import { ChapterSidebar } from "@/components/editor/chapter-sidebar";
import { useEditorStore } from "@/stores/editor-store";
import { useAutoSave } from "@/hooks/use-auto-save";
import { novelService } from "@/services/novel.service";
import { chapterService } from "@/services/chapter.service";
import { Chapter, ChapterStatus } from "@/types/novel";
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
    toggleSidebar,
    togglePanel,
  } = useEditorStore();

  const { debouncedSave } = useAutoSave(3000);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");

  // Load novel + chapters
  useEffect(() => {
    async function load() {
      const [novelRes, chaptersRes] = await Promise.all([
        novelService.get(novelId),
        chapterService.list(novelId),
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

  // Handle content change
  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      setContent(newContent);
      if (activeChapterId) {
        updateChapterLocal(activeChapterId, { content: newContent });
        debouncedSave(activeChapterId, newContent);
      }
    },
    [activeChapterId, updateChapterLocal, debouncedSave]
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

  // Word count
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

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
            <div className="mx-auto max-w-[720px] px-8 py-12">
              {/* Chapter Title */}
              {activeChapter && (
                <div className="mb-6">
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

              {/* Textarea Editor */}
              {activeChapterId ? (
                <textarea
                  value={content}
                  onChange={handleContentChange}
                  placeholder="Mulai menulis bab ini..."
                  className="min-h-[60vh] w-full resize-none border-none bg-transparent font-serif text-[17px] leading-[1.8] text-gray-800 outline-none placeholder:text-gray-300"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                />
              ) : (
                <div className="flex min-h-[40vh] items-center justify-center text-gray-400">
                  <p>Pilih bab dari sidebar untuk mulai menulis</p>
                </div>
              )}
            </div>
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

        {/* Reference Panel (placeholder for Phase 3.10) */}
        {panelOpen && !fullscreen && (
          <aside className="hidden w-[280px] border-l border-gray-200 bg-white lg:block">
            <div className="p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Referensi
              </h3>
              <p className="mt-2 text-xs text-gray-400">
                Panel referensi (outline, karakter, latar, catatan) akan tersedia
                di fase berikutnya.
              </p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
