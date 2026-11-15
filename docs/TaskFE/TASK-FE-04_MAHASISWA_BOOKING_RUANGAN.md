# TASK-FE-04: Visualisasi Slot & Booking Ruangan Interaktif

## 1. Identitas Task
- **ID Task**: `TASK-FE-04`
- **Fase**: Fase 2 (Modul Utama Mahasiswa)
- **Komponen**: `BookingRuanganPage`, `RuanganSelector`, `JadwalSlotGrid`, `ModalBookingRuangan`
- **Aktor**: Mahasiswa
- **Kebutuhan Fungsional**: FR-19, FR-20, FR-21, UC06, UC07
- **Tingkat Kesulitan**: Tinggi
- **Estimasi Waktu**: 2 Hari

---

## 2. Deskripsi & Tujuan
Membangun antarmuka visualisasi ketersediaan ruangan kampus per slot waktu jam (07.00 - 21.00) pada tanggal tertentu. Mahasiswa dapat memilih ruangan, melihat slot mana yang masih kosong dan mana yang sudah terisi, memilih slot berurutan (1 s.d. 4 jam), memasukkan estimasi jumlah peserta dan keperluan, serta mengajukan booking tanpa risiko bentrok jadwal.

---

## 3. Spesifikasi Tampilan & Interaksi

### 3.1 Pilihan Ruangan & Tanggal
- Dropdown/Card pemilih ruangan (Ruang Rapat, Aula, Lab Komputer) lengkap dengan info kapasitas maksimal dan fasilitas (AC, Proyektor, Sound System).
- Date picker tanggal pemakaian (minimal H-3 sesuai aturan R4 pemesanan ruangan).

### 3.2 Visualisasi Matriks Slot Waktu (`JadwalSlotGrid`)
- Menampilkan deretan 14 slot jam (07.00-08.00 hingga 20.00-21.00).
- Kode Warna Interaktif:
  - **Hijau**: Slot `KOSONG` (dapat diklik untuk dipilih).
  - **Merah / Abu Terkunci**: Slot `TERISI` / `TERPAKAI` (menampilkan tooltip keterangan kegiatan, tidak bisa diklik).
  - **Biru Bergaris Terang**: Slot yang sedang `DIPILIH` oleh mahasiswa saat ini.
- Batasan Pilihan:
  - Durasi minimal 1 jam, maksimal 4 jam (Aturan S2).
  - Slot yang dipilih wajib berurutan (kontinu) dalam hari yang sama.

### 3.3 Formulir Konfirmasi Booking (`ModalBookingRuangan`)
- Rangkuman: Ruangan terpilih, tanggal, jam mulai s.d. jam selesai, total durasi.
- Input: `Jumlah Peserta` (Input angka; validasi tidak boleh melebihi kapasitas ruangan sesuai aturan S4).
- Input: `Keperluan Kegiatan` (Textarea).
- Peringatan Denda: Teks peringatan bahwa pembatalan mendadak kurang dari 1 hari sebelum tanggal kegiatan dikenakan denda Rp50.000 (Aturan S6).
- Tombol: `Kirim Pengajuan Booking`.

---

## 4. Langkah-Langkah Pengerjaan
1. Bangun komponen grid visual slot waktu jam (`JadwalSlotGrid.jsx`).
2. Buat logika pemilihan rentang slot kontinu (menghitung `jamMulai` dan `jamSelesai`).
3. Hubungkan dengan endpoint Backend `GET /api/booking/jadwal?kodeRuangan=...&tanggal=...`.
4. Implementasikan modal konfirmasi booking dan kirim payload ke `POST /api/booking`.
5. Tampilkan indikator loading dan penanganan respons gagal (misal 409 Conflict jika slot baru saja diambil orang lain).

---

## 5. Kriteria Penerimaan (Acceptance Criteria / DoD)
- [x] Grid slot jam 07.00 s.d 21.00 tampil rapi dan responsif di layar desktop maupun mobile.
- [x] Slot yang sudah terisi tampil terkunci (disabled) dan tidak dapat dipilih.
- [x] Pengguna tidak dapat memilih durasi melebihi batas 4 jam dalam 1 pengajuan.
- [x] Validasi input peserta mendeteksi jika melebihi kapasitas ruangan dan mencegah pengiriman formulir.
- [x] Pengajuan booking berhasil tersimpan ke backend dan slot tersebut seketika berubah warna menjadi terisi/terkunci pada grid jadwal.

