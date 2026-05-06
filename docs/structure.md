Novyl AI - Project Structure Guide

overview:
- monorepo: semua code (frontend, backend, shared) dalam satu repository
- tooling: pnpm workspaces untuk Node.js apps, go modules untuk backend
- single .env di root untuk semua environment variables
- single .gitignore di root untuk seluruh project
- scalable: mudah tambah app baru (landing, admin, mobile) tanpa refactor

---

techstack per app:

  apps/web        — Next.js (web app novel editor, MVP)
  apps/landing    — Next.js (landing page, future)
  apps/admin      — Next.js (admin dashboard, future)
  apps/mobile     — Flutter (mobile app, future)
  api             — Golang Fiber + GORM (backend API)
  packages/ui     — shared React components (shadcn/ui based)
  packages/utils  — shared utilities (validation, formatting, types)
  docker          — Docker Compose configs

  additional libraries:
    - Tiptap: rich text editor (headless, extensible)
    - Zustand: client state management
    - Framer Motion: animations
    - Lucide React: icons
    - @dnd-kit: drag and drop
    - Zod: schema validation

---

directory tree:

  novyl/
  ├── .env                          # actual env (not committed)
  ├── .env.example                  # template env (committed, tanpa nilai sensitif)
  ├── .gitignore                    # single root gitignore
  ├── Makefile                      # make dev, make prod, make stop, dll
  ├── package.json                  # root: pnpm workspaces config
  ├── pnpm-workspace.yaml           # workspace definition
  ├── turbo.json                    # turborepo pipeline config
  │
  ├── apps/
  │   ├── web/                      # Next.js — web app (MVP)
  │   │   ├── package.json
  │   │   ├── next.config.ts
  │   │   ├── tailwind.config.ts
  │   │   ├── tsconfig.json
  │   │   ├── public/
  │   │   └── src/
  │   │       ├── app/              # App Router
  │   │       ├── components/       # app-specific components
  │   │       ├── hooks/            # app-specific hooks
  │   │       ├── lib/              # app-specific utilities
  │   │       ├── stores/           # zustand stores
  │   │       ├── services/         # API service functions
  │   │       └── types/            # app-specific types
  │   │
  │   ├── landing/                  # Next.js — landing page (future)
  │   │   ├── package.json
  │   │   ├── next.config.ts
  │   │   ├── tailwind.config.ts
  │   │   ├── tsconfig.json
  │   │   ├── public/
  │   │   └── src/
  │   │       └── app/
  │   │
  │   └── admin/                    # Next.js — admin dashboard (future)
  │       ├── package.json
  │       ├── next.config.ts
  │       ├── tailwind.config.ts
  │       ├── tsconfig.json
  │       ├── public/
  │       └── src/
  │           └── app/
  │
  ├── api/                          # Golang backend
  │   ├── go.mod
  │   ├── go.sum
  │   ├── .air.toml                 # Air hot reload config
  │   ├── main.go
  │   ├── cmd/
  │   │   └── server/
  │   │       └── main.go           # entry point
  │   ├── internal/
  │   │   ├── config/               # env config loader
  │   │   ├── database/             # GORM setup, migrations
  │   │   ├── handlers/             # HTTP handlers (controllers)
  │   │   ├── middleware/            # auth, cors, logging
  │   │   ├── models/               # GORM models (entities)
  │   │   ├── repositories/         # data access layer
  │   │   ├── services/             # business logic layer
  │   │   ├── routes/               # route definitions
  │   │   └── utils/                # helpers (jwt, minio, response)
  │   └── migrations/               # SQL migrations (optional)
  │
  ├── packages/
  │   ├── ui/                       # shared React components
  │   │   ├── package.json
  │   │   ├── tsconfig.json
  │   │   ├── src/
  │   │   │   ├── button.tsx
  │   │   │   ├── input.tsx
  │   │   │   ├── card.tsx
  │   │   │   ├── dialog.tsx
  │   │   │   ├── toast.tsx
  │   │   │   ├── badge.tsx
  │   │   │   ├── skeleton.tsx
  │   │   │   ├── tooltip.tsx
  │   │   │   └── index.ts
  │   │   └── styles/
  │   │
  │   └── utils/                    # shared utilities
  │       ├── package.json
  │       ├── tsconfig.json
  │       └── src/
  │           ├── validation.ts     # zod schemas
  │           ├── formatting.ts     # date, number, text
  │           ├── constants.ts      # genres, statuses
  │           ├── types.ts          # shared TypeScript types
  │           └── index.ts
  │
  ├── docker/
  │   ├── docker-compose.yml        # infra only (postgres, minio)
  │   ├── docker-compose.prod.yml   # full production (all services)
  │   ├── Dockerfile.web            # Next.js web app (prod)
  │   ├── Dockerfile.api            # Go API (prod)
  │   └── Dockerfile.landing        # landing page (future)
  │
  ├── docs/                         # project documentation
  │   ├── brief.md
  │   ├── mvp.md
  │   ├── ui-flow.md
  │   └── structure.md
  │
  └── .agents/                      # AI agent skills

