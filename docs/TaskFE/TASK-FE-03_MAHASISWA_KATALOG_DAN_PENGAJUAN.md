# TASK-FE-03: Navbar Universal & Katalog Inventaris Mahasiswa
## Implementasi Sesuai Mockup `katalog_inventaris_mahasiswa.png`

---

## 1. Ringkasan Tugas
Mengimplementasikan komponen Header Navbar Universal yang beradaptasi dengan peran pengguna, serta membangun antarmuka **Katalog Inventaris Mahasiswa** berbasis grid 3-kolom, filter pencarian terpadu, pemilih rentang tanggal, filter kategori, indikator sisa stok dinamis real-time, dan kontrol penambahan kuantitas barang ke keranjang (*stepper*).

---

## 2. Acuan Visual Mockup (`katalog_inventaris_mahasiswa.png`)
* **Top Header Navbar Universal**:
  - Kiri: Logo kubus 3D dalam rounded square biru + Teks `SIPINJAM` + Badge peran `Kampus` (pill biru muda).
  - Tengah: Segmented pill tabs navigasi Mahasiswa:
    1. `Katalog Barang` (aktif: latar biru sangat muda `bg-blue-50 text-blue-700 font-semibold rounded-xl px-5 py-2`).
    2. `Booking Ruangan` (inaktif).
    3. `Riwayat` (inaktif).
  - Kanan:
    - Tombol Ikon Keranjang belanja dengan badge lingkaran biru gelap counter jumlah item (contoh badge angka `2`).
    - Kapsul Avatar Profil Mahasiswa: Lingkaran inisial `R` + Teks `Refael • Mahasiswa` dalam pill berborder halus.
* **Judul Halaman**:
  - `Katalog Inventaris` (`text-3xl font-extrabold text-slate-900 mb-6`).
* **Bilah Filter Terpadu (Filter Bar Card)**:
  - Kotak putih panjang berborder rounded dengan 3 kontrol sejajar:
    1. **Input Pencarian**: Ikon kaca pembesar + placeholder `Cari nama atau kode barang...`.
    2. **Pemilih Tanggal**: Ikon kalender + tampilan rentang `24 Nov 2026 – 26 Nov 2026`.
    3. **Dropdown Kategori**: Ikon panah bawah + pilihan `Semua Kategori`, `Elektronik`, `Laboratorium`, `Audio`, `Perlengkapan`, dll.
* **Kartu Inventaris (3-Column Grid)**:
  - Layout: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`.
  - Struktur Kartu:
    - **Area Ilustrasi Perangkat**: Kotak abu-abu terang rounded di bagian atas (`bg-slate-50 rounded-2xl h-44 flex items-center justify-center relative`).
    - **Badge Status di Pojok Kanan Atas Ilustrasi**: Badge `Perlu Pembina` (latar kuning peach lembut) jika barang memerlukan izin pembina.
    - **Ikon Perangkat**: Ikon modern di tengah (Proyektor, Mikroskop, Pengeras Suara, Kursi Lipat, Mic Wireless, Kamera 4K).
    - **Metadata Barang**:
      - Judul barang (contoh: `Proyektor Epson EB-X400`) font tebal `text-lg`.
      - Kode & Kategori (contoh: `PROY-01 • Elektronik`) warna abu-abu `text-xs`.
      - Informasi Stok: `Sisa Stok: 3 / 5 Unit` (angka sisa warna hijau tebal).
      - Tarif Denda: `Denda Telat: Rp10.000/hari`.
    - **Tombol Aksi**:
      - Jika belum di keranjang: Tombol outline `+ Tambah` bergaris biru/slate.
      - Jika sudah ada di keranjang: Kontrol stepper `[- 1 Unit +]` dengan tombol plus biru solid.

---

## 3. Rincian Pekerjaan Teknis

### A. Komponen Topbar Universal (`Navbar.jsx`)
- Menerima props `peran`, `penggunaAktif`, `jumlahKeranjang`, dan `tabAktif`.
- Secara otomatis menyesuaikan warna aksen dan pilihan tab berdasarkan peran pengguna:
  - Mahasiswa: Aksen biru, badge `Kampus`. Tab: `Katalog Barang`, `Booking Ruangan`, `Riwayat`.
  - Petugas: Aksen hijau zamrud, badge `Petugas`. Tab: `Sirkulasi`, `Master Data`, `Laporan`.
  - Pembina: Aksen amber, badge `Dosen Pembina`. Tab: `Antrean Persetujuan`, `Riwayat`.

### B. Logika Filter & Pengecekan Stok Dinamis
1. Ketika pengguna mengubah tanggal mulai atau tanggal selesai pada filter bar:
   - Kirim permintaan `GET /api/inventaris/barang?tglMulai=YYYY-MM-DD&tglSelesai=YYYY-MM-DD`.
   - Backend Java menghitung `sisaStok` untuk setiap barang dengan mengurangkan peminjaman aktif lain pada rentang tersebut.
   - Frontend memperbarui label `Sisa Stok: X / Y Unit` secara otomatis.
   - Jika sisa stok = 0, tombol dinonaktifkan (*disabled*) dengan label `Stok Habis`.
2. Pencarian teks menyaring berdasarkan nama barang dan kode barang secara lokal/responsif.
3. Dropdown kategori menyaring daftar barang berdasarkan ID kategori.

---

## 4. Checklist Penerimaan Tugas (Definition of Done)
- [ ] Tampilan katalog inventaris sesuai persis dengan `katalog_inventaris_mahasiswa.png`.
- [ ] Header navbar floating universal menampilkan pill tabs, counter keranjang, dan profil pengguna dengan rapi.
- [ ] Grid 3-kolom responsif menyesuaikan layar mobile, tablet, dan desktop.
- [ ] Pengecekan sisa stok dinamis terhubung ke REST API saat rentang tanggal berubah.
- [ ] Tombol `+ Tambah` berhasil bertransisi menjadi stepper `[- X Unit +]` saat item masuk ke keranjang.
