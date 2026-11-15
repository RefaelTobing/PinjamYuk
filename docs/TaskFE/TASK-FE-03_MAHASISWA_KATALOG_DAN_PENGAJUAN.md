# TASK-FE-03: Katalog Inventaris, Cek Stok Real-Time & Pengajuan Multi-Item

## 1. Identitas Task
- **ID Task**: `TASK-FE-03`
- **Fase**: Fase 2 (Modul Utama Mahasiswa)
- **Komponen**: `KatalogBarangPage`, `DateRangeFilter`, `BarangCard`, `CartDrawer`, `ModalPengajuan`
- **Aktor**: Mahasiswa
- **Kebutuhan Fungsional**: FR-08, FR-09, FR-10, UC06, UC07
- **Tingkat Kesulitan**: Tinggi
- **Estimasi Waktu**: 2 Hari

---

## 2. Deskripsi & Tujuan
Membangun antarmuka katalog peminjaman barang inventaris kampus untuk mahasiswa. Mahasiswa memilih rentang tanggal peminjaman (mulai & selesai), sistem secara otomatis mengecek ketersediaan stok aktual pada rentang tersebut, mahasiswa dapat memasukkan satu atau lebih barang ke dalam keranjang belanja (*cart*), mengisi alasan keperluan kegiatan, dan mengirim pengajuan peminjaman ke Backend.

---

## 3. Spesifikasi Tampilan & Interaksi

### 3.1 Date Range Selector (Pemeriksaan Stok Dinamis)
- Dua date-picker: `Tanggal Mulai` dan `Tanggal Selesai`.
- **Validasi Klien Awal (R4 & R5)**:
  - Tanggal mulai minimal adalah besok (H-1).
  - Durasi peminjaman maksimal 7 hari.
  - Tanggal selesai tidak boleh lebih awal dari tanggal mulai.
- **Auto Re-Fetch**: Setiap kali rentang tanggal berubah, komponen otomatis memanggil:
  `GET /api/inventaris/barang?mulai=...&selesai=...`
  untuk memperbarui sisa stok tersedia masing-masing barang.

### 3.2 Katalog & Kartu Barang (`BarangCard`)
- Menampilkan:
  - Foto/Ikon representatif sesuai jenis (Elektronik, Lab, Furnitur).
  - Nama dan kode barang.
  - Kategori barang.
  - Status stok:
    - Hijau: Tersedia $\ge 1$ unit.
    - Merah: Habis (stok = 0 pada rentang tanggal tersebut).
  - Badge khusus: `"Perlu Persetujuan Pembina"` (jika barang bernilai tinggi/lab).
  - Tombol: `+ Tambah ke Keranjang` (disabled jika stok 0).

### 3.3 Keranjang Multi-Item (`CartDrawer` / `CartModal`)
- Menampilkan daftar barang yang dipilih beserta kontrol kuantitas ($+$ / $-$).
- Membatasi kuantitas agar tidak melebihi sisa stok yang tersedia.
- Formulir input: `Keperluan Peminjaman` (Textarea, wajib diisi minimal 10 karakter).
- Ringkasan aturan: Peringatan batas maksimal pengajuan aktif (maks. 2 pengajuan).
- Tombol: `Kirim Pengajuan Peminjaman`.

---

## 4. Langkah-Langkah Pengerjaan
1. Buat `CartContext.jsx` untuk menyimpan daftar barang yang dipilih, tanggal peminjaman, dan kuantitas.
2. Bangun halaman `KatalogBarangPage.jsx` dengan filter kategori dan pencarian nama.
3. Integrasikan pemanggilan API cek ketersediaan stok dari Backend Java.
4. Buat drawer/modal keranjang pengajuan multi-item.
5. Tangani respons gagal dari backend (misal jika melanggar R1 status mahasiswa tidak aktif atau R3 memiliki tunggakan denda) dengan modal pesan kesalahan yang informatif.

---

## 5. Kriteria Penerimaan (Acceptance Criteria / DoD)
- [ ] Pengguna dapat memfilter barang berdasarkan rentang tanggal dan melihat sisa stok yang berubah secara dinamis.
- [ ] Validasi tanggal berjalan di sisi klien (minimal H-1 dan maksimal 7 hari).
- [ ] Mahasiswa dapat memilih beberapa jenis barang sekaligus (multi-item) dan mengatur jumlahnya.
- [ ] Pengajuan berhasil terkirim ke `POST /api/peminjaman` dan menghasilkan nomor registrasi peminjaman.
- [ ] Jika mahasiswa melanggar aturan kelayakan (misal melebihi batas 2 pengajuan aktif), pesan error dari server tertampil jelas.

