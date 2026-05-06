-- ============================================================================
-- Novyl AI — Database Schema
-- PostgreSQL 16+
-- BCNF normalized, scalable, production-ready
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- Cryptographic functions (bcrypt)

-- ----------------------------------------------------------------------------
-- Custom Types (ENUMs)
-- ----------------------------------------------------------------------------

-- Status umum novel: draft saat baru dibuat, in_progress saat mulai menulis,
-- completed saat semua bab selesai, archived saat user arsipkan
CREATE TYPE novel_status AS ENUM ('draft', 'in_progress', 'completed', 'archived');

-- Status per bab: draft default, in_progress saat mulai menulis,
-- completed saat user tandai selesai, failed jika AI generation gagal (future)
CREATE TYPE chapter_status AS ENUM ('draft', 'in_progress', 'completed', 'failed');

-- Status generation AI per bab (untuk fitur AI di masa depan):
-- waiting = antri, generating = sedang ditulis AI, completed = selesai,
-- failed = gagal, skipped = user skip bab ini
CREATE TYPE generation_status AS ENUM ('waiting', 'generating', 'completed', 'failed', 'skipped');

-- Tipe file yang tersimpan di MinIO
CREATE TYPE file_type AS ENUM ('profile_photo', 'cover', 'character_image', 'setting_image', 'export_pdf', 'export_epub', 'export_docx');

-- ----------------------------------------------------------------------------
-- Utility: auto-update updated_at trigger
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Table: users
-- Menyimpan data autentikasi dan profil user.
-- Password di-hash pakai bcrypt sebelum insert (di level aplikasi).
-- avatar_path menyimpan object key di MinIO, bukan URL langsung.
-- ----------------------------------------------------------------------------

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    avatar_path     VARCHAR(500),                           -- MinIO object key, nullable
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE users is 'Data autentikasi dan profil user';
COMMENT ON COLUMN users.password_hash is 'Password di-hash pakai bcrypt, bukan plaintext';
COMMENT ON COLUMN users.avatar_path is 'MinIO object key untuk foto profil, format: {user_id}/avatar.{ext}';

-- ----------------------------------------------------------------------------
-- Table: password_resets
-- Menyimpan token untuk fitur lupa password.
-- Token expired setelah 1 jam (di-enforce di aplikasi).
-- Sudah dipakai (used=true) tidak bisa dipakai lagi.
-- ----------------------------------------------------------------------------

