"use client";

import { useState } from "react";
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
  Loader2,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEditorStore, SaveStatus } from "@/stores/editor-store";
import { useAuthStore } from "@/stores/auth-store";
import { exportService } from "@/services/export.service";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

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
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [exporting, setExporting] = useState(false);

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  async function handleLogout() {
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    clearAuth();
    router.push("/login");
  }

  async function handleExport(format: "pdf" | "epub" | "docx") {
    if (!novel?.id || exporting) return;
    setExporting(true);
    const result = await exportService.exportNovel(novel.id, format);
    setExporting(false);

    if (!result.success || !result.data) {
      toast.error(result.error || "Gagal export novel");
      return;
    }

    // Trigger download
    const link = document.createElement("a");
    link.href = result.data.download_url;
    link.download = `${novel.title}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Novel berhasil di-export sebagai ${format.toUpperCase()}`);
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
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport("pdf")} disabled={exporting}>
              PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("epub")} disabled={exporting}>
              EPUB
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("docx")} disabled={exporting}>
              DOCX
            </DropdownMenuItem>
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

        <DropdownMenu>
          <DropdownMenuTrigger className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-indigo-100 text-[10px] font-semibold text-indigo-600">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <User className="mr-2 h-3.5 w-3.5" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
