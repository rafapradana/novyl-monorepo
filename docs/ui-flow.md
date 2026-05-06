Novyl AI - UI/UX & Flow Document

mvp scope:

  fitur yang ADA di MVP:
    - auth: register, login, foto profil (upload/ganti/hapus)
    - change password (di halaman profile, input password lama + baru)
    - dashboard: daftar semua project novel
    - wizard 5 step: input dasar novel, karakter, latar, bab, konfirmasi
    - novel editor: rich text editor (Tiptap), sidebar bab, panel referensi
    - auto-save di editor
    - CRUD: project novel, bab, karakter, latar
    - CRUD: gambar karakter, gambar latar, cover novel (upload/ganti/hapus)
    - export novel: PDF, EPUB, DOCX
    - preview novel (tampilan buku)
    - storage: MinIO dengan presigned URL
    - design system: indigo primary, neutral, helper colors

  fitur yang TIDAK ADA di MVP:
    - AI generation (tidak ada OpenRouter, tidak ada auto-write)
    - lupa password / forgot password
    - email service (tidak ada Resend, tidak ada email apapun)
    - draft server-side (wizard data hilang jika refresh/keluar)
    - collaborative editing
    - real-time sync

  fitur input yang tetap ADA (masuk DB tapi tidak dipakai untuk generation):
    - premis, genre, sinopsis
    - karakter + deskripsi
    - latar + deskripsi
    - judul + outline per bab
    - semua data ini tersimpan di database dan bisa diedit kapan saja

design philosophy:
- feel: premium, calm, focused — seperti studio penulisan pribadi
- bukan tool yang ramai, bukan dashboard yang penuh grafik
- user datang untuk menulis, UI harus mendukung fokus tanpa distraksi
- indigo sebagai aksen di atas fondasi netral — tidak terlalu biru, tidak terlalu gelap
- setiap elemen punya alasan: tidak ada dekorasi yang tidak fungsional
- spacing yang lega, typography yang nyaman dibaca lama, transisi yang halus

primary user:
- penulis novel (pemula sampai menengah)
- ingin tempat yang terstruktur untuk menulis novel dari awal sampai selesai
- butuh panduan (wizard) tapi juga kebebasan saat menulis
- state of mind: ingin fokus, tidak ingin dipusingkan UI yang ribet

success metric:
- user bisa mulai menulis dalam waktu kurang dari 2 menit setelah login
- user tidak pernah kehilangan tulisan (auto-save)
- user bisa fokus menulis tanpa keluar dari halaman editor
- user bisa manage semua aspek novel (karakter, latar, bab) dari satu tempat

user journey map (high level):

  landing
    ↓
  login / register
    ↓
  dashboard (daftar project)
    ↓
  buat novel baru → wizard 5 step
    ↓
  novel editor (tulis bab per bab)
    ↓
  export / preview

detail alur:

  1. user buka aplikasi → redirect ke login jika belum auth
  2. login/register → masuk ke dashboard
  3. dashboard: lihat semua project, klik "Buat Novel Baru"
  4. wizard step 1-5 → input dasar novel, karakter, latar, bab, konfirmasi
  5. setelah wizard selesai → masuk ke novel editor
  6. editor: tulis bab, manage karakter/latar, preview, export
  7. user bisa kembali ke dashboard kapan saja, progress tersimpan

pages/screens:
  1. /login — halaman login
  2. /register — halaman register
  3. /dashboard — daftar project novel
  4. /novels/new — wizard buat novel baru
  5. /novels/[id] — novel editor (halaman utama)
  6. /novels/[id]/settings — pengaturan novel (edit info dasar, hapus project)
  7. /profile — pengaturan profil user (foto profil, nama, email)
  8. /novels/[id]/preview — preview novel seperti buku
  9. /novels/[id]/export — pilih format export (PDF, EPUB, DOCX)

---

page detail: /login

  layout:
    - center card di atas background netral (white/gray-50)
    - card lebar max 400px, padding lega
    - logo "Novyl" di atas card, centered
    - subtext: "Masuk ke studio menulis Anda"

  form fields:
    - email (input type email, placeholder: "email@contoh.com")
    - password (input type password, placeholder: "••••••••")

  actions:
    - tombol "Masuk" (primary, indigo-600, full width)
    - link: "Belum punya akun? Daftar" → /register

  validation:
    - email required, format email valid
    - password required, min 6 karakter
    - error inline di bawah masing-masing field (merah, kecil)
    - error general di atas form jika login gagal (wrong email/password)

  states:
    - default: form kosong
    - loading: tombol "Masuk" disabled, spinner di dalam tombol
    - error: pesan error muncul, form tetap terisi
    - success: redirect ke /dashboard

  microcopy:
    - error login gagal: "Email atau password salah"
    - error network: "Gagal terhubung ke server. Coba lagi."

