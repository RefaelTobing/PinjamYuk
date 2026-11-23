# ALUR PENGERJAAN FRONTEND (FE BEBAS) — SIPINJAM (PINJAMYUK)
## Berbasis Mockup Baru: Modern Academic SaaS UI System

Dokumen ini memetakan arsitektur, panduan desain visual, dan alur pengerjaan **Frontend (FE Bebas)** untuk sistem **SIPINJAM (Sistem Informasi Peminjaman Inventaris, Sarana Prasarana, dan Ruangan Kampus)**. Seluruh antarmuka dirombak total mengacu pada **8 berkas mockup resmi** yang berada di direktori `frontend/MockUpPinjamYuk/`.

---

## 1. Referensi Mockup Desain (`frontend/MockUpPinjamYuk/`)

| No | Berkas Mockup | Modul / Halaman | Pengguna Sasaran |
|:--:|---|---|---|
| 1 | `halaman_login_sipinjam.png` | Autentikasi Masuk & Registrasi Mahasiswa | Semua Pengguna (Publik) |
| 2 | `katalog_inventaris_mahasiswa.png` | Katalog Inventaris & Pengecekan Sisa Stok | Mahasiswa |
| 3 | `katalog_inventaris_keranjang_pengajuan.png` | Slide-Over Drawer Keranjang & Checklist Prasyarat | Mahasiswa |
| 4 | `riwayat_denda_mahasiswa.png` | Dashboard Aktivitas, Riwayat Transaksi & Denda | Mahasiswa |
| 5 | `persetujuan_dosen_pembina_minimalist.png` | Antrean Rekomendasi Aset Bernilai Tinggi / Lab | Dosen Pembina |
| 6 | `master_data_fasilitas_petugas_sarpras.png` | Manajemen Fasilitas (Inventaris & Ruangan) | Petugas Sarana Prasarana |
| 7 | `sirkulasi_inspeksi_pengembalian_petugas_sarpras.png` | Operasional Sirkulasi & Modal Inspeksi Fisik Denda | Petugas Sarana Prasarana |
| 8 | `monitoring_laporan_sirkulasi_petugas_sarpras.png` | Analitik Sirkulasi, Jatuh Tempo & Rekap Denda | Petugas Sarpras & Pimpinan |

---

## 2. Design System & Token Visual Mockup

### A. Palet Warna (Role-Based Theme System)
Frontend menerapkan sistem warna peran (*role-based accents*) untuk membedakan konteks pengguna secara instan:

* **Dasar / Netral**:
  - Halaman Utama: `#F8FAFC` (Slate-50)
  - Card & Permukaan: `#FFFFFF` murni dengan border `border-slate-200/80` dan *soft elevation shadow* (`shadow-sm` hingga `shadow-md shadow-slate-100`).
  - Latar Login: Dot-grid pattern halus (`radial-gradient(#CBD5E1 1px, transparent 1px)` dengan ukuran grid `24px 24px`).
  - Teks Utama: `#0F172A` (Slate-900), Teks Sekunder: `#475569` (Slate-600), Placeholder/Garis: `#94A3B8` (Slate-400).

* **Aksen Peran Pengguna**:
  - 🔵 **Mahasiswa (Peminjam)**:
    - Primary: `#1D4ED8` (Blue-700), hover `#1E40AF` (Blue-800).
    - Nav Active Pill: `#EFF6FF` (Blue-50) dengan teks `#1D4ED8` (Blue-700).
    - Badge Navbar: `Kampus` (Pill latar `#DBEAFE` teks `#1D4ED8`).
  - 🟢 **Petugas Sarana Prasarana**:
    - Primary: `#065F46` (Emerald-800), hover `#047857` (Emerald-700).
    - Nav Active Pill: `#D1FAE5` (Emerald-100) dengan teks `#065F46` (Emerald-900).
    - Badge Navbar: `Petugas` (Pill latar `#D1FAE5` teks `#065F46`).
  - 🟠 **Dosen Pembina**:
    - Primary: `#78350F` (Amber-900), hover `#92400E` (Amber-800).
    - Nav Active Pill: `#FEF3C7` (Amber-100) dengan teks `#78350F` (Amber-900).
    - Badge Navbar: `Dosen Pembina` (Pill latar `#FEF3C7` teks `#78350F`).

