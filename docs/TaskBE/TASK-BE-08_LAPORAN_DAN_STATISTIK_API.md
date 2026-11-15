# TASK-BE-08: API Rekapitulasi, Pelaporan & Pelacakan Jatuh Tempo

## 1. Identitas Task
- **ID Task**: `TASK-BE-08`
- **Fase**: Fase 3 (Implementasi Endpoints Bisnis)
- **Komponen**: `sipinjam.api.handler.LaporanHandler`, `sipinjam.layanan.RekapPeminjaman`, `sipinjam.layanan.LayananPeminjaman`
- **Kebutuhan Fungsional**: FR-17, FR-18, FR-25, UC13, UC14, UC15
- **Tingkat Kesulitan**: Mudah - Sedang
- **Estimasi Waktu**: 1 Hari

---

## 2. Deskripsi & Tujuan
Menyediakan endpoint analisis dan rekapitulasi data untuk Petugas Sarpras dan Dosen Pembina, meliputi:
1. Rekap peminjaman barang per kategori (Elektronik, Lab, Furnitur).
2. Tingkat keterlambatan pengembalian (persentase & jumlah kasus).
3. Utilisasi jam pemakaian ruangan (grafik penggunaan slot per jam).
4. Daftar peminjaman yang mendekati atau telah melewati tenggat jatuh tempo (*overdue alerts*).

---

## 3. Spesifikasi Endpoint REST API

### 3.1 `GET /api/laporan/ringkasan`
- **Deskripsi**: Metrik ringkas untuk dashboard utama petugas & pembina.
- **Respons (200 OK)**:
  ```json
  {
    "sukses": true,
    "data": {
      "totalPeminjamanAktif": 5,
      "totalBookingHariIni": 3,
      "totalBarangDipinjam": 8,
      "totalKasusTerlambat": 2,
      "totalDendaTerkumpul": 350000
    }
  }
  ```

### 3.2 `GET /api/laporan/kategori`
- **Deskripsi**: Rekapitulasi jumlah unit barang dipinjam berdasarkan kategori inventaris.
- **Respons**:
  ```json
  {
    "sukses": true,
    "data": [
      { "kategori": "Elektronik", "jumlahPeminjaman": 18, "persentase": 56.25 },
      { "kategori": "Alat Laboratorium", "jumlahPeminjaman": 10, "persentase": 31.25 },
      { "kategori": "Furnitur", "jumlahPeminjaman": 4, "persentase": 12.5 }
    ]
  }
  ```

### 3.3 `GET /api/laporan/utilisasi-ruangan`
- **Deskripsi**: Analisis frekuensi penggunaan ruangan per slot jam operasional (07.00 - 21.00) untuk membantu evaluasi efisiensi fasilitas kampus.

### 3.4 `GET /api/laporan/jatuh-tempo`
- **Deskripsi**: Mengambil daftar peminjaman berstatus `DIPINJAM` yang tanggal selesainya $\le \text{hari ini}$ (peringatan keterlambatan).
- **Respons**:
  ```json
  {
    "sukses": true,
    "data": [
      {
        "id": "PINJAM-004",
        "nim": "21044110002",
        "namaMahasiswa": "Siti Nurhaliza",
        "tanggalSelesai": "2026-11-14",
        "hariTerlambat": 1,
        "estimasiDendaHarian": 15000,
        "daftarBarang": ["Mikroskop Binokuler (1 unit)"]
      }
    ]
  }
  ```

---

## 4. Langkah-Langkah Pengerjaan
1. Buat kelas `sipinjam.api.handler.LaporanHandler`.
2. Manfaatkan method bawaan pada `RekapPeminjaman`:
   - `rekap.jumlahPerKategori(repoPeminjaman.semua())`
   - `rekap.tingkatKeterlambatan(repoPeminjaman.semua())`
   - `layanan.daftarJatuhTempo(LocalDate.now())`
3. Hitung persentase dan rangkum data ke dalam DTO analitik JSON.
4. Pastikan akses hanya diizinkan untuk peran `PETUGAS_SARPRAS` dan `DOSEN_PEMBINA`.

---

## 5. Kriteria Penerimaan (Acceptance Criteria / DoD)
- [x] Endpoint rekapitulasi kategori mengembalikan agregasi data yang sinkron dengan transaksi yang ada di memori/file.
- [x] Endpoint jatuh tempo mampu mendeteksi peminjaman yang melewati tanggal hari ini dan menghitung estimasi denda harian yang berjalan.
- [x] Akses oleh pengguna dengan peran Mahasiswa diblokir dengan HTTP 403 Forbidden.

