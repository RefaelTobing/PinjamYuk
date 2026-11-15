# ALUR PENGERJAAN FRONTEND (FE BEBAS) — SIPINJAM

Dokumen ini memetakan arsitektur dan alur pengerjaan **Frontend (FE Bebas)** untuk sistem **SIPINJAM (Sistem Informasi Peminjaman Inventaris, Sarana Prasarana, dan Ruangan Kampus)**. Sesuai aturan penugasan Final Project, Frontend bersifat **bebas** (tidak dibatasi harus Java Desktop Swing), sehingga dapat dikembangkan menggunakan teknologi web modern yang responsif, interaktif, dan terhubung ke **Backend Java REST API**.

---

## 1. Rekomendasi Tech Stack Frontend

Untuk menghasilkan antarmuka yang modern, cepat dikembangkan, dan memukau saat demonstrasi praktikum, berikut rekomendasi stack standar:

### Pilihan Rekomendasi: React + Vite + Tailwind CSS
- **Framework / Bundler**: **React 18/19** dengan **Vite** (sangat cepat saat kompilasi dan hot reload).
- **Styling**: **Tailwind CSS** + Headless UI / Lucide React Icons (desain clean, modern, dan responsif).
- **HTTP Client**: **Axios** (dengan request/response interceptor untuk menyisipkan token dan menangani error secara global).
- **Routing**: **React Router DOM v6** (dengan perlindungan rute berbasis peran / *Role-Based Route Guards*).
- **State Management**: React Context API (`AuthContext` dan `CartContext`).

> *Catatan: Pengembang juga diperbolehkan menggunakan alternatif lain seperti Vue 3 + Vite, Next.js, Svelte, atau HTML5 + Tailwind/Bootstrap + Vanilla JS. Seluruh spesifikasi task di bawah dirancang agnostic dan berorientasi pada komponen serta kontrak API.*

---

## 2. Struktur Direktori Frontend yang Dianjurkan

```
frontend/
├── public/
├── src/
│   ├── assets/              # Logo kampus, ikon, ilustrasi
│   ├── components/          # Komponen UI bersama (Button, Modal, Badge, Card, Navbar, Sidebar)
│   ├── context/             # AuthContext (login/peran), CartContext (keranjang barang)
│   ├── layouts/             # AppLayout (Sidebar + Topbar), AuthLayout
│   ├── pages/
│   │   ├── auth/            # LoginPage, RegisterPage
│   │   ├── mahasiswa/       # KatalogBarang, BookingRuangan, RiwayatMahasiswa
│   │   ├── pembina/         # AntreanPersetujuan, RiwayatPersetujuan
│   │   └── petugas/         # MasterBarang, MasterRuangan, Verifikasi, Sirkulasi, Laporan
│   ├── services/            # Modul pemanggilan API ke Java BE (apiClient, authService, pinjamService, dll.)
│   ├── utils/               # Formatters (rupiah, format tanggal Indonesia, badge helper)
│   ├── App.jsx              # Routing definitions
│   └── main.jsx
├── .env                     # VITE_API_BASE_URL=http://localhost:8080/api
├── package.json
└── tailwind.config.js
```

---

## 3. Roadmap Tahapan Pengerjaan FE (Fase 1 s.d. Fase 5)

```
[FASE 1: Inisialisasi & Pondasi UI]
  ├── TASK-FE-01: Setup Project Frontend, Tailwind CSS & Konfigurasi API Client
  └── TASK-FE-02: Sistem Autentikasi, Route Guard 3 Peran & Layout Shell
        │
[FASE 2: Modul Utama Mahasiswa (Peminjam)]
  ├── TASK-FE-03: Katalog Inventaris, Cek Stok Real-Time & Pengajuan Multi-Item
  ├── TASK-FE-04: Kalender Slot Ruangan Interaktif & Pengajuan Booking
  └── TASK-FE-05: Pelacakan Riwayat, Stepper Status & Manajemen Denda
        │
[FASE 3: Modul Dosen Pembina (Pemberi Izin Khusus)]
  └── TASK-FE-06: Dashboard Antrean Persetujuan & Aksi Setuju/Tolak Barang Khusus
        │
[FASE 4: Modul Petugas Sarpras (Operasional & Master Data)]
  ├── TASK-FE-07: Manajemen Master Data Inventaris, Ruangan & Tarif Denda
  ├── TASK-FE-08: Verifikasi Pengajuan, Pencatatan Serah Terima & Pengembalian
  └── TASK-FE-09: Monitoring Jatuh Tempo & Dashboard Analitik Rekapitulasi
        │
[FASE 5: Integrasi, Poles UI/UX & Kesiapan Demo]
  └── TASK-FE-10: Pengujian End-to-End, Error Handling Toast & Persiapan Presentasi
```

