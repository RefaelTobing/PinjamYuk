# TASK-FE-09: Monitoring Sirkulasi, Jatuh Tempo & Analitik Laporan
## Implementasi Sesuai Mockup `monitoring_laporan_sirkulasi_petugas_sarpras.png`

---

## 1. Ringkasan Tugas
Membangun modul pengawasan dan analitik operasional kampus untuk Petugas Sarana Prasarana sesuai berkas mockup `frontend/MockUpPinjamYuk/monitoring_laporan_sirkulasi_petugas_sarpras.png`. Antarmuka mencakup 3 kartu ringkasan metrik statistik utama, tabel daftar jatuh tempo prioritas dengan aksi tindak lanjut (Kirim Pengingat / Lihat Kuitansi), fitur filter periode bulan, ekspor laporan rekapitulasi, dan kartu status integrasi sistem.

---

## 2. Acuan Visual Mockup (`monitoring_laporan_sirkulasi_petugas_sarpras.png`)
* **Header Navbar Petugas**:
  - Tab `Laporan` aktif di navbar (pill hijau mint terang `bg-emerald-100 text-emerald-900 font-semibold`).
  - Kapsul Profil: `Budi Santoso • Petugas`.
* **Header Halaman**:
  - Breadcrumbs: `PETUGAS SARPRAS / ANALITIK & PENGAWASAN`.
  - Judul: `Monitoring & Laporan Sirkulasi` (`text-3xl font-extrabold text-slate-900`).
  - Subteks: `Pantau kepatuhan peminjaman, estimasi barang jatuh tempo, dan rekapitulasi penerimaan kompensasi denda operasional kampus secara real-time.`
  - Kontrol Kanan Atas:
    - Dropdown Periode: `📅 Bulan Ini: November 2026 ˇ`.
    - Tombol Unduh: `📥 Unduh Rekap Laporan` warna biru tua solid (`bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2.5 rounded-xl`).
* **3 Kartu Ringkasan Metrik (Top Analytics Cards)**:
  1. **Total Transaksi Bulan Ini**:
     - Label kecil abu-abu di atas.
     - Angka besar: `42` + badge hijau kecil `📈 +8%`.
     - Ikon kanan: Panah bolak-balik dalam kotak rounded biru muda.
     - Subteks bawah: `38 unit barang logistik • 4 reservasi ruangan`.
  2. **Mendekati Jatuh Tempo**:
     - Angka besar: `3` + badge peach `• Perlu Follow-up`.
     - Ikon kanan: Jam pasir/waktu dalam kotak rounded oranye muda.
     - Subteks bawah: `2 unit jatuh tempo hari ini • 1 unit besok`.
  3. **Total Pemasukan Denda**:
     - Angka besar: `Rp 485.000`.
     - Ikon kanan: Dompet uang dalam kotak rounded hijau mint.
     - Subteks bawah: `Keterlambatan & ganti rugi • ✓ 100% Tercatat`.
* **Tabel Daftar Jatuh Tempo & Rekap Denda (Priority Table)**:
  - Header Tabel: Judul `Daftar Jatuh Tempo & Rekap Denda`, badge counter `3 Transaksi Prioritas`, subteks penjelasan.
  - Filter Tabs Kanan: `Semua`, `Jatuh Tempo`, `Lunas Denda`.
  - Field Pencarian: `🔍 Cari ID transaksi, nama...`.
  - Kolom Tabel: `ID TRANSAKSI`, `PEMINJAM`, `ITEM / RUANGAN`, `TENGGAT KEMBALI`, `STATUS`, `TOTAL DENDA`, `AKSI`.
  - Data Baris:
    - `PINJAM-004`: `Rina Marlina`, `Proyektor Epson EB-X400`, `🕒 Hari Ini, 17:00 (Sisa waktu 3 jam)`, status `• Dipinjam` (pill biru), Denda `Rp 0`, Aksi `Kirim Pengingat` (teks hijau).
    - `PINJAM-003`: `Ahmad Fauzi`, `Kursi Lipat (10 Unit)`, kotak merah `⚠️ Terlambat 1 Hari (Tenggat: Kemarin, 16:00)`, status `Jatuh Tempo` (pill pink kemerahan), Denda `Rp 35.000 (Tarif: Rp 3.500/unit/hari)`, Aksi `Lihat Kuitansi` (teks abu-abu/hijau).
    - `BKG-001`: `Siti Aminah`, `Aula Gedung Utama (200 Orang)`, `25 Nov 2026, 14:00 WIB (Tepat Waktu)`, status `• Selesai` (pill hijau mint), Denda `Rp 0`, Aksi `Arsip Data`.
  - Pagination Bawah: Teks `Menampilkan 3 dari 42 transaksi perputaran sirkulasi`, tombol navigasi `< Halaman 1 >`.
* **2 Kartu Integrasi Sistem di Bagian Bawah**:
  1. **Pengingat Otomatis Aktif**:
     - Ikon lonceng ungu.
     - Deskripsi: `Sistem SIPINJAM otomatis mengirim notifikasi WhatsApp & Email H-2 jam sebelum tenggat batas pengembalian barang untuk menekan angka keterlambatan mahasiswa.`
  2. **Penyelesaian Denda Kasir Kampus**:
     - Ikon gedung bank/kasir hijau mint.
     - Deskripsi: `Kompensasi denda tercatat langsung terintegrasi dengan portal keuangan akademik universitas (SIAKAD) dan dapat dilunasi via Virtual Account bank mitra.`

---

## 3. Rincian Pekerjaan Teknis

### A. Pengambilan Data Laporan Statistik
- Mengambil ringkasan dari Backend Java melalui endpoint:
  - `GET /api/laporan/ringkasan` $\rightarrow$ Total peminjaman, booking, rasio keterlambatan, dan akumulasi denda.
  - `GET /api/laporan/jatuh-tempo` $\rightarrow$ Daftar transaksi yang aktif, mendekati batas waktu, atau telah melewati batas pengembalian.
  - `GET /api/laporan/kategori` $\rightarrow$ Distribusi peminjaman berdasarkan kategori barang.

### B. Tindak Lanjut & Ekspor Laporan
1. Tombol `Kirim Pengingat`: Menampilkan notifikasi simulasi pengiriman notifikasi pengingat jatuh tempo ke mahasiswa terkait.
2. Tombol `Unduh Rekap Laporan`: Mengunduh berkas laporan rekapitulasi data format CSV/Excel.

---

## 4. Checklist Penerimaan Tugas (Definition of Done)
- [x] Tampilan halaman monitoring laporan persis 100% dengan `monitoring_laporan_sirkulasi_petugas_sarpras.png`.
- [x] Tiga kartu metrik analitik menampilkan angka total transaksi, jatuh tempo, dan pemasukan denda secara akurat.
- [x] Tabel sirkulasi prioritas membedakan transaksi yang tepat waktu dan terlambat dengan badge visual yang jelas.
- [x] Tombol `Unduh Rekap Laporan` dan `Kirim Pengingat` berfungsi normal.
- [x] Dua kartu integrasi sistem di bagian bawah ter-render dengan rapi.