---

env management:

  single .env di root:
    - satu file .env untuk semua environment variables
    - TIDAK di-commit (ada di .gitignore)
    - .env.example di-commit sebagai template (tanpa nilai sensitif, pakai placeholder)
    - developer copy .env.example → .env lalu isi nilai asli

  .env.example (template, di-commit):

    # — database —
    POSTGRES_HOST=postgres
    POSTGRES_PORT=5432
    POSTGRES_USER=novyl
    POSTGRES_PASSWORD=changeme
    POSTGRES_DB=novyl

    # — minio storage —
    MINIO_ENDPOINT=minio:9000
    MINIO_ACCESS_KEY=minioadmin
    MINIO_SECRET_KEY=minioadmin
    MINIO_BUCKET=novyl
    MINIO_USE_SSL=false

    # — jwt auth —
    JWT_SECRET=changeme
    JWT_ACCESS_EXPIRY=15m
    JWT_REFRESH_EXPIRY=7d

    # — go api —
    API_PORT=8080
    API_HOST=0.0.0.0

    # — next.js web app —
    NEXT_PUBLIC_API_URL=http://localhost:8080/v1   # dev: localhost. prod: override jadi http://api:8080/v1
    NEXT_PUBLIC_APP_URL=http://localhost:3000

  cara Next.js baca .env dari root:
    - next.config.ts: set envDir ke root monorepo (../)
    - Next.js otomatis baca .env dari directory yang ditentukan

  cara Go baca .env dari root:
    - Docker: pass env_file: ../.env ke container
    - local dev: godotenv.Load("../.env") di main.go

---

gitignore strategy:

  single .gitignore di root, cover semua apps:

    # — dependencies —
    node_modules/
    .pnpm-store/

    # — next.js —
    .next/
    out/
    .vercel/

    # — go —
    api/tmp/                          # Air build output
    api/bin/
    *.exe

    # — flutter —
    apps/mobile/.dart_tool/
    apps/mobile/build/
    apps/mobile/.packages
    apps/mobile/pubspec.lock

    # — env —
    .env
    .env.local
    .env.*.local

    # — ide —
    .vscode/
    .idea/
    *.swp
    *.swo

    # — os —
    .DS_Store
    Thumbs.db

    # — docker —
    docker/volumes/

    # — turbo —
    .turbo/

    # — logs —
    *.log

---

pnpm workspace config:

  pnpm-workspace.yaml:
    packages:
      - "apps/*"
      - "packages/*"

  root package.json:
    {
      "name": "novyl",
      "private": true,
      "scripts": {
        "dev": "turbo dev",
        "build": "turbo build",
        "lint": "turbo lint",
        "typecheck": "turbo typecheck"
      },
      "devDependencies": {
        "turbo": "latest",
        "typescript": "latest"
      }
    }

  dependency management:
    - setiap app punya package.json sendiri
    - shared deps (react, next, tailwind) di-set di root atau per-app
    - @novyl/ui dan @novyl/utils di-refer via workspace:*
    - contoh di apps/web/package.json:
      "dependencies": {
        "@novyl/ui": "workspace:*",
        "@novyl/utils": "workspace:*",
        "next": "latest",
        "react": "latest"
      }

---