---

page detail: /register

  layout:
    - center card, mirip login tapi sedikit lebih tinggi
    - logo "Novyl" di atas
    - subtext: "Mulai perjalanan menulis Anda"

  form fields:
    - nama lengkap (input type text, placeholder: "Nama Anda")
    - email (input type email, placeholder: "email@contoh.com")
    - password (input type password, placeholder: "Minimal 6 karakter")
    - konfirmasi password (input type password, placeholder: "Ulangi password")

  actions:
    - tombol "Daftar" (primary, indigo-600, full width)
    - link: "Sudah punya akun? Masuk" → /login

  validation:
    - nama: required, min 2 karakter
    - email: required, format valid, cek duplikat (error: "Email sudah terdaftar")
    - password: required, min 6 karakter
    - konfirmasi password: required, harus sama dengan password (error: "Password tidak cocok")
    - semua validasi real-time saat user selesai input (on blur), bukan saat mengetik

  states:
    - default: form kosong
    - loading: tombol disabled, spinner
    - error: pesan error per field atau general
    - success: redirect ke /dashboard, toast "Akun berhasil dibuat"

  microcopy:
    - error email duplikat: "Email sudah terdaftar"
    - error password tidak cocok: "Password tidak cocok"
    - success: "Akun berhasil dibuat! Selamat datang di Novyl"

---

page detail: /dashboard

  layout:
    - topbar: logo "Novyl" kiri, foto profil + dropdown kanan
    - main area: grid card project novel
    - floating action button atau tombol "Buat Novel Baru" di kanan bawah atau di header

  topbar:
    - kiri: logo "Novyl" (link ke /dashboard)
    - kanan: foto profil (circle, 36px) → dropdown menu:
      - "Profil Saya" → /profile
      - "Keluar" → logout, redirect /login

  project cards:
    - grid: 1 kolom mobile, 2 kolom tablet, 3 kolom desktop
    - setiap card:
      - cover image (aspect ratio 3:4, object-fit cover)
      - jika belum ada cover: placeholder abu-abu dengan ikon buku
      - judul novel (bold, truncate 1 baris)
      - genre badge (kecil, indigo-50 bg, indigo-700 text)
      - jumlah bab (text kecil, gray-500)
      - status: "Draft" / "In Progress" / "Completed" (badge warna)
      - last updated: "2 hari lalu" (text kecil, gray-400)
    - hover card: sedikit lift (shadow), cursor pointer
    - klik card → masuk ke /novels/[id] (editor)

  empty state (belum ada project):
    - ilustrasi atau ikon besar (buku kosong, gray-300)
    - judul: "Belum ada novel"
    - subtext: "Buat novel pertama Anda dan mulai menulis"
    - tombol: "Buat Novel Baru" (primary)

  header actions:
    - judul halaman: "Novel Saya"
    - tombol "Buat Novel Baru" (primary, indigo-600) → /novels/new

  project actions (context menu atau hover overlay):
    - "Buka" → /novels/[id]
    - "Pengaturan" → /novels/[id]/settings
    - "Hapus" → dialog konfirmasi (merah, destructive)

  delete dialog:
    - judul: "Hapus Novel?"
    - body: "Apakah Anda yakin ingin menghapus "[judul novel]"? Tindakan ini tidak dapat dibatalkan."
    - tombol: "Batal" (outline) / "Hapus" (merah, destructive)
    - input konfirmasi: ketik judul novel untuk konfirmasi hapus (untuk project penting)

  states:
    - loading: skeleton cards (3-6 card abu-abu berkedip)
    - error: "Gagal memuat project. Coba lagi." + tombol retry
    - empty: empty state di atas
    - normal: grid card

---

