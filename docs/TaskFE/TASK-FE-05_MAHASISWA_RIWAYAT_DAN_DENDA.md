# TASK-FE-05: Slide-Over Drawer Keranjang & Riwayat Denda Mahasiswa
## Implementasi Sesuai Mockup `katalog_inventaris_keranjang_pengajuan.png` & `riwayat_denda_mahasiswa.png`

---

## 1. Ringkasan Tugas
Membangun dua komponen vital pengalaman pengguna mahasiswa:
1. **Slide-Over Drawer Keranjang Pengajuan**: Panel samping kanan mengambang untuk meninjau item terpilih, checklist prasyarat otomatis, input keperluan, dan pengajuan multi-item.
2. **Dashboard Riwayat & Denda**: Kartu ringkasan metrik kuota dan tunggakan denda, filter tab riwayat, tabel transaksi, status badges, serta aksi pembatalan berpenalti.

---

## 2. Acuan Visual Mockup

### A. Slide-Over Drawer (`katalog_inventaris_keranjang_pengajuan.png`)
* **Struktur Drawer Kanan**:
  - Lebar: `w-full max-w-md` berlatar putih dengan bayangan tebal `shadow-2xl` di atas *backdrop blur* gelap.
  - **Header**: Judul `Keranjang Pengajuan`, badge counter biru `2 Item`, dan tombol tutup silang (`X`).
  - **Banner Rentang Peminjaman**: Kotak berlatar abu-abu/biru muda dengan ikon kalender, teks tanggal (contoh: `24 Nov 2026 – 26 Nov 2026`), dan badge durasi `2 Hari`.
  - **Daftar Barang Terpilih (Cards)**:
    - Judul barang (contoh: `Proyektor Epson EB-X400`), kode & kategori (`PROY-01 • Elektronik`), badge `Perlu Pembina` (peach) atau `Mandiri` (mint).
    - Tarif denda per hari (contoh: `Denda: Rp10.000/hari`).
    - Ikon tempat sampah di kanan untuk menghapus barang dari keranjang.
    - Kontrol stepper kuantitas: `[- 1 +]`.
  - **Checklist Prasyarat Otomatis (Kotak Hijau Mint)**:
    - Latar hijau muda lembut (`bg-emerald-50 border border-emerald-200 rounded-xl p-3.5`).
    - 3 Indikator checklist: `✓ Mahasiswa Aktif`, `✓ Kuota Pinjam 1/2`, `✓ Bebas Denda`.
    - Subteks: `Seluruh prasyarat peminjaman mandiri terpenuhi.`
  - **Input Form Keperluan Kegiatan**:
    - Label `Keperluan Kegiatan` di kiri dan indikator abu-abu `Wajib diisi` di kanan.
    - Textarea dengan placeholder deskripsi kegiatan.
    - Subteks panduan: `Deskripsikan acara secara ringkas untuk verifikasi bagian kemahasiswaan.`
  - **Tombol Eksekusi Pengajuan**:
    - Tombol lebar penuh warna biru tua solid: `[✈ Ajukan Peminjaman]`.
    - Teks keterangan di bawah tombol: `Persetujuan pembina akan diteruskan secara otomatis.`

### B. Dashboard Riwayat & Denda (`riwayat_denda_mahasiswa.png`)
* **Header & Breadcrumbs**:
  - Breadcrumbs: `AKUN REFAEL > AKTIVITAS PEMINJAMAN` font kecil abu-abu.
  - Judul: `Riwayat & Denda` (`text-3xl font-extrabold text-slate-900`).
  - Pojok kanan: Info identitas `NIM: 210401092 • S-1 Teknik Informatika`.
* **3 Kartu Ringkasan Metrik (Top Stat Cards)**:
  1. **Peminjaman Aktif**: Ikon kotak arsip biru, angka `1 / 2 Kuota`, subteks `Maks. 2 peminjaman simultan`.
  2. **Booking Ruangan**: Ikon gedung ungu, angka `1 Jadwal`, subteks `Ruang Rapat R-101`.
  3. **Tunggakan Denda**: Ikon dompet hijau mint, angka `Rp 0` + badge hijau `• Bebas Denda`, subteks `Status akun tertib & aktif`.
* **Bilah Filter Tab Riwayat**:
  - Pilihan filter: `Semua`, `Peminjaman Barang`, `Booking Ruangan`.
  - Teks counter kanan: `Menampilkan 3 Transaksi`.
* **Tabel Riwayat Transaksi Minimalist**:
  - Kolom: `ID TRANSAKSI`, `ITEM / RUANGAN`, `JADWAL`, `STATUS`, `AKSI`.
  - Status Badges:
    - `• Menunggu Pembina`: Pill peach/kuning.
    - `• Disetujui`: Pill biru muda.
    - `• Dikembalikan`: Pill hijau mint.
    - `• Terlambat`: Pill merah rose.
  - Tombol Aksi:
    - `Detail →` untuk melihat rincian item.
    - `⊗ Batalkan` (pill merah muda border tipis) untuk membatalkan pengajuan.
    - `Rincian Denda (Rp10.000)` jika memiliki denda.

---

## 3. Rincian Pekerjaan Teknis

### A. Pengajuan Multi-Item via Drawer
1. Mahasiswa dapat menambahkan berbagai macam barang ke keranjang (`CartContext`).
2. Sebelum submit, frontend mengecek:
   - Apakah tanggal mulai dan selesai valid (durasi $\le 7$ hari).
   - Apakah textarea keperluan sudah diisi.
3. Kirim permintaan `POST /api/peminjaman`:
   ```json
   {
     "tanggalMulai": "2026-11-24",
     "tanggalSelesai": "2026-11-26",
     "keperluan": "Workshop Pemrograman Web Himpunan",
     "items": [
       { "kodeBarang": "PROY-01", "jumlah": 1 },
       { "kodeBarang": "AUD-02", "jumlah": 2 }
     ]
   }
   ```
4. Jika salah satu barang membutuhkan izin pembina, sistem otomatis menandai status awal sebagai `MENUNGGU_PEMBINA`. Jika semua barang biasa, status langsung menjadi `DIAJUKAN`.

### B. Pembatalan Transaksi & Deteksi Penalti
1. Jika status masih `DIAJUKAN` atau `MENUNGGU_PEMBINA`, tombol `Batalkan` dapat diklik bebas tanpa biaya.
2. Jika booking ruangan dibatalkan kurang dari H-1 pemakaian, modal konfirmasi memunculkan peringatan denda pembatalan Rp50.000 sebelum memanggil `POST /api/booking/{id}/batal`.

---

## 4. Checklist Penerimaan Tugas (Definition of Done)
- [x] Tampilan drawer keranjang persis 100% dengan `katalog_inventaris_keranjang_pengajuan.png`.
- [x] Checklist hijau otomatis memverifikasi status mahasiswa aktif dan batas kuota.
- [x] Tampilan halaman riwayat persis 100% dengan `riwayat_denda_mahasiswa.png`.
- [x] Tiga kartu metrik menampilkan data kuota dan status bebas denda secara akurat.
- [x] Aksi batalkan transaksi berfungsi baik untuk peminjaman barang maupun booking ruangan.
