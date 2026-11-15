# TASK-FE-09: Monitoring Overdue & Visualisasi Grafik Laporan

## 1. Identitas Task
- **ID Task**: `TASK-FE-09`
- **Fase**: Fase 4 (Modul Petugas Sarpras & Dosen Pembina)
- **Komponen**: `MonitoringJatuhTempoPage`, `DashboardLaporanPage`, `ChartKategori`, `ChartUtilisasiRuangan`
- **Aktor**: Petugas Sarpras, Dosen Pembina
- **Kebutuhan Fungsional**: FR-17, FR-25, UC14, UC15
- **Tingkat Kesulitan**: Sedang
- **Estimasi Waktu**: 1.5 Hari

---

## 2. Deskripsi & Tujuan
Membangun pusat kendali monitoring dan analitik visual untuk Petugas Sarpras dan Dosen Pembina, terdiri atas:
1. Peringatan dini (*Overdue Alerts*) untuk barang yang mendekati atau telah melewati tanggal batas pengembalian.
2. Visualisasi grafik statistik rekapitulasi peminjaman barang per kategori inventaris.
3. Analisis persentase kepatuhan dan keterlambatan pengembalian mahasiswa.
4. Diagram utilisasi jam pemakaian ruangan kampus (jam sibuk vs jam lengang).

---

## 3. Spesifikasi Tampilan & Komponen

### 3.1 Papan Pantau Jatuh Tempo (`MonitoringJatuhTempoPage`)
- Kartu Peringatan Bahaya (Merah) untuk transaksi yang **LEWAT TENGGAT**:
  - Nama Mahasiswa, NIM, Nomor Kontak/Prodi.
  - Jumlah hari terlambat berjalan.
  - Estimasi denda harian yang terus bertambah.
  - Daftar barang yang belum dikembalikan.
- Kartu Peringatan Waspada (Kuning) untuk transaksi yang **JATUH TEMPO HARI INI**.

### 3.2 Dashboard Laporan & Grafik Visual (`DashboardLaporanPage`)
- **Metric Cards**:
  - Total Peminjaman Aktif
  - Total Booking Hari Ini
  - Persentase Pengembalian Tepat Waktu
  - Akumulasi Denda
- **Visualisasi Chart (menggunakan Chart.js / Recharts / Tailwind Bar)**:
  1. **Donut / Pie Chart**: Proporsi peminjaman barang per kategori (Elektronik vs Alat Laboratorium vs Furnitur).
  2. **Bar Chart**: Frekuensi pemakaian ruangan kampus berdasarkan slot jam operasional (07.00 s.d. 21.00) untuk evaluasi utilisasi sarana kampus.
- **Tabel Rekapitulasi**:
  Tabel ringkasan data yang dapat dicetak (*print-friendly view*) untuk lampiran laporan resmi praktikum.

---

## 4. Langkah-Langkah Pengerjaan
1. Pasang library chart (misal: `recharts` atau `chart.js` / komponen CSS bar sederhana).
2. Hubungkan pemanggilan API ke endpoint Backend Java:
   - `GET /api/laporan/ringkasan`
   - `GET /api/laporan/kategori`
   - `GET /api/laporan/utilisasi-ruangan`
   - `GET /api/laporan/jatuh-tempo`
3. Terapkan layout kartu metrik yang elegan dan mudah dibaca.
4. Sediakan tombol cetak laporan (*Print / Export View*).

---

## 5. Kriteria Penerimaan (Acceptance Criteria / DoD)
- [x] Daftar barang yang lewat tenggat tertampil dengan indikator warna merah yang kontras beserta hitungan estimasi denda harian.
- [x] Diagram grafik statistik kategori barang dan utilisasi ruangan ter-render dengan rapi dan data sinkron dengan database file backend.
- [x] Halaman dapat diakses oleh Petugas Sarpras dan Dosen Pembina.

