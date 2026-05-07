"use client";

import { useState } from "react";
import {
  Plus,
  MoreVertical,
  Pencil,
  CheckCircle2,
  Circle,
  Trash2,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Chapter, ChapterStatus } from "@/types/novel";

interface ChapterSidebarProps {
  chapters: Chapter[];
  activeChapterId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onUpdate: (id: string, updates: { title?: string; outline?: string }) => void;
  onUpdateStatus: (id: string, status: ChapterStatus) => void;
  onDelete: (id: string) => void;
}

function StatusDot({ status }: { status: ChapterStatus }) {
  const colors: Record<ChapterStatus, string> = {
    draft: "bg-gray-400",
    in_progress: "bg-yellow-400",
    completed: "bg-green-400",
    failed: "bg-red-400",
  };
  return <span className={`h-2 w-2 rounded-full ${colors[status] || "bg-gray-400"}`} />;
}

function formatWordCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k kata`;
  }
  return `${count} kata`;
}

export function ChapterSidebar({
  chapters,
  activeChapterId,
  onSelect,
  onAdd,
  onUpdate,
  onUpdateStatus,
  onDelete,
}: ChapterSidebarProps) {
  const [editTarget, setEditTarget] = useState<Chapter | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editOutline, setEditOutline] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Chapter | null>(null);

  function openEdit(ch: Chapter) {
    setEditTarget(ch);
    setEditTitle(ch.title);
    setEditOutline(ch.outline || "");
  }

  function handleSaveEdit() {
    if (editTarget) {
      onUpdate(editTarget.id, {
        title: editTitle,
        outline: editOutline,
      });
      setEditTarget(null);
    }
  }

  return (
    <aside className="flex h-full w-[240px] flex-col border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Daftar Bab
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Chapter List */}
      <div className="flex-1 overflow-y-auto">
        {chapters.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <p className="text-xs text-gray-400">Belum ada bab</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs text-indigo-600"
              onClick={onAdd}
            >
              + Tambah Bab
            </Button>
          </div>
        ) : (
          <div className="py-1">
            {chapters.map((ch, index) => {
              const isActive = ch.id === activeChapterId;
              return (
                <div
                  key={ch.id}
                  onClick={() => onSelect(ch.id)}
                  className={`group flex cursor-pointer items-start gap-2 px-3 py-2.5 transition-colors ${
                    isActive
                      ? "border-l-2 border-indigo-600 bg-indigo-50"
                      : "border-l-2 border-transparent hover:bg-gray-50"
                  }`}
                >
                  {/* Drag handle */}
                  <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-grab text-gray-300 opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-400">
                        {index + 1}
                      </span>
                      <StatusDot status={ch.status} />
                      <span
                        className={`truncate text-sm ${
                          isActive ? "font-semibold text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {ch.title || "(tanpa judul)"}
                      </span>
                    </div>
                    <span className="ml-5 text-[10px] text-gray-400">
                      {formatWordCount(ch.word_count)}
                    </span>
                  </div>

                  {/* Context menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="mt-0.5 flex h-5 w-5 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-3 w-3 text-gray-500" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(ch);
                        }}
                      >
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Edit Judul & Outline
                      </DropdownMenuItem>
                      {ch.status === "completed" ? (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(ch.id, "draft");
                          }}
                        >
                          <Circle className="mr-2 h-3.5 w-3.5" />
                          Tandai Draft
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(ch.id, "completed");
                          }}
                        >
                          <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                          Tandai Selesai
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(ch);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Hapus Bab
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bab</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Judul</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Judul bab"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Outline</label>
              <Textarea
                value={editOutline}
                onChange={(e) => setEditOutline(e.target.value)}
                placeholder="Ringkasan isi bab..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Batal
            </Button>
            <Button onClick={handleSaveEdit}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Bab?"
        description={`Apakah Anda yakin ingin menghapus "${deleteTarget?.title || "bab ini"}"?`}
        confirmLabel="Hapus"
        variant="destructive"
        onConfirm={async () => {
          if (deleteTarget) onDelete(deleteTarget.id);
        }}
      />
    </aside>
  );
}
