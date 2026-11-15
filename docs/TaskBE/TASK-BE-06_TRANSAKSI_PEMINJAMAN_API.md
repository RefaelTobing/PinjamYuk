# TASK-BE-06: API Siklus Peminjaman Barang & Validasi Aturan R1-R5

## 1. Identitas Task
- **ID Task**: `TASK-BE-06`
- **Fase**: Fase 3 (Implementasi Endpoints Bisnis)
- **Komponen**: `sipinjam.api.handler.PeminjamanHandler`, `sipinjam.layanan.LayananPeminjaman`, `sipinjam.aturan.ValidatorPeminjaman`, `sipinjam.layanan.KalkulatorDenda`
- **Kebutuhan Fungsional**: FR-08 s.d. FR-18, UC07, UC08, UC09, UC10, UC11, UC12, UC16
- **Tingkat Kesulitan**: Tinggi
- **Estimasi Waktu**: 2 - 3 Hari

---

## 2. Deskripsi & Tujuan
Mengimplementasikan seluruh siklus hidup transaksi peminjaman barang inventaris kampus, mulai dari pengajuan multi-item oleh mahasiswa, eksekusi validasi aturan bisnis kelayakan peminjam (R1-R5), persetujuan dosen pembina (bila ada barang wajib pembina), verifikasi petugas, pencatatan serah terima kondisi awal, pencatatan pengembalian kondisi akhir, hingga kalkulasi denda otomatis.

---

## 3. Aturan Bisnis yang Wajib Divalidasi (PBO Rule Engine)

Sebelum pengajuan disimpan, `ValidatorPeminjaman` mengeksekusi kumpulan objek `AturanPeminjaman` secara polimorfik:
- **R1 (Status Mahasiswa)**: Peminjam harus mahasiswa aktif.
- **R2 (Maksimal Pengajuan Aktif)**: Maksimal 2 pengajuan aktif sekaligus.
- **R3 (Tunggakan Denda)**: Tidak boleh memiliki denda yang belum lunas.
- **R4 (Batas Waktu Pengajuan)**: Pengajuan barang minimal H-1 sebelum tanggal mulai kegiatan.
- **R5 (Durasi Maksimal)**: Durasi peminjaman barang maksimal 7 hari.
- **Ketersediaan Stok**: Sisa stok barang pada rentang tanggal harus $\ge$ jumlah yang diajukan.

---

## 4. Spesifikasi Endpoint REST API

### 4.1 `POST /api/peminjaman` (Mahasiswa)
- **Deskripsi**: Mengajukan peminjaman satu atau beberapa barang (multi-item).
- **Request Body**:
  ```json
  {
    "nim": "21044110001",
    "tanggalMulai": "2026-11-20",
    "tanggalSelesai": "2026-11-22",
    "keperluan": "Workshop Pemrograman Mobile Himpunan Mahasiswa",
    "items": [
      { "kodeBarang": "PROY-01", "jumlah": 1 },
      { "kodeBarang": "SPK-01", "jumlah": 2 }
    ]
  }
  ```
- **Alur Logika**:
  - Validasi R1-R5 via `ValidatorPeminjaman`.
  - Jika ada barang berstatus `perluPersetujuan = true`, status awal menjadi `MENUNGGU_PEMBINA`.
  - Jika semua barang reguler, status awal menjadi `DIAJUKAN` (menunggu verifikasi petugas).
- **Respons Gagal**: Status HTTP 400 Bad Request dengan nama aturan yang dilanggar.

### 4.2 `GET /api/peminjaman`
- **Query Params**: `status`, `nim`, `perluPembina`, `jatuhTempo`.
- **Role Filtering**:
  - Mahasiswa hanya dapat melihat pengajuannya sendiri.
  - Petugas Sarpras dapat melihat seluruh pengajuan.
  - Dosen Pembina dapat melihat antrean barang yang butuh approval.

### 4.3 `POST /api/peminjaman/{id}/persetujuan-pembina` (Dosen Pembina)
- **Request Body**: `{ "setuju": true, "catatan": "Disetujui untuk kegiatan resmi prodi" }`
- **Transisi**: `MENUNGGU_PEMBINA` $\to$ `DIAJUKAN` (jika setuju) atau `DITOLAK`.

### 4.4 `POST /api/peminjaman/{id}/verifikasi-petugas` (Petugas Sarpras)
- **Request Body**: `{ "setuju": true, "catatan": "Unit fisik telah dipersiapkan" }`
- **Transisi**: `DIAJUKAN` $\to$ `DISETUJUI` (jika setuju) atau `DITOLAK`.

### 4.5 `POST /api/peminjaman/{id}/serah-terima` (Petugas Sarpras)
- **Deskripsi**: Mencatat penyerahan barang ke mahasiswa dan merekam kondisi awal (BAIK / RUSAK_RINGAN).
- **Transisi**: `DISETUJUI` $\to$ `DIPINJAM`.

### 4.6 `POST /api/peminjaman/{id}/pengembalian` (Petugas Sarpras)
- **Deskripsi**: Mencatat pengembalian barang, kondisi akhir per item, menghitung denda otomatis lewat `KalkulatorDenda`, dan menutup transaksi.
- **Request Body**:
  ```json
  {
    "tanggalKembali": "2026-11-23",
    "kondisiAkhir": {
      "PROY-01": "BAIK",
      "SPK-01": "RUSAK_RINGAN"
    }
  }
  ```
- **Respons (200 OK)**:
  ```json
  {
    "sukses": true,
    "pesan": "Pengembalian berhasil dicatat",
    "data": {
      "id": "PINJAM-001",
      "status": "DIKEMBALIKAN",
      "hariTerlambat": 1,
      "dendaTerlambat": 20000,
      "dendaKondisi": 100000,
      "totalDenda": 120000,
      "rincian": "Terlambat 1 hari: Rp20.000; Kerusakan SPK-01: Rp100.000"
    }
  }
  ```

### 4.7 `POST /api/peminjaman/{id}/batal` (Mahasiswa)
- **Deskripsi**: Membatalkan pengajuan sebelum barang diserahterimakan (hanya status `MENUNGGU_PEMBINA`, `DIAJUKAN`, `DISETUJUI`).

---

## 5. Kriteria Penerimaan (Acceptance Criteria / DoD)
- [ ] Pengajuan yang melanggar aturan R1-R5 berhasil digagalkan dengan pesan spesifik (misal: "Durasi peminjaman melebihi 7 hari").
- [ ] Pengajuan yang berisi barang bertanda perlu persetujuan pembina otomatis masuk antrean pembina terlebih dahulu.
- [ ] Transisi status mengikuti siklus resmi: `MENUNGGU_PEMBINA` $\to$ `DIAJUKAN` $\to$ `DISETUJUI` $\to$ `DIPINJAM` $\to$ `DIKEMBALIKAN`.
- [ ] Denda keterlambatan dan denda kerusakan dihitung otomatis dan akurat sesuai jenis kelas polimorfik barang (`BarangElektronik`, `AlatLaboratorium`, `BarangFurnitur`).
- [ ] Data perubahan tersimpan permanen ke file `data/peminjaman.txt`.