page detail: /novels/new (wizard)

  layout:
    - topbar minimal: logo kiri, progress bar di tengah, tombol "Batal" kanan
    - content area: center card max 680px, padding lega
    - bottom bar: tombol "Kembali" kiri, tombol "Lanjut" kanan (step 1-4) / "Buat Novel" kanan (step 5)
    - step indicator: angka step (1-5) dengan label, step aktif indigo, selesai hijau

  progress bar:
    - bar horizontal di bawah topbar
    - width sesuai progress: step 1 = 20%, step 2 = 40%, dst
    - warna: indigo-600 fill, gray-200 track
    - animasi smooth saat pindah step

  step indicator (di atas form):
    - 5 lingkaran kecil dengan angka
    - step selesai: hijau dengan checkmark
    - step aktif: indigo dengan border tebal
    - step belum: gray-300
    - label di bawah setiap lingkaran: "Dasar", "Karakter", "Latar", "Bab", "Konfirmasi"
    - step bisa diklik untuk loncat ke step tersebut (hanya step yang sudah dikunjungi)

  shared behavior:
    - data tersimpan di state lokal (React state / zustand) saat pindah step
    - jika user refresh atau keluar, data hilang (MVP: tidak ada draft server-side)
    - user bisa klik step di indicator untuk loncat ke step yang sudah dikunjungi
    - tombol "Kembali" kembali ke step sebelumnya, data tetap tersimpan
    - validasi setiap step sebelum bisa lanjut ke step berikutnya

---

  step 1 — dasar novel:

    fields:
      - judul novel (input text, placeholder: "Judul novel Anda", required)
      - genre (select/combobox, placeholder: "Pilih genre", required)
        options: Fiksi, Fantasi, Sci-Fi, Romance, Thriller, Horor, Misteri, Drama, Petualangan, Sastra, Lainnya
      - premis (textarea, 3 baris, placeholder: "Ceritakan premis novel Anda dalam 1-2 kalimat", required)
      - sinopsis (textarea, 6 baris, placeholder: "Ceritakan keseluruhan cerita novel Anda...", required)

    layout:
      - single column, fields diturunkan satu per satu
      - spacing antar field: 24px
      - label di atas setiap field, bold, gray-700
      - helper text di bawah field jika perlu (gray-400, kecil)

    validation:
      - judul: required, max 100 karakter
      - genre: required
      - premis: required, max 300 karakter
      - sinopsis: required, max 2000 karakter
      - character count indicator di pojok kanan bawah textarea (gray-400, berubah merah jika mendekati limit)

    states:
      - field kosong: placeholder visible
      - field terisi: text hitam, label tetap visible
      - error: border merah, error text di bawah field
      - valid: border hijau halus (opsional, bisa juga netral saja)

    microcopy:
      - helper premis: "Premis adalah ide inti cerita Anda dalam satu atau dua kalimat"
      - helper sinopsis: "Semakin detail sinopsis, semakin terstruktur novel Anda"

---

  step 2 — karakter:

    layout:
      - judul step: "Karakter"
      - subtext: "Tambahkan karakter untuk novel Anda. Bisa dilewati dan ditambahkan nanti."
      - tombol "Lewati" di kanan atas (text button, gray-500)
      - area daftar karakter: list card vertikal
      - tombol "+ Tambah Karakter" di bawah list

    character card:
      - foto karakter (circle, 48px) — placeholder jika belum upload
      - nama karakter (bold)
      - deskripsi singkat (truncate 2 baris, gray-500)
      - aksi: tombol edit (ikon pensil), tombol hapus (ikon trash, merah)
      - drag handle untuk reorder (opsional di MVP)

    add/edit character dialog (modal):
      - judul: "Tambah Karakter" / "Edit Karakter"
      - fields:
        - foto karakter (upload area, circle preview, klik untuk ganti)
        - nama (input text, required)
        - deskripsi (textarea, 5 baris, placeholder: "Ceritakan tentang karakter ini: penampilan, kepribadian, latar belakang...", required)
      - tombol: "Batal" (outline) / "Simpan" (primary)

    empty state (belum ada karakter):
      - ikon orang (gray-300, besar)
      - text: "Belum ada karakter"
      - subtext: "Tambahkan karakter untuk membangun dunia novel Anda"

    delete character:
      - dialog konfirmasi sederhana: "Hapus karakter [nama]?"
      - tombol: "Batal" / "Hapus" (merah)

    validation:
      - nama: required, max 50 karakter
      - deskripsi: required, max 1000 karakter

    navigation:
      - tombol "Kembali" → step 1
      - tombol "Lanjut" → step 3
      - tombol "Lewati" → step 3 (tanpa menambah karakter)

