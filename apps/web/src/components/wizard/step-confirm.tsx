"use client";

import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WizardCharacter, WizardSetting, WizardChapter } from "@/stores/wizard-store";

interface StepConfirmProps {
  title: string;
  genre: string;
  premise: string;
  synopsis: string;
  characters: WizardCharacter[];
  settings: WizardSetting[];
  chapters: WizardChapter[];
  onGoToStep: (step: number) => void;
}

export function StepConfirm({
  title,
  genre,
  premise,
  synopsis,
  characters,
  settings,
  chapters,
  onGoToStep,
}: StepConfirmProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Konfirmasi</h2>
        <p className="mt-1 text-sm text-gray-500">
          Periksa kembali semua input sebelum membuat novel
        </p>
      </div>

      {/* Dasar Novel */}
      <div className="rounded-lg border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Dasar Novel</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onGoToStep(1)}
            className="h-8 gap-1 text-xs"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
        </div>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="font-medium text-gray-500">Judul</dt>
            <dd className="text-gray-900">{title}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Genre</dt>
            <dd>
              <Badge
                variant="secondary"
                className="bg-indigo-50 text-xs text-indigo-700"
              >
                {genre}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Premis</dt>
            <dd className="text-gray-900">{premise}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Sinopsis</dt>
            <dd className="whitespace-pre-wrap text-gray-900">{synopsis}</dd>
          </div>
        </dl>
      </div>

      {/* Karakter */}
      <div className="rounded-lg border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            Karakter ({characters.length})
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onGoToStep(2)}
            className="h-8 gap-1 text-xs"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
        </div>
        {characters.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada karakter</p>
        ) : (
          <ul className="space-y-2">
            {characters.map((char) => (
              <li key={char.id} className="text-sm">
                <span className="font-medium text-gray-900">{char.name}</span>
                <span className="text-gray-500">
                  {" "}
                  — {char.description.slice(0, 80)}
                  {char.description.length > 80 ? "..." : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Latar */}
      <div className="rounded-lg border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            Latar ({settings.length})
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onGoToStep(3)}
            className="h-8 gap-1 text-xs"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
        </div>
        {settings.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada latar</p>
        ) : (
          <ul className="space-y-2">
            {settings.map((setting) => (
              <li key={setting.id} className="text-sm">
                <span className="font-medium text-gray-900">
                  {setting.name}
                </span>
                <span className="text-gray-500">
                  {" "}
                  — {setting.description.slice(0, 80)}
                  {setting.description.length > 80 ? "..." : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Struktur Bab */}
      <div className="rounded-lg border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            Struktur Bab ({chapters.length})
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onGoToStep(4)}
            className="h-8 gap-1 text-xs"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
        </div>
        {chapters.length === 0 ? (
          <p className="text-sm text-gray-400">Belum ada bab</p>
        ) : (
          <ul className="space-y-2">
            {chapters.map((ch, i) => (
              <li key={ch.id} className="text-sm">
                <span className="font-medium text-gray-900">
                  Bab {i + 1}: {ch.title || "(tanpa judul)"}
                </span>
                {ch.outline && (
                  <span className="text-gray-500">
                    {" "}
                    — {ch.outline.slice(0, 60)}
                    {ch.outline.length > 60 ? "..." : ""}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