* **Status Semantik (Badges & Alerts)**:
  - `Perlu Pembina` / `Menunggu Pembina` / `Perlu Follow-up`: `#FEF3C7` (Amber-100) / Teks `#92400E` (Amber-800).
  - `Mandiri` / `Disetujui` / `Dikembalikan` / `Bebas Denda`: `#D1FAE5` (Emerald-100) / Teks `#065F46` (Emerald-800).
  - `Dipinjam` / `Sirkulasi Aktif`: `#DBEAFE` (Blue-100) / Teks `#1D4ED8` (Blue-700).
  - `Terlambat` / `Jatuh Tempo` / `Batalkan`: `#FFE4E6` (Rose-100) / Teks `#BE123C` (Rose-700).

### B. Tipografi
- **Font Utama**: Modern Geometric Sans-serif (`Plus Jakarta Sans` atau `Inter`).
- **Skala Ukuran**:
  - Header Halaman: `text-2xl` s.d. `text-3xl font-extrabold tracking-tight text-slate-900`.
  - Subtitle / Breadcrumb: `text-xs uppercase font-bold tracking-wider text-slate-400`.
  - Judul Kartu Barang / Ruangan: `text-base font-bold text-slate-900`.
  - Kode Aset & Kategori: `text-xs font-semibold text-slate-500` (contoh: `PROY-01 • Elektronik`).
  - Metrik Angka: `text-3xl font-black text-slate-900`.
  - Nominal Denda: `text-xl font-bold text-rose-600`.

### C. Komponen UI Khas Mockup
1. **Floating Segmented Navigation Bar**:
   Navbar putih menempel di bagian atas (*sticky*) dengan logo 3D box, kapsul navigasi bersegmen di tengah, tombol keranjang mengambang dengan counter, dan kapsul avatar pengguna di pojok kanan.
2. **Interactive 3-Column Asset Card Grid**:
   Kartu barang dengan area ilustrasi perangkat di bagian atas, badge status di pojok kanan atas, indikator sisa stok dinamis, serta tombol aksi stepper kuantitas.
3. **Slide-Over Drawer (Keranjang Pengajuan)**:
   Drawer geser dari kanan layar berlatar belakang blur, dilengkapi checklist prasyarat otomatis hijau (`✓ Mahasiswa Aktif`, `✓ Kuota Pinjam 1/2`, `✓ Bebas Denda`) dan textarea keperluan kegiatan.
4. **Modal Dialog Inspeksi Pengembalian Fisik**:
   Dialog penilaian kondisi per barang dengan penghitungan denda keterlambatan dan kerusakan fisik secara real-time.

---

## 3. Roadmap Tahapan Pengerjaan Frontend

```
[FASE 1: Fondasi UI, Theme Token & Autentikasi]
  ├── TASK-FE-01: Inisialisasi Vite, Tailwind CSS v4, Token Warna Mockup & API Service Client
  └── TASK-FE-02: Halaman Login & Registrasi Modern Minimalist (halaman_login_sipinjam.png)
        │
[FASE 2: Shell Layout Universal & Katalog Mahasiswa]
  ├── TASK-FE-03: Header Navbar Universal, Kapsul Profil & Segmented Nav Tabs 3 Peran
  ├── TASK-FE-04: Katalog Inventaris 3-Kolom, Filter Tanggal & Pengecekan Sisa Stok Dinamis
  └── TASK-FE-05: Slide-Over Drawer Keranjang Pengajuan, Validasi Checklist & Form Keperluan
        │
[FASE 3: Booking Ruangan & Riwayat Transaksi Mahasiswa]
  └── TASK-FE-06: Manajemen Slot Jam 07.00-21.00 & Dashboard Riwayat/Denda Mahasiswa
        │
[FASE 4: Modul Dosen Pembina & Petugas Sarpras]
  ├── TASK-FE-07: Dashboard Antrean Persetujuan Dosen Pembina (Aset Lab & Bernilai Tinggi)
  ├── TASK-FE-08: Master Data Fasilitas Petugas (Inventaris, Ruangan, Tarif & Ekspor)
  └── TASK-FE-09: Sirkulasi Operasional & Modal Inspeksi Pengembalian Fisik (Hitung Denda Otomatis)
        │
[FASE 5: Analitik, Monitoring & Pengujian Integrasi End-to-End]
  └── TASK-FE-10: Dashboard Monitoring Laporan Sirkulasi, Jatuh Tempo & Uji E2E Java Backend
```

