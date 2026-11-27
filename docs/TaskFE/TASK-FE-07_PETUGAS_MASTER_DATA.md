# TASK-FE-07: Master Data Fasilitas Petugas Sarpras
## Implementasi Sesuai Mockup `master_data_fasilitas_petugas_sarpras.png`

---

## 1. Ringkasan Tugas
Membangun modul manajemen master data fasilitas kampus (barang inventaris dan ruangan) bagi Petugas Sarana Prasarana sesuai berkas mockup `frontend/MockUpPinjamYuk/master_data_fasilitas_petugas_sarpras.png`. Fitur mencakup tab switcher inventaris/ruangan, bilah pencarian & filter kategori pill, tabel data master terpadu, modal formulir CRUD dengan subtype OOP (Elektronik, Alat Lab, Furnitur), serta kartu edukasi operasional di bagian bawah.

---

## 2. Acuan Visual Mockup (`master_data_fasilitas_petugas_sarpras.png`)
* **Header Navbar Petugas**:
  - Logo kubus 3D dalam rounded square hijau mint + Teks `SIPINJAM` + Badge peran `Petugas` (pill hijau mint).
  - Segmented pill tabs: `Sirkulasi`, `Master Data` (aktif: latar hijau mint `bg-emerald-100 text-emerald-900`), dan `Laporan`.
  - Kapsul Profil: Avatar inisial hijau `B` + Teks `Budi Santoso • Petugas`.
* **Header Halaman**:
  - Judul: `Master Data Fasilitas` (`text-3xl font-extrabold text-slate-900`).
  - Subteks: `Kelola katalog inventaris aset fisik, spesifikasi alat, tarif denda, dan kapasitas ruangan kampus.`
  - Pojok Kanan: Tombol utama `+ Tambah Data` warna hijau zamrud solid (`bg-emerald-800 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl`).
* **Tab Navigasi Fasilitas & Ringkasan Cepat**:
  - Kiri: Segmented pills: `📦 Inventaris Barang (12)` dan `🏢 Ruangan Kampus (4)`.
  - Kanan: Indikator ringkasan dot berwarna: `🟢 74 Unit Siap Pakai` • `🔵 14 Unit Sedang Terpinjam`.
* **Bilah Filter & Pencarian**:
  - Input field pencarian: `Cari kode, nama barang, nomor seri...`.
  - Kategori Pill Filter: `Semua` (aktif: hijau toska), `Elektronik`, `Alat Laboratorium`, `Furnitur`.
  - Tombol aksi kanan: `📥 Export Excel` (outline abu-abu).
* **Tabel Master Data Fasilitas**:
  - Kolom: `KODE`, `NAMA BARANG`, `KATEGORI`, `STOK TOTAL`, `HARGA SATUAN / DENDA`, `AKSI`.
  - Format Baris:
    - `KODE`: Pill abu-abu kebiruan rounded (contoh: `PROY-01`, `LAB-01`, `FUR-01`, `AUD-02`).
    - `NAMA BARANG`: Nama tebal + subteks nomor seri & lokasi gudang (contoh: `SN: EP-400-8821 • Gudang LT-1`).
    - `KATEGORI`: Teks kategori + badge `Perlu Pembina` jika memerlukan otorisasi.
    - `STOK TOTAL`: Angka total unit + rincian `3 Tersedia • 2 Dipinjam`.
    - `HARGA SATUAN / DENDA`: Nilai aset (contoh: `Rp5.000.000`) dan tarif denda (contoh: `Denda Rp10.000/hari` warna merah bata).
    - `AKSI`: Ikon edit pensil dan ikon hapus tempat sampah.
  - Pagination Bawah: Teks `Menampilkan 4 dari 12 barang`, tombol `Sebelumnya`, nomor halaman `[1]` (aktif: hijau zamrud gelap), `2`, `3`, dan tombol `Selanjutnya`.
* **3 Kartu Wawasan Operasional di Bagian Bawah**:
  1. **Validasi Pembina**: Ikon centang pelindung, penjelasan aturan barang berisiko tinggi.
  2. **Tarif & Kompensasi**: Ikon kartu uang, penjelasan akumulasi denda 1x24 jam keterlambatan.
  3. **Sinkronisasi Barcode**: Ikon barcode/QR, integrasi label fisik dan inspeksi mobile.

---

## 3. Rincian Pekerjaan Teknis

### A. Pengambilan & Penyaringan Master Data
- Menampilkan data dari `GET /api/inventaris/barang` dan `GET /api/inventaris/ruangan`.
- Filter instan berdasarkan pencarian teks dan filter kategori.
- Navigasi tab antara `Inventaris Barang` dan `Ruangan Kampus`.

### B. Modal Tambah & Edit Fasilitas
1. Modal interaktif untuk menambah/mengedit barang inventaris dengan pilihan sub-tipe OOP:
   - `ELEKTRONIK`: Tarif harian Rp10.000, biaya rusak ringan Rp100.000, rusak berat 40% harga.
   - `ALAT_LAB`: Tarif harian Rp15.000, biaya rusak ringan Rp75.000, rusak berat 50% harga.
   - `FURNITUR`: Tarif harian Rp5.000, biaya rusak ringan Rp25.000, rusak berat 30% harga.
2. Form untuk ruangan:
   - Nama ruangan, kode ruangan, kapasitas maksimum, fasilitas yang tersedia.
3. Mengirimkan permintaan `POST /api/inventaris/barang` atau `PUT /api/inventaris/barang/{kode}`.

---

## 4. Checklist Penerimaan Tugas (Definition of Done)
- [x] Tampilan halaman master data sesuai 100% dengan `master_data_fasilitas_petugas_sarpras.png`.
- [x] Tab peralihan antara Inventaris Barang dan Ruangan Kampus berfungsi lancar.
- [x] Filter pencarian dan filter pill kategori merender data secara instan.
- [x] Form modal Tambah/Edit Barang memvalidasi input sesuai subtipe OOP.
- [x] Tiga kartu wawasan operasional di bagian bawah terpasang dengan ikon dan teks rapi.
