"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GENRES = [
  "Fiksi",
  "Fantasi",
  "Sci-Fi",
  "Romance",
  "Thriller",
  "Horor",
  "Misteri",
  "Drama",
  "Petualangan",
  "Sastra",
  "Lainnya",
];

interface StepBasicsProps {
  title: string;
  genre: string;
  premise: string;
  synopsis: string;
  onChange: (data: {
    title: string;
    genre: string;
    premise: string;
    synopsis: string;
  }) => void;
  onValidationChange: (valid: boolean) => void;
}

export function StepBasics({
  title,
  genre,
  premise,
  synopsis,
  onChange,
  onValidationChange,
}: StepBasicsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  function validate(data: {
    title: string;
    genre: string;
    premise: string;
    synopsis: string;
  }) {
    const newErrors: Record<string, string> = {};

    if (!data.title.trim()) newErrors.title = "Judul wajib diisi";
    else if (data.title.length > 100) newErrors.title = "Judul maksimal 100 karakter";

    if (!data.genre) newErrors.genre = "Genre wajib dipilih";

    if (!data.premise.trim()) newErrors.premise = "Premis wajib diisi";
    else if (data.premise.length > 300) newErrors.premise = "Premis maksimal 300 karakter";

    if (!data.synopsis.trim()) newErrors.synopsis = "Sinopsis wajib diisi";
    else if (data.synopsis.length > 2000) newErrors.synopsis = "Sinopsis maksimal 2000 karakter";

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    onValidationChange(isValid);
    return isValid;
  }

  function handleChange(field: string, value: string) {
    const newData = { title, genre, premise, synopsis, [field]: value };
    onChange(newData);
    if (touched[field]) {
      validate(newData);
    }
  }

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate({ title, genre, premise, synopsis });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Dasar Novel</h2>
        <p className="mt-1 text-sm text-gray-500">
          Isi informasi dasar tentang novel Anda
        </p>
      </div>

      <div className="space-y-5">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Judul Novel</Label>
          <Input
            id="title"
            placeholder="Judul novel Anda"
            value={title}
            onChange={(e) => handleChange("title", e.target.value)}
            onBlur={() => handleBlur("title")}
            maxLength={100}
          />
          {errors.title && touched.title && (
            <p className="text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Genre */}
        <div className="space-y-2">
          <Label>Genre</Label>
          <Select
            value={genre}
            onValueChange={(value) => {
              if (value) handleChange("genre", value);
              setTouched((prev) => ({ ...prev, genre: true }));
            }}
          >
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
          {errors.genre && touched.genre && (
            <p className="text-sm text-red-600">{errors.genre}</p>
          )}
        </div>

        {/* Premise */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="premise">Premis</Label>
            <span
              className={`text-xs ${
                premise.length > 280 ? "text-red-500" : "text-gray-400"
              }`}
            >
              {premise.length}/300
            </span>
          </div>
          <Textarea
            id="premise"
            placeholder="Ceritakan premis novel Anda dalam 1-2 kalimat"
            value={premise}
            onChange={(e) => handleChange("premise", e.target.value)}
            onBlur={() => handleBlur("premise")}
            rows={3}
            maxLength={300}
          />
          <p className="text-xs text-gray-400">
            Premis adalah ide inti cerita Anda dalam satu atau dua kalimat
          </p>
          {errors.premise && touched.premise && (
            <p className="text-sm text-red-600">{errors.premise}</p>
          )}
        </div>

        {/* Synopsis */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="synopsis">Sinopsis</Label>
            <span
              className={`text-xs ${
                synopsis.length > 1800 ? "text-red-500" : "text-gray-400"
              }`}
            >
              {synopsis.length}/2000
            </span>
          </div>
          <Textarea
            id="synopsis"
            placeholder="Ceritakan keseluruhan cerita novel Anda..."
            value={synopsis}
            onChange={(e) => handleChange("synopsis", e.target.value)}
            onBlur={() => handleBlur("synopsis")}
            rows={6}
            maxLength={2000}
          />
          <p className="text-xs text-gray-400">
            Semakin detail sinopsis, semakin terstruktur novel Anda
          </p>
          {errors.synopsis && touched.synopsis && (
            <p className="text-sm text-red-600">{errors.synopsis}</p>
          )}
        </div>
      </div>
    </div>
  );
}
