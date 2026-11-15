# TASK-FE-01: Inisialisasi Proyek Frontend, Styling & Konfigurasi API Client

## 1. Identitas Task
- **ID Task**: `TASK-FE-01`
- **Fase**: Fase 1 (Inisialisasi & Pondasi UI)
- **Komponen**: Project Setup, Tailwind CSS, Axios Client, Environment Variables
- **Tingkat Kesulitan**: Mudah
- **Estimasi Waktu**: 0.5 Hari

---

## 2. Deskripsi & Tujuan
Membuat kerangka awal proyek Frontend terpisah (misalnya di folder `frontend/`), mengonfigurasi Tailwind CSS untuk tata letak modern dan konsisten, serta menyiapkan HTTP Client (Axios) yang telah terhubung ke alamat Backend Java REST API.

---

## 3. Spesifikasi Teknis

### 3.1 Perintah Inisialisasi (Contoh React + Vite)
```bash
# Di direktori proyek utama
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install axios react-router-dom lucide-react clsx
```

### 3.2 File Konfigurasi Environment (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_TITLE=SIPINJAM - Sistem Peminjaman Kampus
```

### 3.3 Konfigurasi Axios Interceptor (`src/services/apiClient.js`)
- **Base URL**: Mengambil dari `import.meta.env.VITE_API_BASE_URL`.
- **Request Interceptor**: Menambahkan header `Authorization: Bearer <token>` secara otomatis jika token tersimpan di `localStorage`.
- **Response Interceptor**: Menangkap error 401 (Sesi Habis) dan mengarahkan pengguna kembali ke halaman `/login`, serta mengekstrak payload respons `response.data`.

### 3.4 Helper Format Lokal (`src/utils/formatters.js`)
- `formatRupiah(angka)`: Mengubah `50000` $\to$ `"Rp 50.000"`.
- `formatTanggal(stringTgl)`: Mengubah `"2026-11-20"` $\to$ `"20 Nov 2026"`.

---

## 4. Langkah-Langkah Pengerjaan
1. Eksekusi inisialisasi aplikasi frontend pada folder `frontend/`.
2. Konfigurasikan `tailwind.config.js` untuk menyertakan path template React.
3. Buat modul `src/services/apiClient.js`.
4. Buat script helper di `src/utils/formatters.js`.
5. Uji koneksi dari frontend ke backend dengan memanggil endpoint `GET /api/health` saat aplikasi dimuat.

---

## 5. Kriteria Penerimaan (Acceptance Criteria / DoD)
- [ ] Proyek Frontend berhasil dijalankan dengan `npm run dev` pada port lokal (contoh: `http://localhost:5173`).
- [ ] Styling Tailwind CSS bekerja dengan benar.
- [ ] Axios client berhasil melakukan request uji coba ke Backend Java (`http://localhost:8080/api/health`) dan menerima respons tanpa error CORS.

