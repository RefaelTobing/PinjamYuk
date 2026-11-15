# TASK-FE-06: Dashboard Antrean Persetujuan Pembina

## 1. Identitas Task
- **ID Task**: `TASK-FE-06`
- **Fase**: Fase 3 (Modul Dosen Pembina)
- **Komponen**: `AntreanPersetujuanPage`, `CardPengajuanPembina`, `ModalReviewPersetujuan`
- **Aktor**: Dosen Pembina
- **Kebutuhan Fungsional**: FR-11, FR-17, UC10, UC14
- **Tingkat Kesulitan**: Sedang
- **Estimasi Waktu**: 1 Hari

---

## 2. Deskripsi & Tujuan
Membangun antarmuka khusus untuk Dosen Pembina. Dosen Pembina bertanggung jawab meninjau pengajuan peminjaman barang inventaris khusus (misalnya alat laboratorium, sensor praktikum bernilai tinggi, atau perangkat elektronik sensitif yang ditandai `perluPersetujuan = true`). Dosen Pembina dapat melihat detail mahasiswa pemohon, daftar barang, alasan kegiatan, lalu memberikan keputusan **Setujui** atau **Tolak** dengan menyertakan catatan resmi.

---

## 3. Spesifikasi Tampilan & Interaksi

### 3.1 Daftar Antrean Pengajuan Menunggu Persetujuan
- Menampilkan tabel/kartu pengajuan dengan status `MENUNGGU_PEMBINA`.
- Kolom/Informasi:
  - ID Peminjaman & Tanggal Pengajuan.
  - Identitas Mahasiswa (Nama, NIM, Program Studi).
  - Rentang Tanggal Kegiatan & Keperluan.
  - Daftar Barang Khusus yang diajukan beserta jumlahnya.
  - Tombol aksi: `Tinjau Pengajuan`.

### 3.2 Modal Review & Form Keputusan (`ModalReviewPersetujuan`)
- Menampilkan detail lengkap pengajuan dan ketersediaan stok barang.
- Dua Opsi Tindakan:
  - **Tombol Hijau**: `Setujui Pengajuan` (Catatan opsional).
  - **Tombol Merah**: `Tolak Pengajuan` (Input textarea catatan alasan penolakan **wajib diisi** minimal 10 karakter).
- Saat konfirmasi dikirim, memanggil endpoint:
  `POST /api/peminjaman/{id}/persetujuan-pembina`
  dengan payload `{ "setuju": true/false, "catatan": "..." }`.

### 3.3 Tab Riwayat Keputusan Pembina
- Menampilkan daftar pengajuan yang sebelumnya sudah pernah ditinjau oleh pembina (baik disetujui maupun ditolak) beserta catatan historisnya.

---

## 4. Langkah-Langkah Pengerjaan
1. Bangun halaman `AntreanPersetujuanPage.jsx`.
2. Hubungkan pemanggilan API `GET /api/peminjaman?status=MENUNGGU_PEMBINA`.
3. Buat modal dialog interaktif untuk aksi persetujuan / penolakan.
4. Terapkan validasi form penolakan (catatan alasan tidak boleh kosong).
5. Segarkan daftar antrean secara otomatis setelah aksi berhasil dieksekusi.

---

## 5. Kriteria Penerimaan (Acceptance Criteria / DoD)
- [x] Pengajuan yang mengandung barang khusus otomatis muncul pada antrean Dosen Pembina.
- [x] Dosen Pembina dapat menyetujui pengajuan, yang secara otomatis mengubah status transaksi menjadi `DIAJUKAN` (siap diproses Petugas Sarpras).
- [x] Dosen Pembina dapat menolak pengajuan dengan alasan wajib, yang langsung mengubah status transaksi menjadi `DITOLAK`.
- [x] Tampilan responsif dan mudah digunakan oleh dosen di berbagai perangkat (tablet/laptop).

