"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  Download,
  Settings,
  PanelRightOpen,
  PanelRightClose,
  Maximize,
  Minimize,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEditorStore, SaveStatus } from "@/stores/editor-store";
import { useAuthStore } from "@/stores/auth-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu as ProfileMenu,
  DropdownMenuContent as ProfileContent,
  DropdownMenuItem as ProfileItem,
  DropdownMenuTrigger as ProfileTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  switch (status) {
    case "saving":
      return (
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Menyimpan...
        </span>
      );
    case "saved":
      return <span className="text-xs text-green-600">Tersimpan</span>;
    case "error":
      return <span className="text-xs text-red-600">Gagal menyimpan</span>;
    default:
      return null;
  }
}

export function EditorTopbar() {
  const router = useRouter();
  const novel = useEditorStore((s) => s.novel);
  const saveStatus = useEditorStore((s) => s.saveStatus);
  const panelOpen = useEditorStore((s) => s.panelOpen);
  const fullscreen = useEditorStore((s) => s.fullscreen);
  const togglePanel = useEditorStore((s) => s.togglePanel);
  const toggleFullscreen = useEditorStore((s) => s.toggleFullscreen);

  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 flex h-12 items-center justify-between border-b border-gray-200 bg-white px-4">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </button>
        <div className="h-4 w-px bg-gray-200" />
        <h1 className="max-w-[200px] truncate text-sm font-semibold text-gray-900">
          {novel?.title || "..."}
        </h1>
      </div>

      {/* Center */}
      <SaveStatusIndicator status={saveStatus} />

      {/* Right */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => router.push(`/novels/${novel?.id}/preview`)}
        >
          <Eye className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100">
            <Download className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>PDF</DropdownMenuItem>
            <DropdownMenuItem>EPUB</DropdownMenuItem>
            <DropdownMenuItem>DOCX</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => router.push(`/novels/${novel?.id}/settings`)}
        >
          <Settings className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={togglePanel}
        >
          {panelOpen ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <PanelRightOpen className="h-4 w-4" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={toggleFullscreen}
        >
          {fullscreen ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
        </Button>

        <div className="ml-1 h-4 w-px bg-gray-200" />

        <ProfileMenu>
          <ProfileTrigger className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-indigo-100 text-[10px] font-semibold text-indigo-600">
                {initials}
              </AvatarFallback>
            </Avatar>
          </ProfileTrigger>
          <ProfileContent align="end" className="w-40">
            <ProfileItem onClick={() => router.push("/profile")}>
              <User className="mr-2 h-3.5 w-3.5" />
              Profil
            </ProfileItem>
            <ProfileItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Keluar
            </ProfileItem>
          </ProfileContent>
        </ProfileMenu>
      </div>
    </header>
  );
}
