"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { WizardChapter } from "@/stores/wizard-store";

interface StepChaptersProps {
  chapters: WizardChapter[];
  onAdd: (chapter: WizardChapter) => void;
  onUpdate: (id: string, updates: Partial<WizardChapter>) => void;
  onRemove: (id: string) => void;
  onReorder: (chapters: WizardChapter[]) => void;
}

export function StepChapters({
  chapters,
  onAdd,
  onUpdate,
  onRemove,
  onReorder,
}: StepChaptersProps) {
  const [deleteTarget, setDeleteTarget] = useState<WizardChapter | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Auto-add first chapter if empty
  useEffect(() => {
    if (chapters.length === 0) {
      onAdd({
        id: crypto.randomUUID(),
        title: "",
        outline: "",
      });
    }
  }, []);

  function handleAdd() {
    onAdd({
      id: crypto.randomUUID(),
      title: "",
      outline: "",
    });
  }

  async function handleRemove() {
    if (deleteTarget) {
      onRemove(deleteTarget.id);
      setDeleteTarget(null);
    }
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setDragOverIndex(index);
  }

  function handleDrop(index: number) {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newChapters = [...chapters];
    const [removed] = newChapters.splice(dragIndex, 1);
    newChapters.splice(index, 0, removed);
    onReorder(newChapters);
    setDragIndex(null);
    setDragOverIndex(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Struktur Bab</h2>
        <p className="mt-1 text-sm text-gray-500">
          Tentukan jumlah bab dan buat outline untuk masing-masing
        </p>
      </div>

      <div className="space-y-3">
        {chapters.map((chapter, index) => (
          <div
            key={chapter.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={() => handleDrop(index)}
            className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
              dragOverIndex === index
                ? "border-indigo-300 bg-indigo-50"
                : "border-gray-200"
            }`}
          >
            {/* Drag Handle */}
            <div className="flex flex-col items-center gap-1 pt-1">
              <GripVertical className="h-4 w-4 cursor-grab text-gray-400" />
              <span className="text-xs text-gray-400">
                {index + 1}
              </span>
            </div>

            {/* Fields */}
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Judul bab"
                value={chapter.title}
                onChange={(e) =>
                  onUpdate(chapter.id, { title: e.target.value })
                }
                maxLength={100}
                className="font-medium"
              />
              <Textarea
                placeholder="Ringkasan isi bab ini..."
                value={chapter.outline}
                onChange={(e) =>
                  onUpdate(chapter.id, { outline: e.target.value })
                }
                rows={2}
                className="text-sm"
              />
            </div>

            {/* Delete */}
            <button
              onClick={() => setDeleteTarget(chapter)}
              className="rounded p-1.5 hover:bg-red-50"
              disabled={chapters.length <= 1}
            >
              <Trash2
                className={`h-4 w-4 ${
                  chapters.length <= 1
                    ? "text-gray-300"
                    : "text-red-500"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={handleAdd} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Tambah Bab
      </Button>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Bab?"
        description={`Apakah Anda yakin ingin menghapus "${deleteTarget?.title || "bab ini"}"?`}
        confirmLabel="Hapus"
        variant="destructive"
        onConfirm={handleRemove}
      />
    </div>
  );
}