turbo.json config:

  {
    "$schema": "https://turbo.build/schema.json",
    "globalDependencies": [".env"],
    "globalEnv": [
      "POSTGRES_HOST", "POSTGRES_PORT", "POSTGRES_USER",
      "POSTGRES_PASSWORD", "POSTGRES_DB",
      "MINIO_ENDPOINT", "MINIO_ACCESS_KEY", "MINIO_SECRET_KEY",
      "JWT_SECRET",
      "NEXT_PUBLIC_API_URL", "NEXT_PUBLIC_APP_URL"
    ],
    "pipeline": {
      "build": {
        "dependsOn": ["^build"],
        "outputs": [".next/**", "!.next/cache/**", "out/**"]
      },
      "dev": {
        "cache": false,
        "persistent": true
      },
      "lint": {},
      "typecheck": {}
    }
  }

---

Next.js app structure (apps/web/src):

  src/
  ├── app/                          # App Router (Next.js 14+)
  │   ├── layout.tsx                # root layout (providers, fonts, toast)
  │   ├── page.tsx                  # redirect ke /dashboard atau /login
  │   ├── (auth)/                   # route group: tanpa layout sidebar
  │   │   ├── login/
  │   │   │   └── page.tsx
  │   │   └── register/
  │   │       └── page.tsx
  │   ├── (app)/                    # route group: dengan layout dashboard
  │   │   ├── layout.tsx            # topbar + sidebar
  │   │   ├── dashboard/
  │   │   │   └── page.tsx
  │   │   ├── novels/
  │   │   │   ├── new/
  │   │   │   │   └── page.tsx      # wizard
  │   │   │   └── [id]/
  │   │   │       ├── page.tsx      # editor
  │   │   │       ├── settings/
  │   │   │       │   └── page.tsx
  │   │   │       ├── preview/
  │   │   │       │   └── page.tsx
  │   │   │       └── export/
  │   │   │           └── page.tsx
  │   │   └── profile/
  │   │       └── page.tsx
  │   └── api/                      # API routes (jika perlu BFF)
  │       └── ...
  │
  ├── components/
  │   ├── layout/                   # layout components
  │   │   ├── topbar.tsx
  │   │   ├── sidebar.tsx
  │   │   └── auth-layout.tsx
  │   ├── editor/                   # editor components
  │   │   ├── novel-editor.tsx      # main editor wrapper
  │   │   ├── editor-toolbar.tsx
  │   │   ├── chapter-sidebar.tsx
  │   │   ├── reference-panel.tsx
  │   │   └── word-count.tsx
  │   ├── wizard/                   # wizard components
  │   │   ├── wizard-layout.tsx
  │   │   ├── step-indicator.tsx
  │   │   ├── step-basics.tsx
  │   │   ├── step-characters.tsx
  │   │   ├── step-settings.tsx
  │   │   ├── step-chapters.tsx
  │   │   └── step-confirm.tsx
  │   ├── novel/                    # novel-related components
  │   │   ├── novel-card.tsx
  │   │   ├── novel-form.tsx
  │   │   ├── character-card.tsx
  │   │   ├── character-form.tsx
  │   │   ├── setting-card.tsx
  │   │   └── setting-form.tsx
  │   ├── profile/                  # profile components
  │   │   ├── profile-form.tsx
  │   │   ├── avatar-upload.tsx
  │   │   └── password-form.tsx
  │   └── shared/                   # reusable within app
  │       ├── file-upload.tsx
  │       ├── confirm-dialog.tsx
  │       ├── empty-state.tsx
  │       └── page-loading.tsx
  │
  ├── hooks/                        # custom React hooks
  │   ├── use-auth.ts
  │   ├── use-novel.ts
  │   ├── use-chapters.ts
  │   ├── use-characters.ts
  │   ├── use-settings.ts
  │   ├── use-notes.ts
  │   ├── use-auto-save.ts
  │   ├── use-file-upload.ts
  │   └── use-debounce.ts
  │
  ├── lib/                          # utilities
  │   ├── api-client.ts             # fetch wrapper with auth
  │   ├── tiptap.ts                 # tiptap config & extensions
  │   ├── minio.ts                  # presigned URL helpers
  │   └── utils.ts                  # cn(), formatDate(), etc
  │
  ├── stores/                       # zustand stores
  │   ├── auth-store.ts             # user session, token
  │   ├── wizard-store.ts           # wizard form state
  │   ├── editor-store.ts           # editor state (active chapter, etc)
  │   └── ui-store.ts               # sidebar open, panel open, etc
  │
  ├── services/                     # API service functions
  │   ├── auth.service.ts           # login, register, profile
  │   ├── novel.service.ts          # CRUD novel
  │   ├── chapter.service.ts        # CRUD chapter
  │   ├── character.service.ts      # CRUD character
  │   ├── setting.service.ts        # CRUD setting
  │   ├── note.service.ts           # CRUD chapter notes
  │   ├── upload.service.ts         # presigned URL, upload file
  │   └── export.service.ts         # export PDF/EPUB/DOCX
  │
  └── types/                        # app-specific TypeScript types
      ├── novel.ts
      ├── chapter.ts
      ├── character.ts
      ├── setting.ts
      ├── user.ts
      └── api.ts                    # response types, error types

  type location rules:
    - packages/utils/src/types.ts: tipe yang dipakai 2+ apps (User, Novel, dll)
    - apps/web/src/types/: tipe yang cuma dipakai web app (UI-specific types)
    - Go models: tipe di api/internal/models/, tidak sharing dengan TypeScript
    - developer rule: kalau tipe dipakai di web + admin → packages/utils. kalau cuma web → apps/web/src/types