---

  step 3 — latar/setting:

    layout:
      - identik dengan step 2 (karakter), tapi untuk latar
      - judul: "Latar & Setting"
      - subtext: "Tambahkan lokasi dan setting cerita. Bisa dilewati dan ditambahkan nanti."
      - tombol "Lewati" di kanan atas

    setting card:
      - gambar latar (rectangle, 64x48px, rounded) — placeholder jika belum upload
      - nama latar (bold)
      - deskripsi singkat (truncate 2 baris, gray-500)
      - aksi: edit, hapus

    add/edit setting dialog (modal):
      - fields:
        - gambar latar (upload area, rectangle preview)
        - nama latar (input text, required)
        - deskripsi (textarea, 5 baris, placeholder: "Ceritakan tentang tempat ini: visual, suasana, detail penting...", required)
      - tombol: "Batal" / "Simpan"

    empty state:
      - ikon map pin (gray-300)
      - text: "Belum ada latar"
      - subtext: "Tambahkan latar untuk membangun dunia novel Anda"

    validation:
      - nama: required, max 50 karakter
      - deskripsi: required, max 1000 karakter

    navigation:
      - "Kembali" → step 2
      - "Lanjut" → step 4
      - "Lewati" → step 4

---

  step 4 — struktur bab:

    layout:
      - judul: "Struktur Bab"
      - subtext: "Tentukan jumlah bab dan buat outline untuk masing-masing"
      - area daftar bab: list vertikal dengan numbering
      - tombol "+ Tambah Bab" di bawah list

    chapter row:
      - nomor bab (gray-500, kecil): "Bab 1", "Bab 2", dst
      - input judul bab (inline, text, placeholder: "Judul bab")
      - textarea outline (2 baris expandable, placeholder: "Ringkasan isi bab ini...")
      - aksi: tombol hapus (ikon trash)
      - drag handle untuk reorder

    interaction:
      - user bisa langsung ketik judul dan outline di setiap row
      - tombol "+ Tambah Bab" menambah row baru di bawah
      - hapus bab: dialog konfirmasi singkat
      - minimal 1 bab harus ada
      - reorder: drag & drop row (Framer Motion drag)

    empty state (belum ada bab):
      - text: "Belum ada bab"
      - subtext: "Mulai dengan menambahkan bab pertama"
      - auto: setelah wizard dibuka, otomatis 1 row bab kosong sudah ada

    validation:
      - minimal 1 bab
      - judul bab: required, max 100 karakter
      - outline: optional (bisa kosong)

    navigation:
      - "Kembali" → step 3
      - "Lanjut" → step 5

---

  step 5 — konfirmasi:

    layout:
      - judul: "Konfirmasi"
      - subtext: "Periksa kembali semua input sebelum membuat novel"
      - sections berdasarkan step sebelumnya

    sections:
      1. Dasar Novel:
         - judul, genre (badge), premis, sinopsis
         - tombol "Edit" di kanan → loncat ke step 1

      2. Karakter ([jumlah] karakter):
         - list nama karakter dengan deskripsi singkat
         - "Belum ada karakter" jika kosong
         - tombol "Edit" → loncat ke step 2

      3. Latar ([jumlah] latar):
         - list nama latar dengan deskripsi singkat
         - "Belum ada latar" jika kosong
         - tombol "Edit" → loncat ke step 3

      4. Struktur Bab ([jumlah] bab):
         - list bab: "Bab 1: [judul]" dengan outline singkat
         - tombol "Edit" → loncat ke step 4

    navigation:
      - "Kembali" → step 4
      - "Buat Novel" (primary, besar, indigo-600) → submit, redirect ke /novels/[id]

    submit flow:
      - tombol "Buat Novel" → loading state
      - API call: create project + chapters + characters + settings
      - success: redirect ke /novels/[id] (editor), toast "Novel berhasil dibuat!"
      - error: toast "Gagal membuat novel. Coba lagi."

---

