"use client";

import { useState } from "react";
import { User, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FileUpload } from "@/components/shared/file-upload";
import { WizardCharacter } from "@/stores/wizard-store";

interface StepCharactersProps {
  characters: WizardCharacter[];
  onAdd: (char: WizardCharacter) => void;
  onUpdate: (id: string, updates: Partial<WizardCharacter>) => void;
  onRemove: (id: string) => void;
}

export function StepCharacters({
  characters,
  onAdd,
  onUpdate,
  onRemove,
}: StepCharactersProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imagePath, setImagePath] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<WizardCharacter | null>(
    null
  );

  function openAdd() {
    setEditingId(null);
    setName("");
    setDescription("");
    setImagePath(undefined);
    setErrors({});
    setDialogOpen(true);
  }

  function openEdit(char: WizardCharacter) {
    setEditingId(char.id);
    setName(char.name);
    setDescription(char.description);
    setImagePath(char.image_path);
    setErrors({});
    setDialogOpen(true);
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Nama wajib diisi";
    else if (name.length > 50) newErrors.name = "Nama maksimal 50 karakter";
    if (!description.trim()) newErrors.description = "Deskripsi wajib diisi";
    else if (description.length > 1000)
      newErrors.description = "Deskripsi maksimal 1000 karakter";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;

    if (editingId) {
      onUpdate(editingId, { name: name.trim(), description: description.trim(), image_path: imagePath });
    } else {
      onAdd({
        id: crypto.randomUUID(),
        name: name.trim(),
        description: description.trim(),
        image_path: imagePath,
      });
    }
    setDialogOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Karakter</h2>
          <p className="mt-1 text-sm text-gray-500">
            Tambahkan karakter untuk novel Anda. Bisa dilewati dan ditambahkan
            nanti.
          </p>
        </div>
      </div>

      {/* Character List */}
      {characters.length === 0 ? (
        <EmptyState
          icon={User}
          title="Belum ada karakter"
          description="Tambahkan karakter untuk membangun dunia novel Anda"
          actionLabel="+ Tambah Karakter"
          onAction={openAdd}
        />
      ) : (
        <div className="space-y-3">
          {characters.map((char) => (
            <div
              key={char.id}
              className="flex items-start gap-3 rounded-lg border border-gray-200 p-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                <User className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-gray-900">{char.name}</h4>
                <p className="mt-0.5 line-clamp-2 text-sm text-gray-500">
                  {char.description}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(char)}
                  className="rounded p-1.5 hover:bg-gray-100"
                >
                  <Pencil className="h-4 w-4 text-gray-500" />
                </button>
                <button
                  onClick={() => setDeleteTarget(char)}
                  className="rounded p-1.5 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={openAdd} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Karakter
          </Button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Karakter" : "Tambah Karakter"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <FileUpload
                previewShape="circle"
                description="Foto karakter"
                currentUrl={imagePath}
                meta={{
                  file_type: "character_image",
                  entity_type: "character",
                }}
                onUploaded={(key) => setImagePath(key)}
                onDeleted={() => setImagePath(undefined)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="char-name">Nama</Label>
              <Input
                id="char-name"
                placeholder="Nama karakter"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="char-desc">Deskripsi</Label>
              <Textarea
                id="char-desc"
                placeholder="Ceritakan tentang karakter ini: penampilan, kepribadian, latar belakang..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                maxLength={1000}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Karakter?"
        description={`Apakah Anda yakin ingin menghapus karakter "${deleteTarget?.name}"?`}
        confirmLabel="Hapus"
        variant="destructive"
        onConfirm={async () => {
          if (deleteTarget) onRemove(deleteTarget.id);
        }}
      />
    </div>
  );
}
