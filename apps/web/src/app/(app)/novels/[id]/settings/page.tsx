"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, User, MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/shared/file-upload";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { novelService } from "@/services/novel.service";
import { characterService } from "@/services/character.service";
import { settingService } from "@/services/setting.service";
import { Novel, Character, Setting } from "@/types/novel";
import { toast } from "sonner";

const GENRES = [
  "Fiksi", "Fantasi", "Sci-Fi", "Romance", "Thriller",
  "Horor", "Misteri", "Drama", "Petualangan", "Sastra", "Lainnya",
];

export default function NovelSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const novelId = params.id as string;

  const [novel, setNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [premise, setPremise] = useState("");
  const [synopsis, setSynopsis] = useState("");

  // Characters & Settings
  const [characters, setCharacters] = useState<Character[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [charDialogOpen, setCharDialogOpen] = useState(false);
  const [charEditingId, setCharEditingId] = useState<string | null>(null);
  const [charName, setCharName] = useState("");
  const [charDesc, setCharDesc] = useState("");
  const [charImage, setCharImage] = useState<string | undefined>(undefined);
  const [settingDialogOpen, setSettingDialogOpen] = useState(false);
  const [settingEditingId, setSettingEditingId] = useState<string | null>(null);
  const [settingName, setSettingName] = useState("");
  const [settingDesc, setSettingDesc] = useState("");
  const [settingImage, setSettingImage] = useState<string | undefined>(undefined);
  const [deleteCharTarget, setDeleteCharTarget] = useState<Character | null>(null);
  const [deleteSettingTarget, setDeleteSettingTarget] = useState<Setting | null>(null);

  useEffect(() => {
    async function load() {
      const [novelRes, charsRes, settingsRes] = await Promise.all([
        novelService.get(novelId),
        characterService.list(novelId),
        settingService.list(novelId),
      ]);
      if (novelRes.success && novelRes.data) {
        setNovel(novelRes.data);
        setTitle(novelRes.data.title);
        setGenre(novelRes.data.genre || "");
        setPremise(novelRes.data.premise || "");
        setSynopsis(novelRes.data.synopsis || "");
      }
      if (charsRes.success && charsRes.data) setCharacters(charsRes.data);
      if (settingsRes.success && settingsRes.data) setSettings(settingsRes.data);
      setLoading(false);
    }
    load();
  }, [novelId]);

  async function handleSave() {
    if (!title.trim()) {
      toast.error("Judul wajib diisi");
      return;
    }

    setSaving(true);
    const result = await novelService.update(novelId, {
      title: title.trim(),
      genre: genre || undefined,
      premise: premise || undefined,
      synopsis: synopsis || undefined,
    });
    setSaving(false);

    if (!result.success) {
      toast.error(result.error || "Gagal menyimpan");
      return;
    }

    if (result.data) {
      setNovel(result.data);
      toast.success("Pengaturan berhasil disimpan");
    }
  }

  async function handleDelete() {
    const result = await novelService.remove(novelId);
    if (!result.success) {
      toast.error(result.error || "Gagal menghapus novel");
      return;
    }
    toast.success("Novel berhasil dihapus");
    router.push("/dashboard");
  }

  // Character CRUD
  function openAddChar() {
    setCharEditingId(null);
    setCharName("");
    setCharDesc("");
    setCharImage(undefined);
    setCharDialogOpen(true);
  }

  function openEditChar(char: Character) {
    setCharEditingId(char.id);
    setCharName(char.name);
    setCharDesc(char.description || "");
    setCharImage(char.image_path || undefined);
    setCharDialogOpen(true);
  }

  async function handleSaveChar() {
    if (!charName.trim()) return;
    if (charEditingId) {
      const res = await characterService.update(charEditingId, { name: charName.trim(), description: charDesc.trim() });
      if (res.success && res.data) {
        setCharacters((prev) => prev.map((c) => c.id === charEditingId ? res.data! : c));
        toast.success("Karakter diupdate");
      }
    } else {
      const res = await characterService.create(novelId, { name: charName.trim(), description: charDesc.trim() });
      if (res.success && res.data) {
        setCharacters((prev) => [...prev, res.data!]);
        toast.success("Karakter ditambahkan");
      }
    }
    setCharDialogOpen(false);
  }

  async function handleDeleteChar() {
    if (!deleteCharTarget) return;
    const res = await characterService.remove(deleteCharTarget.id);
    if (res.success) {
      setCharacters((prev) => prev.filter((c) => c.id !== deleteCharTarget.id));
      toast.success("Karakter dihapus");
    }
    setDeleteCharTarget(null);
  }

  // Setting CRUD
  function openAddSetting() {
    setSettingEditingId(null);
    setSettingName("");
    setSettingDesc("");
    setSettingImage(undefined);
    setSettingDialogOpen(true);
  }

  function openEditSetting(setting: Setting) {
    setSettingEditingId(setting.id);
    setSettingName(setting.name);
    setSettingDesc(setting.description || "");
    setSettingImage(setting.image_path || undefined);
    setSettingDialogOpen(true);
  }

  async function handleSaveSetting() {
    if (!settingName.trim()) return;
    if (settingEditingId) {
      const res = await settingService.update(settingEditingId, { name: settingName.trim(), description: settingDesc.trim() });
      if (res.success && res.data) {
        setSettings((prev) => prev.map((s) => s.id === settingEditingId ? res.data! : s));
        toast.success("Latar diupdate");
      }
    } else {
      const res = await settingService.create(novelId, { name: settingName.trim(), description: settingDesc.trim() });
      if (res.success && res.data) {
        setSettings((prev) => [...prev, res.data!]);
        toast.success("Latar ditambahkan");
      }
    }
    setSettingDialogOpen(false);
  }

  async function handleDeleteSetting() {
    if (!deleteSettingTarget) return;
    const res = await settingService.remove(deleteSettingTarget.id);
    if (res.success) {
      setSettings((prev) => prev.filter((s) => s.id !== deleteSettingTarget.id));
      toast.success("Latar dihapus");
    }
    setDeleteSettingTarget(null);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Novel tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[600px] px-4 py-8">
      <button
        onClick={() => router.push(`/novels/${novelId}`)}
        className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Editor
      </button>

      <h1 className="mb-8 text-2xl font-bold">Pengaturan Novel</h1>

      {/* Cover & Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Info Dasar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <FileUpload
            label="Cover Novel"
            description="JPG, PNG, atau WebP. Rasio 3:4. Maks 2MB."
            currentUrl={novel.cover_path}
            previewShape="rectangle"
            meta={{
              file_type: "cover",
              entity_type: "novel",
              entity_id: novelId,
              novel_id: novelId,
            }}
            onUploaded={async (objectKey) => {
              await novelService.update(novelId, { cover_path: objectKey });
              toast.success("Cover berhasil diupdate");
            }}
            onDeleted={async () => {
              await novelService.update(novelId, { cover_path: null });
              toast.success("Cover berhasil dihapus");
            }}
          />

          <div className="space-y-2">
            <Label htmlFor="title">Judul Novel</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Genre</Label>
            <Select value={genre} onValueChange={(v) => v && setGenre(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih genre" />
              </SelectTrigger>
              <SelectContent>
                {GENRES.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="premise">Premis</Label>
            <Textarea
              id="premise"
              value={premise}
              onChange={(e) => setPremise(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="synopsis">Sinopsis</Label>
            <Textarea
              id="synopsis"
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              rows={6}
            />
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Perubahan"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Characters */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Karakter ({characters.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={openAddChar}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Tambah
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {characters.length === 0 ? (
            <p className="text-sm text-gray-400">Belum ada karakter</p>
          ) : (
            <div className="space-y-3">
              {characters.map((char) => (
                <div key={char.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                    <User className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold">{char.name}</h4>
                    <p className="line-clamp-2 text-xs text-gray-500">{char.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEditChar(char)} className="rounded p-1.5 hover:bg-gray-100">
                      <Pencil className="h-3.5 w-3.5 text-gray-500" />
                    </button>
                    <button onClick={() => setDeleteCharTarget(char)} className="rounded p-1.5 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Latar ({settings.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={openAddSetting}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Tambah
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {settings.length === 0 ? (
            <p className="text-sm text-gray-400">Belum ada latar</p>
          ) : (
            <div className="space-y-3">
              {settings.map((setting) => (
                <div key={setting.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="flex h-10 w-12 shrink-0 items-center justify-center rounded bg-gray-100">
                    <MapPin className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold">{setting.name}</h4>
                    <p className="line-clamp-2 text-xs text-gray-500">{setting.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEditSetting(setting)} className="rounded p-1.5 hover:bg-gray-100">
                      <Pencil className="h-3.5 w-3.5 text-gray-500" />
                    </button>
                    <button onClick={() => setDeleteSettingTarget(setting)} className="rounded p-1.5 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-500">
            Menghapus novel akan menghapus semua bab, karakter, latar, dan file
            yang terkait. Tindakan ini tidak dapat dibatalkan.
          </p>
          <Button
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            Hapus Novel
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Novel?"
        description={`Ketik "${novel.title}" untuk konfirmasi penghapusan.`}
        confirmLabel="Hapus"
        variant="destructive"
        requireTyping={novel.title}
        onConfirm={handleDelete}
      />

      {/* Character Dialog */}
      <Dialog open={charDialogOpen} onOpenChange={setCharDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{charEditingId ? "Edit Karakter" : "Tambah Karakter"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <FileUpload
                previewShape="circle"
                description="Foto karakter"
                currentUrl={charImage}
                meta={{ file_type: "character_image", entity_type: "character", novel_id: novelId }}
                onUploaded={(key) => setCharImage(key)}
                onDeleted={() => setCharImage(undefined)}
              />
            </div>
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input value={charName} onChange={(e) => setCharName(e.target.value)} placeholder="Nama karakter" />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea value={charDesc} onChange={(e) => setCharDesc(e.target.value)} placeholder="Deskripsi karakter..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCharDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSaveChar}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Setting Dialog */}
      <Dialog open={settingDialogOpen} onOpenChange={setSettingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{settingEditingId ? "Edit Latar" : "Tambah Latar"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <FileUpload
                previewShape="rectangle"
                description="Gambar latar"
                currentUrl={settingImage}
                meta={{ file_type: "setting_image", entity_type: "setting", novel_id: novelId }}
                onUploaded={(key) => setSettingImage(key)}
                onDeleted={() => setSettingImage(undefined)}
              />
            </div>
            <div className="space-y-2">
              <Label>Nama Latar</Label>
              <Input value={settingName} onChange={(e) => setSettingName(e.target.value)} placeholder="Nama latar" />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea value={settingDesc} onChange={(e) => setSettingDesc(e.target.value)} placeholder="Deskripsi latar..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSaveSetting}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Character Confirm */}
      <ConfirmDialog
        open={!!deleteCharTarget}
        onOpenChange={(o) => !o && setDeleteCharTarget(null)}
        title="Hapus Karakter?"
        description={`Hapus karakter "${deleteCharTarget?.name}"?`}
        onConfirm={handleDeleteChar}
      />

      {/* Delete Setting Confirm */}
      <ConfirmDialog
        open={!!deleteSettingTarget}
        onOpenChange={(o) => !o && setDeleteSettingTarget(null)}
        title="Hapus Latar?"
        description={`Hapus latar "${deleteSettingTarget?.name}"?`}
        onConfirm={handleDeleteSetting}
      />
    </div>
  );
}