---

Go backend structure (api/internal):

  internal/
  ├── config/
  │   └── config.go                 # load env, app config struct
  │
  ├── database/
  │   ├── database.go               # GORM connection setup
  │   └── migrate.go                # auto-migration
  │
  ├── models/                       # GORM models (entities)
  │   ├── user.go                   # User model
  │   ├── novel.go                  # Novel model
  │   ├── chapter.go                # Chapter model
  │   ├── character.go              # Character model
  │   ├── setting.go                # Setting model
  │   └── note.go                   # ChapterNote model
  │
  ├── handlers/                     # HTTP handlers (controllers)
  │   ├── auth.handler.go           # login, register, profile
  │   ├── novel.handler.go          # CRUD novel
  │   ├── chapter.handler.go        # CRUD chapter
  │   ├── character.handler.go      # CRUD character
  │   ├── setting.handler.go        # CRUD setting
  │   ├── note.handler.go           # CRUD chapter notes
  │   ├── upload.handler.go         # presigned URL generation
  │   └── export.handler.go         # export novel
  │
  ├── middleware/
  │   ├── auth.go                   # JWT verification
  │   ├── cors.go                   # CORS config
  │   └── logger.go                 # request logging
  │
  ├── repositories/                 # data access layer
  │   ├── user.repo.go
  │   ├── novel.repo.go
  │   ├── chapter.repo.go
  │   ├── character.repo.go
  │   ├── setting.repo.go
  │   └── note.repo.go
  │
  ├── services/                     # business logic layer
  │   ├── auth.service.go           # password hash, JWT generate
  │   ├── novel.service.go
  │   ├── chapter.service.go
  │   ├── character.service.go
  │   ├── setting.service.go
  │   ├── note.service.go
  │   ├── upload.service.go         # MinIO presigned URL
  │   └── export.service.go         # PDF/EPUB/DOCX generation
  │
  ├── routes/
  │   └── routes.go                 # all route registrations
  │
  └── utils/
      ├── jwt.go                    # JWT helpers
      ├── password.go               # bcrypt helpers
      ├── minio.go                  # MinIO client setup
      ├── response.go               # standard JSON response
      └── validator.go              # request validation

  Go API route pattern:
    POST   /v1/auth/register
    POST   /v1/auth/login
    GET    /v1/auth/me
    PUT    /v1/auth/profile
    PUT    /v1/auth/password

    GET    /v1/novels
    POST   /v1/novels
    GET    /v1/novels/:id
    PUT    /v1/novels/:id
    DELETE /v1/novels/:id

    GET    /v1/novels/:id/chapters
    POST   /v1/novels/:id/chapters
    PUT    /v1/chapters/:id
    DELETE /v1/chapters/:id
    PATCH  /v1/chapters/:id/reorder
    PATCH  /v1/chapters/:id/status

    GET    /v1/novels/:id/characters
    POST   /v1/novels/:id/characters
    PUT    /v1/characters/:id
    DELETE /v1/characters/:id

    GET    /v1/novels/:id/settings
    POST   /v1/novels/:id/settings
    PUT    /v1/settings/:id
    DELETE /v1/settings/:id

    GET    /v1/chapters/:id/notes
    PUT    /v1/chapters/:id/notes
    DELETE /v1/chapters/:id/notes

    POST   /v1/upload/presign       # generate presigned URL
    DELETE /v1/upload/:key           # delete file from MinIO

    POST   /v1/novels/:id/export    # export novel

