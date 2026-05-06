import { create } from "zustand";

export interface WizardCharacter {
  id: string;
  name: string;
  description: string;
}

export interface WizardSetting {
  id: string;
  name: string;
  description: string;
}

export interface WizardChapter {
  id: string;
  title: string;
  outline: string;
}

interface WizardState {
  currentStep: number;
  visitedSteps: Set<number>;

  // Step 1 — Basics
  title: string;
  genre: string;
  premise: string;
  synopsis: string;

  // Step 2 — Characters
  characters: WizardCharacter[];

  // Step 3 — Settings
  settings: WizardSetting[];

  // Step 4 — Chapters
  chapters: WizardChapter[];

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  setBasics: (data: { title: string; genre: string; premise: string; synopsis: string }) => void;

  addCharacter: (char: WizardCharacter) => void;
  updateCharacter: (id: string, char: Partial<WizardCharacter>) => void;
  removeCharacter: (id: string) => void;

  addSetting: (setting: WizardSetting) => void;
  updateSetting: (id: string, setting: Partial<WizardSetting>) => void;
  removeSetting: (id: string) => void;

  addChapter: (chapter: WizardChapter) => void;
  updateChapter: (id: string, chapter: Partial<WizardChapter>) => void;
  removeChapter: (id: string) => void;
  reorderChapters: (chapters: WizardChapter[]) => void;

  reset: () => void;
}

const initialState = {
  currentStep: 1,
  visitedSteps: new Set([1]),
  title: "",
  genre: "",
  premise: "",
  synopsis: "",
  characters: [] as WizardCharacter[],
  settings: [] as WizardSetting[],
  chapters: [] as WizardChapter[],
};

export const useWizardStore = create<WizardState>((set) => ({
  ...initialState,

  setStep: (step) =>
    set((state) => ({
      currentStep: step,
      visitedSteps: new Set([...state.visitedSteps, step]),
    })),

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 5),
      visitedSteps: new Set([...state.visitedSteps, state.currentStep + 1]),
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1),
    })),

  setBasics: (data) =>
    set({
      title: data.title,
      genre: data.genre,
      premise: data.premise,
      synopsis: data.synopsis,
    }),

  addCharacter: (char) =>
    set((state) => ({
      characters: [...state.characters, char],
    })),

  updateCharacter: (id, updates) =>
    set((state) => ({
      characters: state.characters.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  removeCharacter: (id) =>
    set((state) => ({
      characters: state.characters.filter((c) => c.id !== id),
    })),

  addSetting: (setting) =>
    set((state) => ({
      settings: [...state.settings, setting],
    })),

  updateSetting: (id, updates) =>
    set((state) => ({
      settings: state.settings.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    })),

  removeSetting: (id) =>
    set((state) => ({
      settings: state.settings.filter((s) => s.id !== id),
    })),

  addChapter: (chapter) =>
    set((state) => ({
      chapters: [...state.chapters, chapter],
    })),

  updateChapter: (id, updates) =>
    set((state) => ({
      chapters: state.chapters.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  removeChapter: (id) =>
    set((state) => ({
      chapters: state.chapters.filter((c) => c.id !== id),
    })),

  reorderChapters: (chapters) => set({ chapters }),

  reset: () => set(initialState),
}));
