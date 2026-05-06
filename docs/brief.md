Novyl AI - AI Novel Ghostwriter

auth:
- user daftar dengan input: nama, email, password, konfirmasi passoword
- user login dengan email & password
- ketika user lupa password maka akan ada change password link yang dikirimkan ke email (namun harus menginputkan email terlebih dahulu, lalu sistem cek apakah email yang di input user memang ada sebagai user atau tidak, jika tidak maka tidak akan mengirim email apapun dan akan terdisplay pesan kalau email ini belum terdaftar, kalau iya maka nanti email konfirmasi ganti password akan masuk di email user, dan user disuruh masukkan password dan konfirmasi password)
- user dapat upload, ganti, atau hapus foto profil

input:
- premis
- genre
- sinopsis
- add bab:
   - judul per bab
   - outline per bab

optional input:
- Character and char description (ai generated based on input if not provided in input, setap karakter akan tergenerate description lengkap seperti looksnya, personality dll dengan detail)
- Latar and dekripsi latar  (ai generated based on input if not provided in input. dengan deskripsi latar yang cukup lengkap)
- word count perbab (range) (ai generated based on input if not provided in input)

ai nulis (client-driven sequential generation — langsung jalan setelah submit):
- begitu user submit semua input, project masuk ke database dan frontend langsung otomatis memulai proses generation tanpa perlu user menekan tombol generate
- proses generation dikontrol dan dijalankan oleh client (frontend Next.js) secara sequential melalui API routes / server actions:
  - bab satu ditulis oleh AI berdasarkan input yakni keseluruhan context project novel dengan lengkap dan judul bab serta outline bab satu
  - bab dua berdasarkan input keseluruhan context project novel dan keseluruhan isi bab satu serta judul bab dan outline bab 2
  - bab tiga berdasarkan keseluruhan context project novel, keseluruhan isi bab satu, keseluruhan isi bab dua, dan judul bab serta outline bab tiga
  - seterusnya hingga semua bab selesai
- alur client-driven:
  1. frontend mengirim request generate chapter ke API route / server action
  2. API memanggil AI provider (OpenRouter) dan mengembalikan hasil ke client
  3. frontend menyimpan hasil ke database (via server action)
  4. frontend melanjutkan ke chapter berikutnya dengan context yang sudah terakumulasi (semua previous chapters content)
  5. repeat sampai semua chapter selesai
  6. frontend trigger generate blurb setelah semua chapter completed
  7. status project di-update ke "completed"
- client menampilkan progress real-time: chapter yang sedang generating, completed, waiting, dan failed
- jika client disconnect (tab ditutup, browser ditutup), proses generation berhenti. user dapat melanjutkan generation kapan saja dengan menekan tombol "Continue Writing" dari chapter terakhir yang belum selesai
- retry mechanism: jika satu chapter gagal (bukan rate limit), client menampilkan error dan user bisa retry chapter tersebut secara individu, atau skip dan lanjut ke chapter berikutnya
- tidak ada background process, durable workflow, atau queue system. semua generation berjalan di foreground melalui request-response antara client dan server
- Blurb novel

fitur lain:
- of course CRUD project novel dan setiap bab yang ada
- CRUD gambar/gambaran untuk setiap karakter (character image) — user dapat upload, ganti, atau hapus gambar visual karakter
- CRUD gambar/gambaran untuk setiap latar/setting (setting image) — user dapat upload, ganti, atau hapus gambar visual lokasi/setting
- CRUD cover novel — user dapat upload, ganti, atau hapus cover image untuk setiap project novel
- CRUD foto profil user — user dapat upload, ganti, atau hapus foto profil

writing requirement:
- openernya harus menarik, tidak generik dan relevan dengan novel dan pembaca
- setiap akhir bab harus ada cliffhanger yang baik dan efektif
- tata bahasa dan style penulisan novel harus bagus layaknya novel novel best seller dan tidak terdengar seperti ai generated slop

storage (MinIO):
- object storage S3-compatible untuk menyimpan file-file yang berkaitan dengan novel dan profil user
- digunakan untuk:
  - foto profil user — CRUD: upload, replace, delete
  - cover novel (gambar cover untuk setiap project novel) — CRUD: upload, replace, delete
  - gambar karakter (character image) — CRUD: upload, replace, delete per karakter
  - gambar latar/setting (setting image) — CRUD: upload, replace, delete per setting
  - export file novel dalam format PDF, EPUB, atau DOCX (downloadable)
  - file media pendukung lainnya yang terkait dengan novel
- strategi presigned URL (backend tidak jadi bottleneck):
  - upload: backend generate presigned PUT/POST URL → frontend upload file langsung ke MinIO tanpa melalui backend
  - download/view: backend generate presigned GET URL (time-limited) → frontend akses file langsung dari MinIO
  - delete: backend generate presigned DELETE URL atau langsung hapus via backend service account
  - dengan strategi ini backend tidak menangani stream file, hanya generate URL, sehingga overhead backend minimal
- setiap file disimpan dalam bucket terstruktur berdasarkan user_id dan project_id
- file yang diupload dapat diakses melalui presigned URL atau public URL (tergantung konfigurasi privacy)

design system:
- brand color: indigo (primary color utama aplikasi)
- primary: warna indigo asli (indigo-600)
- variasi: berbagai shade indigo dari indigo-50 sampai indigo-950 untuk hierarchy, hover states, dan depth
- netral: dominan black and white (gray scale untuk teks, border, background)
- helper colors (hanya untuk UI info/status):
  - merah: error, destructive actions
  - biru: info, links
  - ijo: success, positive status
  - kuning: warning, pending status
- jangan menggunakan warna lain di luar palette di atas. UI harus clean dengan indigo sebagai aksen utama di atas fondasi netral

api architecture:
- semua service berjalan dalam Docker Compose sebagai container terpisah
- frontend Next.js mengakses backend Go API melalui internal Docker network (container-to-container), bukan via public internet
- pattern URL API:
  - apibaseurl.com/v1/... (tanpa /api/ di path)
  - atau: api.baseurl.com/v1/... (subdomain style)
  - contoh: https://novyl.app/v1/projects atau https://api.novyl.app/v1/projects
- backend tidak expose /api/ prefix — semua route langsung di root path dengan versi (v1)

Techstack:
- Repo: Monorepo
- Web Frontend: Nextjs, tailwindcss, shadcnui, lucide react icon, framer motion
- Backend API: Golang Gofiber + GORM
- Database: Postgresql
- Auth: JWT (dual token)
- Storage: MinIO
- Email: Resend
- ai provider: openrouter
- ai model: x-ai/grok-4.1-fast
- Container: Docker & Docker Compose