---

Docker Compose structure:

  arsitektur 2 mode:
    - docker-compose.yml: infra only (postgres, minio) — untuk dev
    - docker-compose.prod.yml: semua services (postgres, minio, api, web) — untuk prod

  docker-compose.yml (dev — infra only):
    services:
      postgres:
        image: postgres:16-alpine
        ports: ["5432:5432"]
        env_file: ../.env
        volumes: [postgres-data:/var/lib/postgresql/data]

      minio:
        image: minio/minio
        ports:
          - "9000:9000"   # API
          - "9001:9001"   # Console
        env_file: ../.env
        command: server /data --console-address ":9001"
        volumes: [minio-data:/data]

    volumes:
      postgres-data:
      minio-data:

  docker-compose.prod.yml (production — all services):
    services:
      postgres:
        extends:
          file: docker-compose.yml
          service: postgres

      minio:
        extends:
          file: docker-compose.yml
          service: minio

      api:
        build:
          context: ..
          dockerfile: docker/Dockerfile.api
        env_file: ../.env
        depends_on: [postgres, minio]
        ports: ["8080:8080"]

      web:
        build:
          context: ..
          dockerfile: docker/Dockerfile.web
        env_file: ../.env
        depends_on: [api]
        ports: ["3000:3000"]

  networking:
    - semua service dalam satu Docker network: novyl-network
    - dev: frontend Next.js akses backend via http://localhost:8080/v1 (host)
    - prod: frontend akses backend via http://api:8080/v1 (internal)
    - backend akses postgres via postgres://novyl:5432 (internal)
    - backend akses minio via minio:9000 (internal)
    - dev: web (3000) dan api (8080) di-expose ke host
    - prod: hanya web (3000) yang di-expose ke public

  Dockerfile.api (multi-stage, production):
    FROM golang:1.22-alpine AS builder
    WORKDIR /app
    COPY go.mod go.sum ./
    RUN go mod download
    COPY . .
    RUN CGO_ENABLED=0 go build -o /server cmd/server/main.go

    FROM alpine:3.19
    RUN apk add --no-cache ca-certificates
    COPY --from=builder /server /server
    EXPOSE 8080
    CMD ["/server"]

  Dockerfile.web (multi-stage, production):
    FROM node:20-alpine AS builder
    WORKDIR /app
    RUN corepack enable && corepack prepare pnpm@latest --activate
    COPY pnpm-lock.yaml ./
    RUN pnpm fetch
    COPY . .
    RUN pnpm install --frozen-lockfile
    RUN pnpm build

    FROM node:20-alpine AS runner
    WORKDIR /app
    ENV NODE_ENV=production
    COPY --from=builder /app/apps/web/.next/standalone ./
    COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
    COPY --from=builder /app/apps/web/public ./apps/web/public
    EXPOSE 3000
    CMD ["node", "apps/web/server.js"]

---

Air config (api/.air.toml):

  Air adalah Go live reload tool — rebuild dan restart otomatis saat file .go berubah

  .air.toml:
    root = "."
    tmp_dir = "tmp"

    [build]
      cmd = "go build -o ./tmp/main cmd/server/main.go"
      bin = "./tmp/main"
      delay = 1000
      exclude_dir = ["tmp", "vendor", "migrations"]
      exclude_regex = ["_test.go"]
      include_ext = ["go", "tpl", "tmpl", "html"]
      kill_delay = "0s"
      send_interrupt = false
      stop_on_error = true

    [log]
      time = false

    [color]
      build = "yellow"
      main = "magenta"
      runner = "green"
      watcher = "cyan"

  cara install Air:
    go install github.com/air-verse/air@latest

  cara pakai (manual):
    cd api && air

---

