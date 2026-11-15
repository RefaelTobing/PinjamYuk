# TASK-FE-08: Verifikasi, Serah Terima & Pengembalian Barang

## 1. Identitas Task
- **ID Task**: `TASK-FE-08`
- **Fase**: Fase 4 (Modul Petugas Sarpras)
- **Komponen**: `SirkulasiOperasionalPage`, `ModalVerifikasiPetugas`, `ModalSerahTerima`, `ModalPengembalianBarang`
- **Aktor**: Petugas Sarana dan Prasarana
- **Kebutuhan Fungsional**: FR-12, FR-13, FR-14, FR-15, FR-22, UC09, UC11, UC12, UC16
- **Tingkat Kesulitan**: Tinggi
- **Estimasi Waktu**: 2 Hari

---

## 2. Deskripsi & Tujuan
Membangun pusat sirkulasi operasional bagi Petugas Sarpras untuk memproses transaksi yang sedang berjalan:
1. Verifikasi pengajuan peminjaman barang dan booking ruangan (Setujui / Tolak).
2. Pencatatan serah terima fisik barang saat mahasiswa mengambil inventaris (mencatat kondisi awal).
3. Pencatatan pengembalian fisik barang saat mahasiswa mengembalikan inventaris (mencatat tanggal kembali nyata, memeriksa kondisi fisik akhir setiap unit barang, kalkulasi rincian denda otomatis, dan penutupan transaksi).

---

## 3. Spesifikasi Tampilan & Interaksi

### 3.1 Antrean Verifikasi Pengajuan (`Tab Verifikasi`)
- Menampilkan pengajuan barang berstatus `DIAJUKAN` dan booking berstatus `DIAJUKAN`.
- Tombol: `Verifikasi Pengajuan`.
- Modal aksi: Pilihan **Setuju** atau **Tolak** beserta input teks catatan petugas.

### 3.2 Antrean Serah Terima Barang (`Tab Serah Terima`)
- Menampilkan transaksi berstatus `DISETUJUI` di mana mahasiswa datang untuk mengambil barang.
- Form Modal Serah Terima:
  - Checklist inspeksi kondisi awal per item (Pilihan: `BAIK` / `RUSAK_RINGAN`).
  - Tombol: `Konfirmasi Serah Terima`.
  - Transisi status menjadi `DIPINJAM`.

### 3.3 Antrean Pengembalian & Kalkulasi Denda (`Tab Pengembalian`)
- Menampilkan transaksi berstatus `DIPINJAM`.
- Form Modal Pengembalian:
  - Input: Tanggal Pengembalian Nyata (default hari ini).
  - Pilihan Kondisi Akhir per unit barang:
    - `BAIK` (tanpa denda kondisi)
    - `RUSAK_RINGAN` (denda sesuai tarif subkelas barang)
    - `RUSAK_BERAT` (denda % harga satuan barang)
    - `HILANG` (denda ganti rugi 100% harga satuan barang)
  - **Live Preview Kalkulasi Denda**:
    Menampilkan hitungan otomatis yang dihasilkan dari Backend Java:
    - Hari terlambat = $\max(0, \text{tanggalKembali} - \text{tanggalSelesai})$
    - Denda keterlambatan = $\text{hariTerlambat} \times \text{tarifHarian}$
    - Denda kerusakan/kehilangan
    - **Total Denda Yang Wajib Dibayar**
  - Tombol: `Simpan & Selesaikan Peminjaman`.

---

## 4. Langkah-Langkah Pengerjaan
1. Bangun halaman tab sirkulasi `SirkulasiOperasionalPage.jsx`.
2. Integrasikan endpoint verifikasi pengajuan:
   - `POST /api/peminjaman/{id}/verifikasi-petugas`
   - `POST /api/booking/{id}/verifikasi`
3. Integrasikan endpoint serah terima barang:
   - `POST /api/peminjaman/{id}/serah-terima`
4. Integrasikan endpoint pencatatan pengembalian dan kalkulasi denda:
   - `POST /api/peminjaman/{id}/pengembalian`
5. Tampilkan dialog rincian denda setelah pengembalian sukses dicatat.

---

## 5. Kriteria Penerimaan (Acceptance Criteria / DoD)
- [ ] Petugas dapat menyetujui atau menolak pengajuan baru.
- [ ] Serah terima barang berhasil mengubah status menjadi `DIPINJAM` dan merekam kondisi awal barang.
- [ ] Formulir pengembalian memungkinkan pemilihan kondisi akhir yang berbeda untuk setiap item barang dalam peminjaman multi-item.
- [ ] Sistem menghitung denda secara presisi (keterlambatan + kondisi) dan menampilkan rincian jelas ke petugas sebelum transaksi ditutup.