---

## 4. Daftar Tugas Rinci (`docs/TaskFE/`)

| File Task | Nama Modul / Dokumen | Referensi Mockup | Fokus Utama |
|:---:|---|---|---|
| [TASK-FE-01](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskFE/TASK-FE-01_SETUP_PROJECT_DAN_ENV.md) | Setup Project, Token Warna & API Client | Desain Sistem Global | Konfigurasi Tailwind v4, palet peran, Lucide Icons, dan Axios client terhubung ke Java 8080. |
| [TASK-FE-02](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskFE/TASK-FE-02_AUTH_ROUTING_DAN_LAYOUT.md) | Halaman Login & Registrasi Minimalist | `halaman_login_sipinjam.png` | Dot-grid background, floating card, tab Masuk/Daftar, password toggle, dan tombol demo 3 peran. |
| [TASK-FE-03](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskFE/TASK-FE-03_MAHASISWA_KATALOG_DAN_PENGAJUAN.md) | Navbar Universal & Katalog Inventaris | `katalog_inventaris_mahasiswa.png` | Floating segmented navbar, search & date range filter bar, 3-column asset cards, stepper stok. |
| [TASK-FE-04](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskFE/TASK-FE-04_MAHASISWA_BOOKING_RUANGAN.md) | Grid Slot Jam & Booking Ruangan | Desain Ruangan Kampus | Visualisasi 14 slot jam (07.00-21.00), deteksi bentrok jadwal, form kapasitas, dan submit booking. |
| [TASK-FE-05](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskFE/TASK-FE-05_MAHASISWA_RIWAYAT_DAN_DENDA.md) | Slide-Over Drawer & Riwayat Mahasiswa | `katalog_inventaris_keranjang_pengajuan.png` & `riwayat_denda_mahasiswa.png` | Drawer keranjang kanan, checklist prasyarat hijau, card metrik kuota, tabel riwayat, denda tagihan. |
| [TASK-FE-06](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskFE/TASK-FE-06_DOSEN_PEMBINA_APPROVAL.md) | Antrean Persetujuan Pembina | `persetujuan_dosen_pembina_minimalist.png` | Kartu pengajuan bernilai tinggi, badge estimasi nilai aset, dialog konfirmasi tolak/setuju. |
| [TASK-FE-07](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskFE/TASK-FE-07_PETUGAS_MASTER_DATA.md) | Master Data Fasilitas Petugas | `master_data_fasilitas_petugas_sarpras.png` | Tab Inventaris/Ruangan, modal CRUD barang dengan polimorfisme kategori, tabel tarif denda, ekspor data. |
| [TASK-FE-08](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskFE/TASK-FE-08_PETUGAS_VERIFIKASI_DAN_OPERASIONAL.md) | Sirkulasi & Modal Inspeksi Denda | `sirkulasi_inspeksi_pengembalian_petugas_sarpras.png` | Verifikasi operasional, serah terima kondisi awal, modal inspeksi kondisi fisik barang & denda real-time. |
| [TASK-FE-09](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskFE/TASK-FE-09_PETUGAS_MONITORING_DAN_LAPORAN.md) | Monitoring Laporan & Rekap Sirkulasi | `monitoring_laporan_sirkulasi_petugas_sarpras.png` | 3 kartu metrik ringkasan, tabel jatuh tempo prioritas, aksi kirim pengingat, dan unduh rekap sirkulasi. |
| [TASK-FE-10](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskFE/TASK-FE-10_INTEGRASI_E2E_DAN_DEMO_READINESS.md) | Integrasi End-to-End, Testing & Demo | Semua Mockup Terintegrasi | Pengujian alur lengkap antar-peran, penanganan error toast, transisi animasi, dan skenario presentasi live. |

---

## 5. Hubungan Arsitektur Frontend ke Backend Java REST API

Frontend berkomunikasi murni melalui RESTful JSON API via HTTP ke Backend Java (`http://localhost:8080/api`). Semua aturan bisnis (R1-R5, S1-S7) divalidasi oleh Backend, sementara Frontend bertugas menyajikan antarmuka pengguna yang sangat responsif, intuitif, dan sesuai mockup.
