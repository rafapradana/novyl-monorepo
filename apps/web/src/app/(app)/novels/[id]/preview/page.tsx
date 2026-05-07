"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { novelService } from "@/services/novel.service";
import { chapterService } from "@/services/chapter.service";
import { exportService } from "@/services/export.service";
import { uploadService } from "@/services/upload.service";
import { Novel, Chapter } from "@/types/novel";
import { toast } from "sonner";

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const novelId = params.id as string;

  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [novelRes, chaptersRes] = await Promise.all([
        novelService.get(novelId),
        chapterService.list(novelId),
      ]);
      if (novelRes.success && novelRes.data) {
        setNovel(novelRes.data);
        if (novelRes.data.cover_path) {
          const urlRes = await uploadService.getDownloadUrl(novelRes.data.cover_path);
          if (urlRes.success && urlRes.data) setCoverUrl(urlRes.data.url);
        }
      }
      if (chaptersRes.success && chaptersRes.data)
        setChapters(chaptersRes.data);
      setLoading(false);
    }
    load();
  }, [novelId]);

  async function handleExport(format: "pdf" | "epub" | "docx") {
    if (!novel || exporting) return;
    setExporting(true);
    const result = await exportService.exportNovel(novel.id, format);
    setExporting(false);

    if (!result.success || !result.data) {
      toast.error(result.error || "Gagal export novel");
      return;
    }

    const link = document.createElement("a");
    link.href = result.data.download_url;
    link.download = `${novel.title}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Novel berhasil di-export sebagai ${format.toUpperCase()}`);
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
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-4">
          <button
            onClick={() => router.push(`/novels/${novelId}`)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Editor
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50">
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("epub")}>
                EPUB
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("docx")}>
                DOCX
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Book Preview */}
      <main className="mx-auto max-w-[680px] px-8 py-12">
        {/* Cover */}
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="mb-6 flex h-64 w-48 items-center justify-center rounded-lg bg-gray-200 shadow-md">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={novel.title}
                className="h-full w-full rounded-lg object-cover"
              />
            ) : (
              <BookOpen className="h-16 w-16 text-gray-400" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{novel.title}</h1>
          {novel.genre && (
            <p className="mt-2 text-sm text-gray-500">{novel.genre}</p>
          )}
        </div>

        {/* Synopsis */}
        {novel.synopsis && (
          <div className="mb-12 border-b border-gray-200 pb-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Sinopsis
            </h2>
            <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
              {novel.synopsis}
            </p>
          </div>
        )}

        {/* Table of Contents */}
        <div className="mb-12 border-b border-gray-200 pb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Daftar Isi
          </h2>
          <ol className="space-y-2">
            {chapters.map((ch, i) => (
              <li key={ch.id} className="text-sm text-gray-600">
                <span className="font-medium">
                  {i + 1}. {ch.title || "(tanpa judul)"}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Chapters */}
        {chapters.map((ch, i) => (
          <article key={ch.id} className="mb-16">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              {ch.title || `Bab ${i + 1}`}
            </h2>
            <div
              className="whitespace-pre-wrap font-serif text-[17px] leading-[1.8] text-gray-800"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {ch.content || "(Bab ini belum memiliki isi)"}
            </div>
          </article>
        ))}

        {/* Blurb */}
        {novel.blurb && (
          <div className="mt-16 border-t border-gray-200 pt-8">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Blurb
            </h2>
            <p className="italic leading-relaxed text-gray-600">
              {novel.blurb}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
