"use client";

import { useRouter } from "next/navigation";
import { BookOpen, MoreVertical, Settings, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Novel, NovelStatus } from "@/types/novel";

interface NovelCardProps {
  novel: Novel;
  onDelete: (novel: Novel) => void;
}

function StatusBadge({ status }: { status: NovelStatus }) {
  const config: Record<NovelStatus, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-gray-100 text-gray-600" },
    in_progress: {
      label: "In Progress",
      className: "bg-yellow-50 text-yellow-700",
    },
    completed: {
      label: "Completed",
      className: "bg-green-50 text-green-700",
    },
    archived: { label: "Archived", className: "bg-gray-100 text-gray-500" },
  };

  const { label, className } = config[status] || config.draft;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "completed"
            ? "bg-green-400"
            : status === "in_progress"
              ? "bg-yellow-400"
              : "bg-gray-400"
        }`}
      />
      {label}
    </span>
  );
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "baru saja";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} menit lalu`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam lalu`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} hari lalu`;
  return date.toLocaleDateString("id-ID");
}

export function NovelCard({ novel, onDelete }: NovelCardProps) {
  const router = useRouter();

  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-md"
      onClick={() => router.push(`/novels/${novel.id}`)}
    >
      {/* Cover */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
        {novel.cover_path ? (
          <div className="h-full w-full bg-gray-200" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="h-12 w-12 text-gray-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-gray-900">
            {novel.title}
          </h3>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
                <MoreVertical className="h-4 w-4 text-gray-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/novels/${novel.id}/settings`);
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                Pengaturan
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(novel);
                }}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {novel.genre && (
          <Badge
            variant="secondary"
            className="mb-2 bg-indigo-50 text-xs text-indigo-700"
          >
            {novel.genre}
          </Badge>
        )}

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{novel.chapters?.length || 0} bab</span>
          <StatusBadge status={novel.status} />
        </div>

        <p className="mt-1 text-xs text-gray-400">
          {timeAgo(novel.updated_at)}
        </p>
      </div>
    </div>
  );
}