page detail: /novels/[id] (novel editor)

  ini adalah halaman paling penting — user menghabiskan sebagian besar waktu di sini
  feel: studio menulis pribadi, fokus, minim distraksi, nyaman untuk menulis berjam-jam

  layout (3 kolom):
    - kiri: sidebar navigasi bab (240px, collapsible)
    - tengah: editor utama (flex-1, max-width 720px, centered)
    - kanan: panel referensi (280px, collapsible, toggleable)
    - topbar: minimal — judul novel, status save, actions

  topbar:
    - kiri: tombol "← Dashboard" (back arrow, text kecil), judul novel (bold, truncate)
    - tengah: status auto-save — "Tersimpan" (hijau, kecil) / "Menyimpan..." (abu-animated) / "Gagal menyimpan" (merah, dengan tombol retry)
    - kanan:
      - tombol "Preview" (ikon eye) → /novels/[id]/preview
      - tombol "Export" (ikon download) → dropdown: PDF, EPUB, DOCX
      - tombol "Settings" (ikon gear) → /novels/[id]/settings
      - foto profil (circle, 32px) → dropdown: Profil, Keluar

  sidebar kiri (chapter navigation):
    - header: "Daftar Bab" + tombol "+ Bab Baru"
    - list bab:
      - setiap item:
        - nomor bab (kecil, gray-400): "Bab 1"
        - judul bab (truncate 1 baris)
        - status indicator:
          - draft: dot abu-abu
          - in-progress: dot kuning
          - completed: dot hijau
        - word count (kecil, gray-400): "1.234 kata"
      - hover: background gray-50, cursor pointer
      - active (sedang diedit): background indigo-50, border-left indigo-600 tebal
      - klik → load bab tersebut di editor
    - drag & drop untuk reorder bab
    - context menu (right click atau tombol "..."):
      - "Edit Judul & Outline" → modal edit
      - "Tandai Selesai" / "Tandai Draft"
      - "Hapus Bab" → konfirmasi

  editor utama (tiptap):
    - toolbar di atas editor (sticky, muncul saat scroll):
      - formatting: Bold, Italic, Underline, Strikethrough
      - heading: dropdown H1, H2, H3, Paragraph
      - alignment: Left, Center, Right, Justify
      - list: Ordered, Unordered
      - insert: Blockquote, Horizontal Rule
      - undo/redo
      - full-screen toggle (ikon maximize)
    - area tulis:
      - width max 720px, centered
      - font: serif (Georgia atau system serif) untuk feel menulis novel
      - line-height: 1.8 (nyaman dibaca)
      - paragraph spacing: 16px
      - padding area tulis: 48px atas-bawah, 32px kiri-kanan
      - placeholder saat kosong: "Mulai menulis bab ini..."
    - bottom bar:
      - word count: "1.234 kata · 6.789 karakter"
      - chapter status selector: dropdown kecil (Draft / In Progress / Completed)
      - prev/next chapter buttons

  toolbar detail:
    - toolbar sticky di top editor area, tidak ikut scroll konten
    - background: white dengan border-bottom gray-200
    - icon buttons: 32x32px, gray-600, hover gray-100, active indigo-100
    - separator garis tipis antar grup tombol
    - dropdown heading: popover kecil dengan preview ukuran heading
    - undo/redo di ujung kanan toolbar

  full-screen mode:
    - sidebar kiri hidden, panel kanan hidden
    - topbar: hanya tombol "Keluar Fullscreen" dan status save
    - editor: width penuh, max 800px centered
    - background: sedikit lebih gelap (gray-50) untuk fokus
    - transisi masuk/keluar: smooth fade

  auto-save:
    - trigger: setiap 3 detik setelah user berhenti mengetik (debounce)
    - visual: status di topbar berubah "Menyimpan..." → "Tersimpan"
    - error handling: jika gagal, tampil "Gagal menyimpan" + tombol "Coba Lagi"
    - tidak ada tombol save manual — semua otomatis

  panel referensi kanan (toggleable):
    - toggle: tombol di topbar atau edge panel
    - tabs di atas panel:
      - "Outline" — outline bab saat ini
      - "Karakter" — daftar semua karakter
      - "Latar" — daftar semua latar
      - "Catatan" — notes bebas user
    - panel bisa di-hide untuk fokus penuh ke editor

  tab outline:
    - menampilkan outline bab yang sedang diedit
    - read-only (user edit outline di settings atau wizard)
    - helper text: "Outline ini sebagai panduan saat menulis"

  tab karakter:
    - list karakter: foto (circle kecil), nama, deskripsi singkat
    - klik karakter → expand deskripsi lengkap
    - tidak ada edit di sini (edit di settings)
    - tujuan: referensi saat menulis

  tab latar:
    - list latar: gambar (kecil), nama, deskripsi singkat
    - klik → expand deskripsi lengkap
    - read-only, referensi

  tab catatan:
    - textarea bebas (auto-save terpisah per bab)
    - placeholder: "Tulis catatan untuk bab ini..."
    - contoh: "Ingat: karakter A belum tahu rahasia di bab ini"
    - auto-save: debounce 2 detik

---