CREATE TABLE password_resets (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(255)    NOT NULL UNIQUE,
    used        BOOLEAN         NOT NULL DEFAULT FALSE,
    expires_at  TIMESTAMPTZ     NOT NULL,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_resets_token ON password_resets (token);
CREATE INDEX idx_password_resets_user  ON password_resets (user_id);

COMMENT ON TABLE password_resets is 'Token reset password, expired 1 jam setelah dibuat';

-- ----------------------------------------------------------------------------
-- Table: refresh_tokens
-- Menyimpan refresh token untuk JWT dual token auth.
-- Access token tidak disimpan di DB (stateless, short-lived).
-- Refresh token bisa di-revoke (logout, ganti password).
-- ----------------------------------------------------------------------------

CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(500)    NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ     NOT NULL,
    revoked     BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_token  ON refresh_tokens (token);
CREATE INDEX idx_refresh_tokens_user   ON refresh_tokens (user_id);

COMMENT ON TABLE refresh_tokens is 'Refresh token JWT, bisa di-revoke untuk logout';

-- ----------------------------------------------------------------------------
-- Table: novels
-- Project novel milik user. Menyimpan metadata dasar novel.
-- Status di-update otomatis: draft → in_progress (saat mulai menulis)
-- → completed (saat semua bab selesai).
-- blurb di-generate oleh AI setelah semua bab selesai (future) atau manual.
-- ----------------------------------------------------------------------------

CREATE TABLE novels (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(200)    NOT NULL,
    premise         VARCHAR(500),                           -- Premis inti cerita (1-2 kalimat)
    genre           VARCHAR(50),                            -- Genre novel (Fiksi, Fantasi, Romance, dll)
    synopsis        TEXT,                                   -- Sinopsis lengkap
    cover_path      VARCHAR(500),                           -- MinIO object key untuk cover novel
    blurb           TEXT,                                   -- Blurb/sinopsis pendek untuk marketing
    word_count_target INTEGER,                              -- Target jumlah kata per bab (range, AI-generated)
    status          novel_status    NOT NULL DEFAULT 'draft',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_novels_user   ON novels (user_id);
CREATE INDEX idx_novels_status ON novels (status);

CREATE TRIGGER trg_novels_updated_at
    BEFORE UPDATE ON novels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE novels is 'Project novel milik user, root entity untuk semua data novel';
COMMENT ON COLUMN novels.premise is 'Ide inti cerita dalam 1-2 kalimat';
COMMENT ON COLUMN novels.cover_path is 'MinIO object key untuk cover, format: {user_id}/{novel_id}/cover.{ext}';
COMMENT ON COLUMN novels.blurb is 'Blurb untuk marketing/promosi, di-generate AI atau manual';
COMMENT ON COLUMN novels.word_count_target is 'Target word count per bab, bisa AI-generated berdasarkan input';

-- ----------------------------------------------------------------------------
-- Table: chapters
-- Bab-bab dalam novel. Urutan ditentukan oleh `order_index`.
-- content menyimpan isi bab (rich text dari Tiptap, disimpan sebagai JSONB).
-- word_count di-track untuk statistik dan progress.
-- outline adalah panduan penulisan (bisa dari wizard atau user).
-- generation_status untuk tracking AI generation (future feature).
-- ----------------------------------------------------------------------------

CREATE TABLE chapters (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    novel_id            UUID                NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    title               VARCHAR(200)        NOT NULL,
    outline             TEXT,                                   -- Panduan/outline isi bab
    content             TEXT,                                   -- Isi bab (plain text atau Tiptap JSON)
    word_count          INTEGER             NOT NULL DEFAULT 0, -- Auto-count dari content
    order_index         INTEGER             NOT NULL,           -- Urutan bab (0-based)
    status              chapter_status      NOT NULL DEFAULT 'draft',
    generation_status   generation_status   NOT NULL DEFAULT 'waiting',  -- Status AI generation
    created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_chapters_novel_order UNIQUE (novel_id, order_index)
);

CREATE INDEX idx_chapters_novel  ON chapters (novel_id);
CREATE INDEX idx_chapters_status ON chapters (status);

CREATE TRIGGER trg_chapters_updated_at
    BEFORE UPDATE ON chapters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE chapters is 'Bab-bab novel, urutan ditentukan order_index';
COMMENT ON COLUMN chapters.content is 'Isi bab: plain text atau Tiptap JSON (rich text)';
COMMENT ON COLUMN chapters.word_count is 'Jumlah kata, auto-update saat content berubah';
COMMENT ON COLUMN chapters.order_index is 'Urutan bab (0-based), unik per novel';
COMMENT ON COLUMN chapters.generation_status is 'Tracking status AI generation per bab';

-- ----------------------------------------------------------------------------
-- Table: characters
-- Karakter dalam novel. Deskripsi bisa diisi manual atau AI-generated.
-- image_path menyimpan object key di MinIO untuk gambar karakter.
-- ----------------------------------------------------------------------------

CREATE TABLE characters (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    novel_id        UUID            NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    name            VARCHAR(100)    NOT NULL,
    description     TEXT,                                   -- Deskripsi lengkap: looks, personality, background
    image_path      VARCHAR(500),                           -- MinIO object key gambar karakter
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_characters_novel ON characters (novel_id);

CREATE TRIGGER trg_characters_updated_at
    BEFORE UPDATE ON characters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE characters is 'Karakter dalam novel, deskripsi bisa manual atau AI-generated';
COMMENT ON COLUMN characters.description is 'Deskripsi lengkap: penampilan, kepribadian, latar belakang';
COMMENT ON COLUMN characters.image_path is 'MinIO object key gambar karakter, format: {user_id}/{novel_id}/characters/{char_id}.{ext}';

-- ----------------------------------------------------------------------------
-- Table: settings
-- Latar/setting dalam novel. Lokasi, dunia, tempat-tempat penting.
-- Deskripsi bisa diisi manual atau AI-generated.
-- ----------------------------------------------------------------------------

CREATE TABLE settings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    novel_id        UUID            NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    name            VARCHAR(100)    NOT NULL,
    description     TEXT,                                   -- Deskripsi visual, atmosphere, detail lokasi
    image_path      VARCHAR(500),                           -- MinIO object key gambar latar
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_settings_novel ON settings (novel_id);

CREATE TRIGGER trg_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE settings is 'Latar/setting cerita: lokasi, dunia, tempat penting';
COMMENT ON COLUMN settings.image_path is 'MinIO object key gambar latar, format: {user_id}/{novel_id}/settings/{setting_id}.{ext}';

-- ----------------------------------------------------------------------------
-- Table: chapter_notes
-- Catatan bebas per bab, untuk referensi penulis.
-- Contoh: "Ingat: karakter A belum tahu rahasia di bab ini"
-- Auto-save dari frontend dengan debounce.
-- ----------------------------------------------------------------------------

CREATE TABLE chapter_notes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id  UUID            NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    content     TEXT            NOT NULL DEFAULT '',          -- Isi catatan bebas
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_chapter_notes_chapter UNIQUE (chapter_id)  -- 1 catatan per bab
);

CREATE TRIGGER trg_chapter_notes_updated_at
    BEFORE UPDATE ON chapter_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE chapter_notes is 'Catatan bebas per bab, 1:1 dengan chapter';

-- ----------------------------------------------------------------------------
-- Table: file_assets
-- Central registry untuk semua file yang tersimpan di MinIO.
-- Menggantikan kolom *_path di tabel lain sebagai source of truth.
-- Tapi kolom *_path di tabel utama tetap dipertahankan untuk backward compat
-- dan query cepat tanpa join.
-- Strategi: aplikasi tulis ke kedua tempat (denormalized untuk performa).
-- ----------------------------------------------------------------------------

CREATE TABLE file_assets (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    novel_id    UUID            REFERENCES novels(id) ON DELETE CASCADE,  -- NULL untuk file user (avatar)
    entity_type VARCHAR(50)     NOT NULL,                   -- 'user', 'novel', 'character', 'setting', 'export'
    entity_id   UUID,                                       -- ID entity terkait (user_id, novel_id, dll)
    file_type   file_type       NOT NULL,
    object_key  VARCHAR(500)    NOT NULL UNIQUE,             -- MinIO object key (full path)
    file_name   VARCHAR(255)    NOT NULL,                    -- Original file name
    file_size   BIGINT,                                     -- File size in bytes
    mime_type   VARCHAR(100),                                -- MIME type (image/jpeg, application/pdf, dll)
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_file_assets_user    ON file_assets (user_id);
CREATE INDEX idx_file_assets_novel   ON file_assets (novel_id);
CREATE INDEX idx_file_assets_entity  ON file_assets (entity_type, entity_id);

COMMENT ON TABLE file_assets is 'Central registry semua file di MinIO, source of truth untuk file management';
COMMENT ON COLUMN file_assets.object_key is 'Full MinIO object key, contoh: {user_id}/{novel_id}/characters/{id}.jpg';
COMMENT ON COLUMN file_assets.entity_type is 'Tipe entity pemilik: user, novel, character, setting, export';

-- ----------------------------------------------------------------------------
-- Table: novel_exports
-- Log export novel ke PDF/EPUB/DOCX. File hasil disimpan di MinIO.
-- Menyimpan metadata export untuk riwayat download user.
-- ----------------------------------------------------------------------------

CREATE TABLE novel_exports (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    novel_id    UUID            NOT NULL REFERENCES novels(id) ON DELETE CASCADE,
    user_id     UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    format      VARCHAR(10)     NOT NULL,                   -- 'pdf', 'epub', 'docx'
    file_path   VARCHAR(500)    NOT NULL,                   -- MinIO object key
    file_size   BIGINT,                                     -- File size in bytes
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_novel_exports_novel ON novel_exports (novel_id);
CREATE INDEX idx_novel_exports_user  ON novel_exports (user_id);

COMMENT ON TABLE novel_exports is 'Riwayat export novel, file hasil di MinIO';

-- ----------------------------------------------------------------------------
-- Seed Data: Genre options
-- Genre yang tersedia di dropdown wizard.
-- Bisa di-expand tanpa migrate (hanya insert).
-- ----------------------------------------------------------------------------

CREATE TABLE genres (
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(50) NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL DEFAULT 0
);

INSERT INTO genres (name, sort_order) VALUES
    ('Fiksi', 1),
    ('Fantasi', 2),
    ('Sci-Fi', 3),
    ('Romance', 4),
    ('Thriller', 5),
    ('Horor', 6),
    ('Misteri', 7),
    ('Drama', 8),
    ('Petualangan', 9),
    ('Sastra', 10),
    ('Lainnya', 11);

COMMENT ON TABLE genres is 'Daftar genre yang tersedia, bisa di-expand tanpa migrate';

-- ----------------------------------------------------------------------------
-- Summary
-- ----------------------------------------------------------------------------
--
-- Tables: 11
--   users              — autentikasi & profil
--   password_resets    — token lupa password
--   refresh_tokens     — JWT refresh token management
--   novels             — project novel (root entity)
--   chapters           — bab-bab novel
--   characters         — karakter novel
--   settings           — latar/setting novel
--   chapter_notes      — catatan per bab
--   file_assets        — central file registry (MinIO)
--   novel_exports      — riwayat export
--   genres             — seed data genre
--
-- ENUMs: 4
--   novel_status       — draft, in_progress, completed, archived
--   chapter_status     — draft, in_progress, completed, failed
--   generation_status  — waiting, generating, completed, failed, skipped
--   file_type          — profile_photo, cover, character_image, setting_image, export_*
--
-- Indexes: 15 (termasuk UNIQUE constraints)
-- Triggers: 7 (auto-update updated_at)
--
-- Relationship hierarchy:
--   users (1) ──→ (N) novels
--   novels (1) ──→ (N) chapters
--   novels (1) ──→ (N) characters
--   novels (1) ──→ (N) settings
--   novels (1) ──→ (N) novel_exports
--   chapters (1) ──→ (1) chapter_notes
--   users (1) ──→ (N) password_resets
--   users (1) ──→ (N) refresh_tokens
--   users (1) ──→ (N) file_assets
--   novels (1) ──→ (N) file_assets
--
-- Denormalized fields (intentional for query performance):
--   chapters.word_count — bisa dihitung dari content, tapi disimpan untuk avoid recount
--   novels.cover_path, characters.image_path, settings.image_path — duplicate dari file_assets
--   untuk query cepat tanpa join. Sinkronisasi di level aplikasi.
-- ============================================================================
