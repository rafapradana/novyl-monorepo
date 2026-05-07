import { create } from "zustand";
import { Novel, Chapter } from "@/types/novel";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface EditorState {
  novel: Novel | null;
  chapters: Chapter[];
  activeChapterId: string | null;
  saveStatus: SaveStatus;
  sidebarOpen: boolean;
  panelOpen: boolean;
  fullscreen: boolean;

  setNovel: (novel: Novel) => void;
  setChapters: (chapters: Chapter[]) => void;
  setActiveChapter: (id: string) => void;
  updateChapterLocal: (id: string, updates: Partial<Chapter>) => void;
  setSaveStatus: (status: SaveStatus) => void;
  toggleSidebar: () => void;
  togglePanel: () => void;
  toggleFullscreen: () => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  novel: null,
  chapters: [],
  activeChapterId: null,
  saveStatus: "idle",
  sidebarOpen: true,
  panelOpen: true,
  fullscreen: false,

  setNovel: (novel) => set({ novel }),

  setChapters: (chapters) => set({ chapters }),

  setActiveChapter: (id) => set({ activeChapterId: id }),

  updateChapterLocal: (id, updates) =>
    set((state) => ({
      chapters: state.chapters.map((ch) =>
        ch.id === id ? { ...ch, ...updates } : ch
      ),
    })),

  setSaveStatus: (status) => set({ saveStatus: status }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),

  toggleFullscreen: () =>
    set((state) => ({ fullscreen: !state.fullscreen })),

  reset: () =>
    set({
      novel: null,
      chapters: [],
      activeChapterId: null,
      saveStatus: "idle",
      sidebarOpen: true,
      panelOpen: true,
      fullscreen: false,
    }),
}));
