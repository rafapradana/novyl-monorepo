"use client";

import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";
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
import { WizardSetting } from "@/stores/wizard-store";

interface StepSettingsProps {
  settings: WizardSetting[];
  onAdd: (setting: WizardSetting) => void;
  onUpdate: (id: string, updates: Partial<WizardSetting>) => void;
  onRemove: (id: string) => void;
}

export function StepSettings({
  settings,
  onAdd,
  onUpdate,
  onRemove,
}: StepSettingsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imagePath, setImagePath] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<WizardSetting | null>(null);

  function openAdd() {
    setEditingId(null);
    setName("");
    setDescription("");
    setImagePath(undefined);
    setErrors({});
    setDialogOpen(true);
  }

  function openEdit(setting: WizardSetting) {
    setEditingId(setting.id);
    setName(setting.name);
    setDescription(setting.description);
    setImagePath(setting.image_path);
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
      <div>
        <h2 className="text-xl font-bold text-gray-900">Latar & Setting</h2>
        <p className="mt-1 text-sm text-gray-500">
          Tambahkan lokasi dan setting cerita. Bisa dilewati dan ditambahkan
          nanti.
        </p>
      </div>

      {/* Setting List */}
      {settings.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="Belum ada latar"
          description="Tambahkan latar untuk membangun dunia novel Anda"
          actionLabel="+ Tambah Latar"
          onAction={openAdd}
        />
      ) : (
        <div className="space-y-3">
          {settings.map((setting) => (
            <div
              key={setting.id}
              className="flex items-start gap-3 rounded-lg border border-gray-200 p-4"
            >
              <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded bg-gray-100">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-gray-900">{setting.name}</h4>
                <p className="mt-0.5 line-clamp-2 text-sm text-gray-500">
                  {setting.description}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(setting)}
                  className="rounded p-1.5 hover:bg-gray-100"
                >
                  <Pencil className="h-4 w-4 text-gray-500" />
                </button>
                <button
                  onClick={() => setDeleteTarget(setting)}
                  className="rounded p-1.5 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={openAdd} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Latar
          </Button>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Latar" : "Tambah Latar"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <FileUpload
                previewShape="rectangle"
                description="Gambar latar"
                currentUrl={imagePath}
                meta={{
                  file_type: "setting_image",
                  entity_type: "setting",
                }}
                onUploaded={(key) => setImagePath(key)}
                onDeleted={() => setImagePath(undefined)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="setting-name">Nama Latar</Label>
              <Input
                id="setting-name"
                placeholder="Nama latar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="setting-desc">Deskripsi</Label>
              <Textarea
                id="setting-desc"
                placeholder="Ceritakan tentang tempat ini: visual, suasana, detail penting..."
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
        title="Hapus Latar?"
        description={`Apakah Anda yakin ingin menghapus latar "${deleteTarget?.name}"?`}
        confirmLabel="Hapus"
        variant="destructive"
        onConfirm={async () => {
          if (deleteTarget) onRemove(deleteTarget.id);
        }}
      />
    </div>
  );
}
