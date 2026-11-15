# TASK-BE-07: API Siklus Booking Ruangan & Validasi Slot S1-S7

## 1. Identitas Task
- **ID Task**: `TASK-BE-07`
- **Fase**: Fase 3 (Implementasi Endpoints Bisnis)
- **Komponen**: `sipinjam.api.handler.BookingHandler`, `sipinjam.layanan.LayananBookingRuangan`, `sipinjam.aturan.AturanBentrokJadwal`, `sipinjam.aturan.AturanJamOperasional`, `sipinjam.aturan.AturanKapasitasRuang`
- **Kebutuhan Fungsional**: FR-19 s.d. FR-24, UC06, UC07, UC08, UC09
- **Tingkat Kesulitan**: Tinggi
- **Estimasi Waktu**: 2 Hari

---

## 2. Deskripsi & Tujuan
Mengimplementasikan modul pemesanan (booking) ruangan kampus per slot waktu jam. Modul ini bertanggung jawab memetakan jadwal ruangan pada tanggal tertentu, mendeteksi bentrok jadwal (*overlap detection*), menegakkan aturan kapasitas dan jam operasional, menangani verifikasi petugas, serta pembatalan dengan denda otomatis bila dibatalkan mendadak (< H-1).

---

## 3. Aturan Bisnis Slot Ruangan (S1 - S7)

1. **S1 (Jam Operasional)**: Slot hanya boleh berada di rentang **07.00 s.d. 21.00** pada hari yang sama.
2. **S2 (Satuan Slot)**: Jam mulai dan jam selesai kelipatan 60 menit; durasi minimal 1 jam, maksimal 4 jam per pengajuan.
3. **S3 (Deteksi Bentrok / Overlap)**: Dua booking pada ruangan yang sama bentrok jika:
   $$\text{mulai}_1 < \text{selesai}_2 \quad \text{dan} \quad \text{mulai}_2 < \text{selesai}_1$$
   *Catatan: Slot yang berakhir tepat saat slot lain mulai TIDAK dianggap bentrok (contoh: 08.00-10.00 dan 10.00-12.00 adalah sah).*
4. **S4 (Kapasitas)**: Jumlah peserta $\le$ kapasitas maksimal ruangan.
5. **S5 (Kunci Slot)**: Booking berstatus `DIAJUKAN` dan `DISETUJUI` langsung mengunci slot agar tidak diserobot pengguna lain.
6. **S6 (Denda Pembatalan)**: Pembatalan booking oleh mahasiswa kurang dari 1 hari sebelum tanggal pemakaian ($< \text{H}-1$) dikenakan **denda pembatalan sebesar Rp50.000**.
7. **S7 (Ruangan Nonaktif)**: Ruangan nonaktif tidak dapat dibooking.

---

## 4. Spesifikasi Endpoint REST API

### 4.1 `GET /api/booking/jadwal`
- **Deskripsi**: Menampilkan matriks ketersediaan slot ruangan pada tanggal tertentu.
- **Query Params**: `kodeRuangan` (wajib), `tanggal` (wajib, format `YYYY-MM-DD`).
- **Respons (200 OK)**:
  ```json
  {
    "sukses": true,
    "data": {
      "kodeRuangan": "R-RAPAT-01",
      "namaRuangan": "Ruang Rapat Gedung A",
      "tanggal": "2026-11-20",
      "slots": [
        { "jamMulai": "07:00", "jamSelesai": "08:00", "status": "KOSONG" },
        { "jamMulai": "08:00", "jamSelesai": "09:00", "status": "TERISI", "bookingId": "BKG-002", "keperluan": "Rapat BEM" },
        { "jamMulai": "09:00", "jamSelesai": "10:00", "status": "TERISI", "bookingId": "BKG-002", "keperluan": "Rapat BEM" },
        { "jamMulai": "10:00", "jamSelesai": "11:00", "status": "KOSONG" }
      ]
    }
  }
  ```

### 4.2 `POST /api/booking` (Mahasiswa)
- **Deskripsi**: Mengajukan booking ruangan.
- **Request Body**:
  ```json
  {
    "nim": "21044110001",
    "kodeRuangan": "R-AULA-01",
    "tanggal": "2026-11-25",
    "jamMulai": "09:00",
    "jamSelesai": "12:00",
    "jumlahPeserta": 50,
    "keperluan": "Seminar Kewirausahaan Mahasiswa"
  }
  ```
- **Penolakan Error**:
  - `400 Bad Request`: Jika jam di luar 07.00-21.00, durasi > 4 jam, atau peserta melebihi kapasitas ruangan.
  - `409 Conflict`: Jika slot waktu yang diminta sudah terisi / bentrok.

### 4.3 `GET /api/booking`
- **Query Params**: `nim`, `status`, `tanggal`. Mengambil riwayat booking.

### 4.4 `POST /api/booking/{id}/verifikasi` (Petugas Sarpras)
- **Request Body**: `{ "setuju": true, "catatan": "Ruangan siap digunakan" }`
- **Transisi**: `DIAJUKAN` $\to$ `DISETUJUI` atau `DITOLAK`.

### 4.5 `POST /api/booking/{id}/batal` (Mahasiswa)
- **Deskripsi**: Membatalkan booking sebelum jam pemakaian.
- **Kalkulasi Denda Otomatis**:
  - Jika dibatalkan $\ge \text{H}-1$: Denda = Rp0.
  - Jika dibatalkan $< \text{H}-1$: Denda = Rp50.000 (langsung dicatat sebagai tunggakan denda mahasiswa).

---

## 5. Kriteria Penerimaan (Acceptance Criteria / DoD)
- [x] Jadwal slot jam 07.00 s.d 21.00 tergenerate dengan benar dan menampilkan status KOSONG vs TERISI.
- [x] Pengajuan booking yang saling tumpang tindih waktu pada ruangan yang sama ditolak secara otomatis (*fail fast*).
- [x] Booking dengan jumlah peserta melebihi kapasitas ruangan ditolak dengan pesan kesalahan yang jelas.
- [x] Pembatalan mendadak ($< \text{H}-1$) menghasilkan denda Rp50.000 pada respon dan tercatat di profil mahasiswa.
- [x] Perubahan data tersimpan permanen di `data/booking.txt`.