page detail: /novels/[id]/settings

  layout:
    - topbar: back ke editor, judul "Pengaturan Novel"
    - content: single column, max 600px, centered
    - sections dipisah dengan divider

  sections:

    1. Info Dasar:
       - cover novel (upload area, aspect ratio 3:4, klik untuk ganti)
       - judul novel (input text)
       - genre (select)
       - premis (textarea)
       - sinopsis (textarea)
       - tombol "Simpan Perubahan"

    2. Karakter:
       - daftar karakter (sama seperti wizard step 2)
       - bisa tambah, edit, hapus, upload foto
       - tidak perlu tombol simpan tersimpan otomatis

    3. Latar & Setting:
       - daftar latar (sama seperti wizard step 3)
       - bisa tambah, edit, hapus, upload gambar
       - auto-save

    4. Struktur Bab:
       - daftar bab (sama seperti wizard step 4)
       - bisa tambah, edit, hapus, reorder
       - auto-save

    5. Danger Zone:
       - tombol "Hapus Novel" (merah, destructive)
       - dialog konfirmasi: ketik judul novel untuk konfirmasi
       - setelah hapus → redirect ke /dashboard

  behavior:
    - setiap section independent, bisa edit satu section tanpa affect yang lain
    - info dasar: manual save (tombol "Simpan")
    - karakter, latar, bab: auto-save setiap perubahan
    - upload gambar: presigned URL → upload langsung ke MinIO

---

page detail: /profile

  layout:
    - topbar: back ke dashboard, judul "Profil Saya"
    - content: center card, max 480px

  fields:
    - foto profil:
      - circle besar (96px)
      - overlay hover: "Ganti Foto"
      - klik → file picker (jpg, png, max 2MB)
      - tombol "Hapus Foto" di bawah (jika ada foto)
    - nama (input text)
    - email (input email, disabled — tidak bisa diubah di MVP)
    - tombol "Simpan Perubahan"

  change password section (terpisah):
    - judul: "Ubah Password"
    - fields: password lama, password baru, konfirmasi password baru
    - tombol "Ubah Password"
    - validasi: password lama harus benar, password baru min 6 karakter, konfirmasi cocok

  states:
    - loading foto: skeleton circle
    - upload foto: progress bar kecil di bawah foto
    - simpan: loading di tombol, toast "Profil berhasil diperbarui"

---

page detail: /novels/[id]/preview

  layout:
    - topbar: back ke editor, judul "Preview", tombol "Export"
    - konten: tampilan seperti buku, center, max 680px
    - background: gray-50, konten white dengan shadow halus

  content:
    - halaman sampul: cover novel (besar), judul, genre
    - daftar isi: list bab dengan judul dan nomor halaman
    - setiap bab:
      - judul bab (heading besar)
      - isi bab (formatted seperti buku, font serif)
      - page break antar bab
    - di bagian bawah: blurb / sinopsis (jika ada)

  interactions:
    - scroll vertikal seperti membaca ebook
    - tidak ada editing di sini (read-only)
    - tombol "Export" di topbar → pilih format

---

page detail: /novels/[id]/export

  ini bisa berupa halaman terpisah atau modal dari preview

  layout:
    - center card, max 400px
    - judul: "Export Novel"
    - subtext: "Pilih format untuk mengunduh novel Anda"

  format options:
    - card option: PDF (ikon file-text)
      - deskripsi: "Format universal, siap cetak"
    - card option: EPUB (ikon book-open)
      - deskripsi: "Untuk e-reader dan aplikasi baca"
    - card option: DOCX (ikon file)
      - deskripsi: "Untuk editing di Microsoft Word"

  interactions:
    - klik format → loading "Menyiapkan file..."
    - backend generate file → simpan ke MinIO → return presigned download URL
    - browser auto-download file
    - error: "Gagal membuat file. Coba lagi."

---

