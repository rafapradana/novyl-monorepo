"use client";

import { useEffect, useState, useCallback } from "react";
import { User, MapPin, FileText, StickyNote } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Character, Setting, Chapter } from "@/types/novel";
import { noteService } from "@/services/note.service";
import { useNoteSave } from "@/hooks/use-note-save";

interface ReferencePanelProps {
  activeChapter: Chapter | null;
  characters: Character[];
  settings: Setting[];
}

function OutlineTab({ chapter }: { chapter: Chapter | null }) {
  if (!chapter) {
    return (
      <div className="p-4 text-center text-sm text-gray-400">
        Pilih bab untuk melihat outline
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4">
      <p className="text-xs text-gray-400">
        Outline ini sebagai panduan saat menulis
      </p>
      {chapter.outline ? (
        <p className="whitespace-pre-wrap text-sm text-gray-700">
          {chapter.outline}
        </p>
      ) : (
        <p className="text-sm italic text-gray-400">
          Bab ini belum memiliki outline
        </p>
      )}
    </div>
  );
}

function CharactersTab({
  characters,
}: {
  characters: Character[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (characters.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-400">
        Belum ada karakter
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      {characters.map((char) => (
        <div
          key={char.id}
          className="cursor-pointer rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
          onClick={() =>
            setExpandedId(expandedId === char.id ? null : char.id)
          }
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100">
              <User className="h-3.5 w-3.5 text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">
              {char.name}
            </span>
          </div>
          {expandedId === char.id && char.description && (
            <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-gray-600">
              {char.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function SettingsTab({
  settings,
}: {
  settings: Setting[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (settings.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-400">
        Belum ada latar
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      {settings.map((setting) => (
        <div
          key={setting.id}
          className="cursor-pointer rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50"
          onClick={() =>
            setExpandedId(expandedId === setting.id ? null : setting.id)
          }
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-10 shrink-0 items-center justify-center rounded bg-gray-100">
              <MapPin className="h-3.5 w-3.5 text-gray-500" />
            </div>
            <span className="text-sm font-medium text-gray-900">
              {setting.name}
            </span>
          </div>
          {expandedId === setting.id && setting.description && (
            <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-gray-600">
              {setting.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function NotesTab({ chapterId }: { chapterId: string | null }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { debouncedSave, saving } = useNoteSave(2000);

  // Load note when chapter changes
  useEffect(() => {
    if (!chapterId) {
      setContent("");
      return;
    }

    setLoading(true);
    noteService.get(chapterId).then((res) => {
      if (res.success && res.data) {
        setContent(res.data.content || "");
      }
      setLoading(false);
    });
  }, [chapterId]);

  const handleChange = useCallback(
    (value: string) => {
      setContent(value);
      if (chapterId) {
        debouncedSave(chapterId, value);
      }
    },
    [chapterId, debouncedSave]
  );

  if (!chapterId) {
    return (
      <div className="p-4 text-center text-sm text-gray-400">
        Pilih bab untuk melihat catatan
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs text-gray-400">Catatan bab ini</p>
        {saving && (
          <span className="text-[10px] text-gray-400">Menyimpan...</span>
        )}
      </div>
      <Textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Tulis catatan untuk bab ini..."
        rows={10}
        className="min-h-[200px] resize-none text-sm"
        disabled={loading}
      />
    </div>
  );
}

export function ReferencePanel({
  activeChapter,
  characters,
  settings,
}: ReferencePanelProps) {
  return (
    <aside className="flex h-full w-[280px] flex-col border-l border-gray-200 bg-white">
      <Tabs defaultValue="outline" className="flex h-full flex-col">
        <TabsList className="mx-3 mt-2 grid w-auto grid-cols-4">
          <TabsTrigger value="outline" className="text-[10px]">
            <FileText className="mr-1 h-3 w-3" />
            Outline
          </TabsTrigger>
          <TabsTrigger value="characters" className="text-[10px]">
            <User className="mr-1 h-3 w-3" />
            Karakter
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-[10px]">
            <MapPin className="mr-1 h-3 w-3" />
            Latar
          </TabsTrigger>
          <TabsTrigger value="notes" className="text-[10px]">
            <StickyNote className="mr-1 h-3 w-3" />
            Catatan
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <TabsContent value="outline" className="mt-0">
            <OutlineTab chapter={activeChapter} />
          </TabsContent>
          <TabsContent value="characters" className="mt-0">
            <CharactersTab characters={characters} />
          </TabsContent>
          <TabsContent value="settings" className="mt-0">
            <SettingsTab settings={settings} />
          </TabsContent>
          <TabsContent value="notes" className="mt-0">
            <NotesTab chapterId={activeChapter?.id || null} />
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  );
}
