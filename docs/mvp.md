Novyl AI - MVP (Novel Editor)

overview:
- MVP berupa novel editor web yang lengkap dan nyaman digunakan
- Tidak ada fitur AI generation — novel ditulis manual oleh user
- Semua input (premis, genre, sinopsis, karakter, latar, outline bab) tetap ada dan masuk ke database, namun tidak digunakan untuk generation
- User menulis sendiri isi setiap bab melalui editor yang nyaman

auth:
- user daftar dengan input: nama, email, password, konfirmasi password
- user login dengan email & password
- TIDAK ADA fitur lupa password
- TIDAK ADA integrasi Resend / email service apapun
- user dapat upload, ganti, atau hapus foto profil

input (step-by-step wizard):
- proses input novel menggunakan wizard step-by-step yang nyaman dan tidak bikin capek
- setiap step fokus pada satu aspek, tidak semua input sekaligus
- user bisa kembali ke step sebelumnya untuk edit
- progress indicator menunjukkan step mana yang sedang diisi
- data tersimpan sementara (draft) sehingga tidak hilang jika user keluar di tengah jalan

step wizard:
  step 1 — dasar novel:
    - judul novel
    - premis
    - genre (dropdown/select)
    - sinopsis

  step 2 — karakter:
    - user bisa skip step ini
    - CRUD karakter:
      - nama karakter
      - deskripsi karakter (looks, personality, background, dll)
      - karakter bisa ditambah, diedit, atau dihapus kapan saja setelah wizard selesai

  step 3 — latar/setting:
    - user bisa skip step ini
    - CRUD latar:
      - nama latar
      - deskripsi latar (visual, atmosphere, detail lokasi)
      - latar bisa ditambah, diedit, atau dihapus kapan saja setelah wizard selesai

  step 4 — struktur bab:
    - user menentukan jumlah bab
    - untuk setiap bab:
      - judul bab
      - outline bab (ringkasan singkat isi bab)
    - bab bisa ditambah, diedit, atau dihapus kapan saja setelah wizard selesai
    - urutan bab bisa di-reorder (drag & drop)

  step 5 — konfirmasi:
    - ringkasan semua input yang sudah diisi
    - user bisa klik ke step manapun untuk edit sebelum finalize
    - tombol "Buat Novel" untuk membuat project

novel editor (halaman utama setelah wizard):
- sidebar navigasi: daftar bab dengan status (draft, in-progress, completed)
- area editor utama: rich text editor yang nyaman untuk menulis
- fitur editor:
  - rich text formatting (bold, italic, underline, strikethrough)
  - heading levels (h1, h2, h3)
  - alignment (left, center, right, justify)
  - ordered & unordered list
  - blockquote
  - horizontal rule
  - undo/redo
  - word count & character count per bab
  - full-screen / distraction-free mode
  - auto-save (draft tersimpan otomatis)
- panel info samping (toggleable):
  - outline bab saat ini (sebagai referensi saat menulis)
  - daftar karakter (sebagai referensi)
  - daftar latar (sebagai referensi)
  - notes / catatan bebas user
- navigasi antar bab: prev/next chapter buttons
- status per bab: draft, in-progress, completed (user set manual)
- export per bab atau seluruh novel: PDF, EPUB, DOCX

fitur lain:
- CRUD project novel (create, read, update, delete)
- CRUD bab (create, read, update, delete, reorder)
- CRUD karakter (create, read, update, delete) — bisa diakses kapan saja
- CRUD latar/setting (create, read, update, delete) — bisa diakses kapan saja
- CRUD gambar karakter (character image) — upload, ganti, hapus
- CRUD gambar latar/setting (setting image) — upload, ganti, hapus
- CRUD cover novel — upload, ganti, hapus
- CRUD foto profil user — upload, ganti, hapus
- dashboard: daftar semua project novel user dengan status, cover, dan info singkat
- preview novel (tampilan seperti buku) sebelum export

storage (MinIO):
- object storage S3-compatible untuk menyimpan file
- digunakan untuk:
  - foto profil user — CRUD: upload, replace, delete
  - cover novel — CRUD: upload, replace, delete
  - gambar karakter — CRUD: upload, replace, delete per karakter
  - gambar latar/setting — CRUD: upload, replace, delete per setting
  - export file novel: PDF, EPUB, DOCX (generated lalu disimpan sementara untuk download)
- strategi presigned URL:
  - upload: backend generate presigned PUT/POST URL → frontend upload file langsung ke MinIO
  - download/view: backend generate presigned GET URL (time-limited) → frontend akses file langsung dari MinIO
  - delete: backend generate presigned DELETE URL atau langsung hapus via backend service account
  - backend tidak menangani stream file, hanya generate URL
- setiap file disimpan dalam bucket terstruktur berdasarkan user_id dan project_id
- file dapat diakses melalui presigned URL atau public URL (tergantung konfigurasi privacy)

design system:
- brand color: indigo (primary color utama aplikasi)
- primary: warna indigo asli (indigo-600)
- variasi: berbagai shade indigo dari indigo-50 sampai indigo-950 untuk hierarchy, hover states, dan depth
- netral: dominan black and white (gray scale untuk teks, border, background)
- helper colors (hanya untuk UI info/status):
  - merah: error, destructive actions
  - biru: info, links
  - hijau: success, positive status
  - kuning: warning, pending status
- jangan menggunakan warna lain di luar palette di atas
- UI harus clean dengan indigo sebagai aksen utama di atas fondasi netral

api architecture:
- semua service berjalan dalam Docker Compose sebagai container terpisah
- frontend Next.js mengakses backend Go API melalui internal Docker network (container-to-container)
- pattern URL API:
  - apibaseurl.com/v1/... (tanpa /api/ di path)
  - atau: api.baseurl.com/v1/... (subdomain style)
- backend tidak expose /api/ prefix — semua route langsung di root path dengan versi (v1)

techstack:
- Repo: Monorepo
- Web Frontend: Next.js, Tailwind CSS, shadcn/ui, Lucide React, Framer Motion
- Rich Text Editor: Tiptap (headless, extensible, collaborative-ready)
- Backend API: Golang + Fiber + GORM
- Database: PostgreSQL
- Auth: JWT (dual token)
- Storage: MinIO
- Container: Docker & Docker Compose
