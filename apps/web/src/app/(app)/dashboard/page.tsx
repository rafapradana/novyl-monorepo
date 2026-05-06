"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Loader2, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { NovelCard } from "@/components/novel/novel-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Topbar } from "@/components/layout/topbar";
import { novelService } from "@/services/novel.service";
import { Novel } from "@/types/novel";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Novel | null>(null);

  async function fetchNovels() {
    setLoading(true);
    setError("");
    const result = await novelService.list();
    setLoading(false);

    if (!result.success) {
      setError(result.error || "Gagal memuat project");
      return;
    }

    setNovels(result.data || []);
  }

  useEffect(() => {
    fetchNovels();
  }, []);

  async function handleDelete() {
    if (!deleteTarget) return;

    const result = await novelService.remove(deleteTarget.id);
    if (!result.success) {
      toast.error(result.error || "Gagal menghapus novel");
      return;
    }

    toast.success("Novel berhasil dihapus");
    setNovels((prev) => prev.filter((n) => n.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Novel Saya</h1>
          <Button onClick={() => router.push("/novels/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Buat Novel Baru
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border">
                <Skeleton className="aspect-[3/4] w-full" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-red-400" />
            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              Gagal memuat project
            </h3>
            <p className="mb-4 text-sm text-gray-500">{error}</p>
            <Button variant="outline" onClick={fetchNovels}>
              Coba Lagi
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && novels.length === 0 && (
          <EmptyState
            icon={BookOpen}
            title="Belum ada novel"
            description="Buat novel pertama Anda dan mulai menulis"
            actionLabel="Buat Novel Baru"
            onAction={() => router.push("/novels/new")}
          />
        )}

        {/* Novel Grid */}
        {!loading && !error && novels.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {novels.map((novel) => (
              <NovelCard
                key={novel.id}
                novel={novel}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Novel?"
        description={`Apakah Anda yakin ingin menghapus "${deleteTarget?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        variant="destructive"
        requireTyping={deleteTarget?.title}
        onConfirm={handleDelete}
      />
    </>
  );
}