---

## 4. Daftar Modul Tugas Frontend (`docs/TaskFE/`)

| File Task | Nama Tugas | Aktor / Fokus |
| --- | --- | --- |
| [TASK-FE-01](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskFE/TASK-FE-01_SETUP_PROJECT_DAN_ENV.md) | Setup Project, Styling & API Client | Inisialisasi Vite/React, Tailwind, Axios client & konfigurasi port |
| [TASK-FE-02](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskFE/TASK-FE-02_AUTH_ROUTING_DAN_LAYOUT.md) | Autentikasi, Routing & App Shell | Login 3 peran, registrasi mahasiswa, layout sidebar & navbar responsif |
| [TASK-FE-03](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskFE/TASK-FE-03_MAHASISWA_KATALOG_DAN_PENGAJUAN.md) | Katalog Barang & Pengajuan Multi-Item | Mahasiswa: filter tanggal, kalkulasi sisa stok real-time, keranjang barang |
| [TASK-FE-04](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskFE/TASK-FE-04_MAHASISWA_BOOKING_RUANGAN.md) | Visualisasi Slot & Booking Ruangan | Mahasiswa: peta slot 07.00-21.00, deteksi slot terisi, booking form |
| [TASK-FE-05](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskFE/TASK-FE-05_MAHASISWA_RIWAYAT_DAN_DENDA.md) | Riwayat Peminjaman & Tagihan Denda | Mahasiswa: pelacakan status, info denda, pembatalan pengajuan/booking |
| [TASK-FE-06](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskFE/TASK-FE-06_DOSEN_PEMBINA_APPROVAL.md) | Dashboard Antrean Persetujuan Pembina | Dosen Pembina: persetujuan barang lab & elektronik bernilai tinggi |
| [TASK-FE-07](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskFE/TASK-FE-07_PETUGAS_MASTER_DATA.md) | Pengelolaan Master Data Inventaris & Ruang | Petugas: CRUD Barang, Ruangan, Kategori, dan pengaturan tarif denda |
| [TASK-FE-08](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskFE/TASK-FE-08_PETUGAS_VERIFIKASI_DAN_OPERASIONAL.md) | Verifikasi, Serah Terima & Pengembalian | Petugas: approval, serah terima kondisi awal, input pengembalian & denda |
| [TASK-FE-09](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskFE/TASK-FE-09_PETUGAS_MONITORING_DAN_LAPORAN.md) | Monitoring Overdue & Visualisasi Grafik | Petugas/Pembina: peringatan jatuh tempo & grafik statistik peminjaman |
| [TASK-FE-10](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskFE/TASK-FE-10_INTEGRASI_E2E_DAN_DEMO_READINESS.md) | Integrasi End-to-End, Testing & Demo | Verifikasi integrasi full flow, polish UI/UX, skenario presentasi live |

---

## 5. Panduan Desain & User Experience (UX)

- **Warna Identitas Peran**:
  - Mahasiswa: Nuansa **Biru / Indigo** (kesan akademis, ramah pengguna).
  - Petugas Sarana Prasarana: Nuansa **Emerald / Teal** (kesan operasional, manajemen aset).
  - Dosen Pembina: Nuansa **Amber / Orange** (kesan verifikasi, otoritas pengawasan).
- **Indikator Status (Badge)**:
  - `DIAJUKAN` / `MENUNGGU_PEMBINA`: Warna Kuning / Oranye.
  - `DISETUJUI`: Warna Biru muda.
  - `DIPINJAM` / `TERPAKAI`: Warna Ungu / Indigo.
  - `DIKEMBALIKAN` / `SELESAI`: Warna Hijau.
  - `DITOLAK` / `DIBATALKAN`: Warna Merah / Abu-abu.
- **Format Lokal Indonesia**:
  - Mata Uang: `Rp 50.000` (menggunakan helper `Intl.NumberFormat('id-ID')`).
  - Tanggal: `20 November 2026` (menggunakan helper format tanggal bahasa Indonesia).