component catalog:

  buttons:
    - primary: bg indigo-600, text white, hover indigo-700, active indigo-800
    - secondary/outline: border indigo-600, text indigo-600, bg transparent, hover indigo-50
    - destructive: bg red-600, text white, hover red-700
    - ghost: bg transparent, text gray-600, hover gray-100
    - icon button: 36x36, bg transparent, gray-500 icon, hover gray-100
    - sizes: sm (32px h), md (40px h), lg (48px h)
    - border-radius: 8px (rounded-lg)
    - font-weight: 600 (semibold)
    - transition: 150ms ease

  inputs:
    - border: gray-300, focus ring indigo-500 (2px)
    - padding: 12px 16px
    - border-radius: 8px
    - placeholder: gray-400
    - label: gray-700, font-weight 500, margin-bottom 6px
    - error state: border red-500, error text red-600 di bawah
    - helper text: gray-400, kecil, di bawah field

  cards:
    - background: white
    - border: 1px gray-200
    - border-radius: 12px
    - padding: 16-24px
    - shadow: none default, sm (0 1px 3px rgba(0,0,0,0.08)) on hover
    - transition: shadow 150ms, transform 150ms

  modals/dialogs:
    - overlay: black/40, backdrop-blur halus
    - card: white, max-width 480px, border-radius 16px, padding 24px
    - animasi: fade in + scale dari 0.95
    - close: tombol X di kanan atas, atau klik overlay
    - focus trap: fokus masuk ke modal saat terbuka

  toast/notifications:
    - posisi: bottom-right
    - background: white, border, shadow
    - icon: sesuai type (check hijau, info biru, warning kuning, error merah)
    - auto-dismiss: 4 detik
    - dismiss manual: tombol X
    - stack: toast baru muncul di bawah, push ke atas

  dropdowns/selects:
    - trigger: mirip input, dengan ikon chevron-down
    - popover: white, border, shadow, max-height 240px dengan scroll
    - option hover: gray-50
    - option selected: indigo-50, indigo-700 text
    - search: input di atas options jika banyak pilihan

  badges:
    - genre badge: bg indigo-50, text indigo-700, padding 2px 10px, rounded-full
    - status badge: dot + text
      - draft: dot gray-400, text gray-600
      - in-progress: dot yellow-400, text yellow-700
      - completed: dot green-400, text green-700
    - ukuran: kecil (12px font)

  tooltips:
    - background: gray-900, text white
    - font-size: 12px
    - delay: 300ms sebelum muncul
    - arrow menunjuk ke trigger
    - posisi: atas, bawah, kiri, kanan (auto)

  skeleton loading:
    - background: gray-200
    - animasi: shimmer (gradient bergerak dari kiri ke kanan)
    - shape sesuai konten: rectangle untuk text, circle untuk avatar

---

interaction patterns:

  navigation:
    - sidebar kiri di editor: highlight active chapter
    - topbar: back button di halaman child (settings, profile, preview)
    - breadcrumbs tidak digunakan (cukup back button)
    - mobile: sidebar jadi bottom sheet atau drawer

  drag & drop:
    - chapter reorder di sidebar editor
    - chapter reorder di wizard step 4
    - visual: item diangkat (shadow besar), placeholder di posisi tujuan
    - library: @dnd-kit (accessible, keyboard support)

  file upload:
    - flow: klik area upload → file picker → preview → upload via presigned URL
    - progress: progress bar di bawah preview
    - error: "File terlalu besar (max 2MB)" / "Format tidak didukung"
    - accepted: jpg, jpeg, png, webp
    - max size: 2MB untuk gambar

  auto-save:
    - editor content: debounce 3 detik
    - notes: debounce 2 detik
    - visual indicator di topbar
    - retry otomatis 1x jika gagal, lalu manual retry

  keyboard shortcuts (editor):
    - Ctrl+B: bold
    - Ctrl+I: italic
    - Ctrl+U: underline
    - Ctrl+Z: undo
    - Ctrl+Shift+Z: redo
    - Ctrl+S: force save (walaupun auto-save)
    - Escape: keluar full-screen mode

  responsive breakpoints:
    - mobile: < 768px
    - tablet: 768px - 1024px
    - desktop: > 1024px

  responsive behavior:
    - mobile:
      - sidebar kiri: hidden, toggle via hamburger icon → drawer
      - panel kanan: hidden, toggle via ikon
      - editor: full width
      - toolbar: scrollable horizontal
      - wizard: full width, padding dikurangi
    - tablet:
      - sidebar kiri: collapsible (icon-only mode)
      - panel kanan: hidden default, toggle
      - editor: max 600px
    - desktop:
      - 3 kolom penuh
      - editor: max 720px

---

states & edge cases:

  global states:
    - loading page: skeleton sesuai layout halaman
    - error page: "Terjadi kesalahan" + tombol "Coba Lagi"
    - unauthorized: redirect ke /login

  dashboard:
    - empty: empty state card
    - loading: skeleton grid
    - error: error message + retry
    - many projects (50+): pagination atau "load more" button

  editor:
    - empty chapter: placeholder "Mulai menulis bab ini..."
    - long content (10.000+ kata): performa tetap smooth (tiptap handles ini)
    - concurrent edit (future): untuk MVP tidak perlu
    - browser back: intercept dengan "Anda yakin ingin keluar? Perubahan tersimpan otomatis."
    - disconnect: auto-save queue, retry saat online kembali

  wizard:
    - user keluar di tengah wizard: data hilang (MVP: tidak ada draft server)
    - user refresh: data hilang, kembali ke dashboard
    - minimal validation: step 1 semua required, step 4 minimal 1 bab

  file upload:
    - file terlalu besar: error sebelum upload
    - format salah: error sebelum upload
    - upload gagal: retry button
    - upload timeout: error setelah 30 detik

  export:
    - novel kosong (belum ada isi): warning "Novel belum memiliki isi. Export tetap?"
    - export gagal: error + retry
    - file besar: loading "Menyiapkan file..." dengan progress

