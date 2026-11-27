# TASK-FE-04: Visualisasi Slot Waktu & Booking Ruangan Mahasiswa
## Implementasi Pemesanan Ruangan Kampus Interaktif (S1 – S7)

---

## 1. Ringkasan Tugas
Membangun antarmuka pemesanan fasilitas ruangan kampus bagi mahasiswa, mencakup pemilihan tanggal pemakaian, visualisasi status 14 slot jam (07.00 – 21.00 WIB) per ruangan, deteksi bentrok jadwal interaktif, input keperluan dan estimasi peserta, serta eksekusi pengajuan booking ke Backend Java.

---

## 2. Acuan Visual & Aturan Bisnis
* **Header Navigasi**: Tab `Booking Ruangan` aktif pada pill navigasi header mahasiswa.
* **Komposisi Tampilan**:
  - **Daftar Pilihan Ruangan**: Kartu informasi ruangan (nama ruangan, kode, kapasitas maksimum peserta, fasilitas yang tersedia seperti proyektor, AC, sound system).
  - **Panel Pemilih Tanggal**: Kontrol tanggal pemakaian untuk melihat ketersediaan jadwal pada hari tertentu.
  - **Grid Visualisasi 14 Slot Jam**:
    - Jam operasional: `07:00 - 08:00` s.d. `20:00 - 21:00` (14 slot berurutan).
    - Status Warna Slot:
      - Hijau muda / Putih: `TERSEDIA` (Dapat dipilih).
      - Biru terang: `DIPILIH` (Sedang dipilih oleh mahasiswa).
      - Merah muda / Abu-abu: `TERPAKAI / DIBOOKING` (Dinonaktifkan, menampilkan info peminjam/acara singkat).
  - **Form Detail Pemesanan**:
    - Input `Jumlah Peserta`: Dilengkapi validasi agar tidak melebihi kapasitas ruangan (`AturanKapasitasRuang`).
    - Input `Keperluan Acara`: Textarea deskripsi kegiatan mahasiswa / organisasi.
    - Peringatan Denda Pembatalan: Alert box kuning yang mengingatkan bahwa pembatalan kurang dari H-1 dikenakan denda administratif Rp50.000.
    - Tombol Aksi: `[📅 Ajukan Booking Ruangan]` warna biru tua solid.

---

## 3. Rincian Pekerjaan Teknis

### A. Pengambilan Data Ketersediaan Slot
1. Saat pengguna memilih ruangan dan tanggal:
   - Kirim permintaan `GET /api/booking/jadwal?kodeRuangan=...&tanggal=YYYY-MM-DD`.
   - Backend Java mengembalikan status ke-14 slot jam (apakah ada transaksi yang telah berstatus `DISETUJUI` atau `DIGUNAKAN`).
2. Slot yang sudah terisi otomatis di-disable sehingga pengguna tidak dapat mengklik dua kali pada waktu yang sama.

### B. Validasi Sisi Klien & Pengiriman Data
1. Mahasiswa memilih satu atau beberapa slot jam yang berurutan (misal: 09:00 - 12:00).
2. Memvalidasi jumlah peserta $\le$ kapasitas ruangan fisik.
3. Mengirim permintaan `POST /api/booking` dengan payload:
   ```json
   {
     "kodeRuangan": "R-101",
     "tanggal": "2026-11-26",
     "slotMulai": 3,
     "slotSelesai": 5,
     "keperluan": "Seminar Teknologi Informasi Himpunan",
     "jumlahPeserta": 45
   }
   ```
4. Jika sukses, tampilkan notifikasi toast berhasil dan arahkan ke tab `Riwayat`.

---

## 4. Checklist Penerimaan Tugas (Definition of Done)
- [x] Grid 14 slot jam (07.00 - 21.00) ter-render rapi dengan kode warna status yang jelas.
- [x] Deteksi bentrok jadwal berfungsi otomatis saat tanggal atau ruangan diganti.
- [x] Validasi kapasitas ruangan mencegah pengajuan peserta yang berlebihan.
- [x] Alert denda pembatalan Rp50.000 terpasang jelas di form pemesanan.
- [x] Pengajuan booking berhasil terkirim dan tercatat di database file backend.