Makefile:

  Makefile di root — single entry point untuk semua commands

  targets:

    # — development —

    make dev:
      - jalankan semua service untuk development
      - postgres + minio via Docker (infra)
      - Go API via Air (hot reload, native)
      - Next.js web via pnpm dev (hot reload, native)
      - semua output ke satu terminal (concurrent)
      - Ctrl+C stop semua

    make dev-infra:
      - jalankan hanya infra (postgres + minio) via Docker
      - untuk developer yang mau jalankan api dan web secara manual

    make dev-api:
      - jalankan hanya Go API dengan Air hot reload
      - assume infra sudah jalan

    make dev-web:
      - install deps (pnpm i) + jalankan Next.js dev server
      - assume infra dan api sudah jalan

    # — production —

    make prod:
      - build dan jalankan semua service dalam Docker (production mode)
      - docker compose -f docker/docker-compose.prod.yml up --build

    make prod-build:
      - build Docker images tanpa start

    make prod-stop:
      - stop semua production containers

    # — utilities —

    make stop:
      - stop semua Docker containers (dev infra)

    make clean:
      - stop containers,hapus volumes, bersihkan build artifacts

    make db-migrate:
      - jalankan database migration

    make db-reset:
      - reset database (drop + migrate)

    make lint:
      - lint semua apps (turborepo)

    make typecheck:
      - typecheck semua apps (turborepo)

    make test:
      - run tests

  Makefile content:

    .PHONY: dev dev-infra dev-api dev-web prod prod-build prod-stop stop clean db-migrate db-reset lint typecheck test

    # — development —

    dev:
    	@echo "Starting all services..."
    	@docker compose -f docker/docker-compose.yml up -d
    	@echo "Waiting for infra..."
    	@sleep 3
    	@pnpm --filter @novyl/web install
    	@make -j3 _dev-api _dev-web _dev-infra-logs

    _dev-api:
    	@cd api && air

    _dev-web:
    	@pnpm --filter @novyl/web dev

    _dev-infra-logs:
    	@docker compose -f docker/docker-compose.yml logs -f

    dev-infra:
    	@docker compose -f docker/docker-compose.yml up

    dev-api:
    	@cd api && air

    dev-web:
    	@pnpm --filter @novyl/web install
    	@pnpm --filter @novyl/web dev

    # — production —

    prod:
    	@docker compose -f docker/docker-compose.prod.yml up --build

    prod-build:
    	@docker compose -f docker/docker-compose.prod.yml build

    prod-stop:
    	@docker compose -f docker/docker-compose.prod.yml down

    # — utilities —

    stop:
    	@docker compose -f docker/docker-compose.yml down

    clean:
    	@docker compose -f docker/docker-compose.yml down -v
    	@rm -rf api/tmp
    	@rm -rf apps/web/.next
    	@rm -rf apps/web/node_modules
    	@pnpm store prune

    db-migrate:
    	@cd api && go run cmd/server/main.go --migrate

    db-reset:
    	@docker compose -f docker/docker-compose.yml down -v
    	@docker compose -f docker/docker-compose.yml up -d
    	@sleep 3
    	@make db-migrate

    lint:
    	@pnpm lint

    typecheck:
    	@pnpm typecheck

    test:
    	@echo "Running Go tests..."
    	@cd api && go test ./... -v
    	@echo "Running frontend tests..."
    	@pnpm -r test 2>/dev/null || echo "No frontend tests configured yet"

---

scaling rules:

  tambah Next.js app baru (misal admin):
    1. buat folder apps/admin/ (copy dari apps/web, strip fitur)
    2. tambah "admin" di pnpm-workspace.yaml (sudah covered: "apps/*")
    3. tambah Dockerfile.admin di docker/
    4. tambah service "admin" di docker-compose.yml
    5. tambah NEXT_PUBLIC_ADMIN_URL di .env
    6. packages/ui dan packages/utils langsung tersedia via workspace:*

  tambah Flutter app:
    1. flutter create apps/mobile
    2. apps/mobile tidak masuk pnpm workspace (bukan Node.js)
    3. Flutter baca API base URL dari environment atau config file
    4. tidak perluubah monorepo config

  shared code antar Next.js apps:
    - packages/ui: komponen UI yang sama (button, input, card, dll)
    - packages/utils: validasi, formatting, types, constants
    - setiap app bisa override atau extend dari packages
    - rule: kalau dipakai 2+ apps → masuk packages. kalau cuma 1 → stay di app

  perpisahan concerns:
    - apps/web: user-facing novel editor
    - apps/landing: marketing page (tidak perlu auth, minimal JS)
    - apps/admin: admin panel (CRUD users, monitor, dashboard)
    - api: semua business logic, tidak ada rendering
    - setiap Next.js app punya next.config.ts, tailwind.config.ts sendiri
    - setiap app bisa deploy independently

---