---

microcopy guidelines:

  tone:
    - bahasa Indonesia yang natural, tidak terlalu formal
    - friendly tapi tidak berlebihan
    - jelas dan langsung ke intinya
    - hindari jargon teknis

  error messages:
    - spesifik: apa yang salah dan bagaimana memperbaiki
    - tidak menyalahkan user
    - contoh bagus: "Email atau password salah" (bukan "Login failed")
    - contoh bagus: "File terlalu besar. Pilih file di bawah 2MB" (bukan "Invalid file")

  empty states:
    - selalu ada ilustrasi/ikon + judul + subtext + CTA
    - contoh: "Belum ada novel" → "Buat novel pertama Anda dan mulai menulis" → tombol "Buat Novel Baru"

  loading states:
    - spesifik: "Menyimpan..." bukan "Loading..."
    - untuk proses lama: "Menyiapkan file export..." atau "Membuat novel Anda..."

  success messages:
    - toast singkat: "Novel berhasil dibuat!", "Profil diperbarui"
    - tidak perlu panjang

  button labels:
    - action verb: "Buat Novel", "Simpan", "Hapus", "Export"
    - tidak: "Submit", "OK", "Yes"
    - destructive: "Hapus" (bukan "Ya, Hapus!" terlalu dramatis)

  placeholders:
    - helpful, memberi contoh arah
    - "Judul novel Anda" (bukan "Enter title")
    - "Ceritakan premis novel Anda dalam 1-2 kalimat"
    - "Mulai menulis bab ini..."

---

flow diagrams:

  auth flow:

    ┌─────────┐     ┌──────────┐     ┌───────────┐
    │ Landing  │────▶│  Login   │────▶│ Dashboard │
    └─────────┘     └──────────┘     └───────────┘
                         │
                         ▼
                    ┌──────────┐
                    │ Register │
                    └──────────┘

  create novel flow:

    ┌───────────┐     ┌──────────────┐     ┌──────────────┐
    │ Dashboard  │────▶│  Wizard      │────▶│  Novel       │
    │ "Buat Baru"│     │  Step 1-5    │     │  Editor      │
    └───────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                      ┌──────────────┐
                      │  Step 1: Dasar│
                      │  Step 2: Kar. │
                      │  Step 3: Latar│
                      │  Step 4: Bab  │
                      │  Step 5: Konf.│
                      └──────────────┘

  editor flow:

    ┌────────────────────────────────────────────────────────┐
    │                    Novel Editor                        │
    │  ┌──────────┐  ┌────────────────────┐  ┌──────────┐  │
    │  │  Sidebar  │  │    Editor Utama    │  │  Panel   │  │
    │  │  (Bab)    │  │    (Tiptap)        │  │  Ref     │  │
    │  │          │  │                    │  │          │  │
    │  │ Bab 1 ●  │  │ ┌────────────────┐ │  │ Outline  │  │
    │  │ Bab 2 ○  │  │ │  Toolbar       │ │  │ Karakter │  │
    │  │ Bab 3 ○  │  │ ├────────────────┤ │  │ Latar    │  │
    │  │          │  │ │                │ │  │ Catatan  │  │
    │  │ + Bab    │  │ │  Area Menulis  │ │  │          │  │
    │  │          │  │ │                │ │  │          │  │
    │  │          │  │ ├────────────────┤ │  │          │  │
    │  │          │  │ │ Word Count     │ │  │          │  │
    │  └──────────┘  │ └────────────────┘ │  └──────────┘  │
    │                 └────────────────────┘                │
    └────────────────────────────────────────────────────────┘

  export flow:

    ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
    │  Editor  │────▶│ Preview  │────▶│  Export  │────▶│ Download │
    │  "Eye"   │     │ (Buku)   │     │  Modal   │     │  File    │
    └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                              │
                                    ┌─────────┼─────────┐
                                    ▼         ▼         ▼
                                  PDF      EPUB      DOCX

  state per bab:

    ┌────────┐     ┌─────────────┐     ┌───────────┐
    │ Draft  │────▶│ In Progress │────▶│ Completed │
    │ (abu)  │     │  (kuning)   │     │  (hijau)  │
    └────────┘     └─────────────┘     └───────────┘
         ▲                                   │
         └───────────────────────────────────┘
              (bisa diubah kapan saja)
