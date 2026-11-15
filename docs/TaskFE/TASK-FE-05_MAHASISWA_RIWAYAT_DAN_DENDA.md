# TASK-FE-05: Pelacakan Riwayat, Stepper Status & Manajemen Denda

## 1. Identitas Task
- **ID Task**: `TASK-FE-05`
- **Fase**: Fase 2 (Modul Utama Mahasiswa)
- **Komponen**: `RiwayatMahasiswaPage`, `TimelineStatusStepper`, `CardRincianDenda`, `ModalBatalPengajuan`
- **Aktor**: Mahasiswa
- **Kebutuhan Fungsional**: FR-13, FR-15, FR-16, FR-18, FR-23, UC08, UC13
- **Tingkat Kesulitan**: Sedang
- **Estimasi Waktu**: 1.5 Hari

---

## 2. Deskripsi & Tujuan
Membangun halaman riwayat bagi mahasiswa untuk memantau status seluruh pengajuan peminjaman barang dan booking ruangan yang pernah diajukan. Halaman ini juga berfungsi sebagai pusat transparansi rincian denda (keterlambatan/kerusakan), serta menyediakan aksi pembatalan pengajuan dengan dialog konfirmasi dan peringatan denda pembatalan.

---

## 3. Spesifikasi Tampilan & Interaksi

### 3.1 Tab Riwayat Ganda
- Tab 1: **Peminjaman Barang** (Daftar kartu peminjaman barang).
- Tab 2: **Booking Ruangan** (Daftar kartu booking ruangan).

### 3.2 Visual Stepper Status Peminjaman (`TimelineStatusStepper`)
Menampilkan progres visual transisi status:
$$\text{Diajukan / Menunggu Pembina} \longrightarrow \text{Disetujui} \longrightarrow \text{Sedang Dipinjam} \longrightarrow \text{Dikembalikan (Selesai)}$$
- Jika status `DITOLAK`: Tampilkan badge merah beserta catatan alasan penolakan dari petugas/pembina.
- Jika status `DIPINJAM`: Tampilkan countdown sisa hari menuju tenggat tanggal selesai. Jika melewati tenggat, tampilkan tanda waspada keterlambatan (overdue).

### 3.3 Kartu Rincian Denda (`CardRincianDenda`)
- Menampilkan rincian tagihan jika terdapat denda:
  - Denda keterlambatan (jumlah hari $\times$ tarif harian per jenis barang).
  - Denda kondisi barang (biaya kerusakan fisik/kehilangan).
  - Denda pembatalan booking mendadak ($< \text{H}-1$ sebesar Rp50.000).
- Total denda dan status pelunasan.

### 3.4 Modal Pembatalan Pengajuan / Booking (`ModalBatalPengajuan`)
- Tombol `Batalkan Pengajuan` hanya aktif jika status transaksi belum masuk fase serah terima / belum berjalan.
- Khusus Booking Ruangan:
  - Jika pembatalan dilakukan $\ge \text{H}-1$: Menampilkan konfirmasi pembatalan bebas biaya.
  - Jika pembatalan dilakukan $< \text{H}-1$: Menampilkan **peringatan keras bahwa pembatalan ini akan dikenakan denda sebesar Rp 50.000**. Mahasiswa harus mencentang kotak persetujuan sebelum dapat mengklik tombol konfirmasi batal.

---

## 4. Langkah-Langkah Pengerjaan
1. Bangun halaman `RiwayatMahasiswaPage.jsx` dengan tab terpisah antara Barang dan Ruangan.
2. Buat komponen visual tracker stepper status.
3. Hubungkan pemanggilan API `GET /api/peminjaman?nim=...` dan `GET /api/booking?nim=...`.
4. Integrasikan fungsi aksi pembatalan ke endpoint `POST /api/peminjaman/{id}/batal` dan `POST /api/booking/{id}/batal`.
5. Tampilkan alert toast keberhasilan saat transaksi berhasil dibatalkan.

---

## 5. Kriteria Penerimaan (Acceptance Criteria / DoD)
- [ ] Seluruh riwayat transaksi milik mahasiswa yang login tertampil dengan data akurat (nomor registrasi, tanggal, item barang/ruangan, status).
- [ ] Stepper status memperlihatkan tahapan proses peminjaman secara jelas.
- [ ] Pembatalan booking kurang dari H-1 menampilkan peringatan denda Rp50.000 dan setelah dikonfirmasi, denda tercatat pada profil mahasiswa.
- [ ] Transaksi yang sudah masuk tahap `DIPINJAM` atau `SELESAI` tidak memiliki tombol pembatalan.