file naming conventions:

  Next.js:
    - components: kebab-case (novel-card.tsx, editor-toolbar.tsx)
    - pages: page.tsx (App Router convention)
    - layouts: layout.tsx
    - hooks: use-kebab-case.ts (use-auto-save.ts)
    - services: kebab-case.service.ts (novel.service.ts)
    - stores: kebab-case.store.ts (auth-store.ts)
    - types: kebab-case.ts (novel.ts)

  Golang:
    - files: snake_case.go (user_repo.go, auth_handler.go)
    - packages: lowercase, single word (models, handlers, services)
    - structs: PascalCase (User, Novel, Chapter)
    - functions: PascalCase (public), camelCase (private)

  naming conventions — "setting" vs "latar":
    - di UI dan dokumen (mvp.md, ui-flow.md): pakai "latar" / "setting" secara bergantung
    - di code (Go backend, TypeScript): pakai "setting" secara konsisten
      - Go model: Setting struct, setting.repo.go, /v1/settings
      - TS type: setting.ts, setting.service.ts, use-settings.ts
    - alasan: "setting" lebih universal di code, "latar" lebih natural di UI Indonesia
    - developer harus tahu: "setting" di code = "latar" di UI

---

development workflow:

  prerequisites:
    - Docker & Docker Compose
    - Node.js 20+ & pnpm
    - Go 1.22+
    - Air (go install github.com/air-verse/air@latest)

  quick start:
    make dev

  apa yang terjadi saat `make dev`:
    1. docker compose up postgres + minio (infra, background)
    2. tunggu infra siap (3 detik)
    3. pnpm install dependencies untuk web app
    4. concurrently jalankan 3 proses:
       - Air: watch .go files, rebuild & restart API otomatis saat ada perubahan
       - Next.js: dev server dengan turbopack, hot reload otomatis saat ada perubahan
       - Docker logs: tampilkan log postgres + minio
    5. Ctrl+C stop semua proses

  service URLs (dev):
    - Next.js web:  http://localhost:3000
    - Go API:       http://localhost:8080/v1
    - PostgreSQL:   localhost:5432
    - MinIO API:    localhost:9000
    - MinIO Console: http://localhost:9001

  hot reload behavior:
    - Go API (Air):
      - watch file: .go, .tpl, .tmpl, .html
      - rebuild: go build → kill old process → start new process
      - delay: 1000ms after file change
      - exclude: _test.go, tmp/, vendor/
    - Next.js web (Turbopack):
      - watch file: .tsx, .ts, .css, .json
      - HMR (Hot Module Replacement) — instant, no full reload
      - Fast Refresh — preserve React state saat edit component
    - PostgreSQL & MinIO:
      - Docker container, tidak perlu restart saat code change

  partial start (saat mau jalankan service tertentu saja):
    make dev-infra    # hanya postgres + minio
    make dev-api      # hanya Go API (dengan Air)
    make dev-web      # hanya Next.js (dengan pnpm i + pnpm dev)

  production workflow:

    make prod:
      1. build semua Docker images (multi-stage):
         - Go API: compile binary → alpine container
         - Next.js: pnpm build → standalone output → alpine container
      2. jalankan semua containers:
         - postgres, minio, api, web
      3. networking internal: web → api → postgres/minio
      4. hanya web (port 3000) yang di-expose

    perbedaan dev vs prod:
      ┌─────────────────┬──────────────────────┬──────────────────────┐
      │                  │ Development          │ Production           │
      ├─────────────────┼──────────────────────┼──────────────────────┤
      │ postgres         │ Docker               │ Docker               │
      │ minio            │ Docker               │ Docker               │
      │ Go API           │ Air (native, hot)    │ Docker (compiled)    │
      │ Next.js web      │ pnpm dev (native)    │ Docker (standalone)  │
      │ hot reload       │ ya                   │ tidak                │
      │ volume mount     │ tidak                │ tidak                │
      │ env              │ .env                 │ .env (secrets via    │
      │                  │                      │ Docker secrets/env)  │
      │ networking       │ host network         │ Docker internal      │
      │ build            │ tidak ada            │ multi-stage Docker   │
      └─────────────────┴──────────────────────┴──────────────────────┘

    deployment targets (future):
      - VPS: docker compose -f docker-compose.prod.yml up -d
      - Cloud: push images ke registry, deploy ke ECS/GKE/etc
      - CI/CD: GitHub Actions → build → test → push image → deploy
