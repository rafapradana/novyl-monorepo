"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/auth-store";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  // Change password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [changingPassword, setChangingPassword] = useState(false);

  async function handleSaveProfile() {
    if (!name.trim() || name.trim().length < 2) {
      toast.error("Nama minimal 2 karakter");
      return;
    }

    setSaving(true);
    const result = await authService.updateProfile({ name: name.trim() });
    setSaving(false);

    if (!result.success) {
      toast.error(result.error || "Gagal update profil");
      return;
    }

    if (result.data) {
      updateUser(result.data);
      toast.success("Profil berhasil diperbarui");
    }
  }

  function validatePassword(): boolean {
    const errors: Record<string, string> = {};

    if (!oldPassword) errors.old_password = "Password lama wajib diisi";
    if (!newPassword) {
      errors.new_password = "Password baru wajib diisi";
    } else if (newPassword.length < 6) {
      errors.new_password = "Password baru minimal 6 karakter";
    }
    if (!confirmPassword) {
      errors.confirm_password = "Konfirmasi password wajib diisi";
    } else if (newPassword !== confirmPassword) {
      errors.confirm_password = "Password tidak cocok";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleChangePassword() {
    if (!validatePassword()) return;

    setChangingPassword(true);
    const result = await authService.changePassword({
      old_password: oldPassword,
      new_password: newPassword,
    });
    setChangingPassword(false);

    if (!result.success) {
      if (result.error?.includes("lama salah")) {
        setPasswordErrors({ old_password: "Password lama salah" });
      } else {
        toast.error(result.error || "Gagal mengganti password");
      }
      return;
    }

    toast.success("Password berhasil diubah");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <div className="mx-auto max-w-[480px] px-4 py-8">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </button>

      <h1 className="mb-8 text-2xl font-bold">Profil Saya</h1>

      {/* Profile Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informasi Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="group relative h-24 w-24 cursor-pointer overflow-hidden rounded-full bg-indigo-100">
              {user?.avatar_path ? (
                <div className="h-full w-full bg-gray-200" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-indigo-600">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            <span className="text-sm text-gray-400">
              Foto profil (coming soon)
            </span>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email (disabled) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user?.email || ""}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-400">Email tidak dapat diubah</p>
          </div>

          <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
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

      {/* Change Password Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ubah Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oldPassword">Password Lama</Label>
            <Input
              id="oldPassword"
              type="password"
              placeholder="Password lama"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            {passwordErrors.old_password && (
              <p className="text-sm text-red-600">{passwordErrors.old_password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Password Baru</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Minimal 6 karakter"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            {passwordErrors.new_password && (
              <p className="text-sm text-red-600">{passwordErrors.new_password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">Konfirmasi Password Baru</Label>
            <Input
              id="confirmNewPassword"
              type="password"
              placeholder="Ulangi password baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {passwordErrors.confirm_password && (
              <p className="text-sm text-red-600">{passwordErrors.confirm_password}</p>
            )}
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={changingPassword}
            variant="outline"
            className="w-full"
          >
            {changingPassword ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengubah...
              </>
            ) : (
              "Ubah Password"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button variant="ghost" className="w-full text-red-600 hover:text-red-700" onClick={handleLogout}>
        Keluar
      </Button>
    </div>
  );
}
