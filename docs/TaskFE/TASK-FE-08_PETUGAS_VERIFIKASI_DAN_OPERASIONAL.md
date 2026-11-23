# TASK-FE-08: Operasional Sirkulasi & Modal Inspeksi Pengembalian Fisik
## Implementasi Sesuai Mockup `sirkulasi_inspeksi_pengembalian_petugas_sarpras.png`

---

## 1. Ringkasan Tugas
Membangun modul operasional sirkulasi harian Petugas Sarana Prasarana (verifikasi pengajuan baru, pencatatan serah terima fisik) serta antarmuka **Modal Inspeksi Pengembalian Fisik** yang menghitung denda keterlambatan dan kerusakan fisik secara otomatis dan real-time sesuai berkas mockup `frontend/MockUpPinjamYuk/sirkulasi_inspeksi_pengembalian_petugas_sarpras.png`.

---

## 2. Acuan Visual Mockup (`sirkulasi_inspeksi_pengembalian_petugas_sarpras.png`)
* **Halaman Latar Belakang (Dashboard Sirkulasi)**:
  - Header: Tab `Sirkulasi` aktif di navbar petugas.
  - Kartu statistik sirkulasi (Perlu Verifikasi, Menunggu Serah Terima, Dipinjam).
  - Tabel sirkulasi dengan baris transaksi dan tombol aksi: `Serah Terima`, `Proses Kembali`, `Verifikasi`.
* **Modal Dialog Inspeksi Pengembalian (Floating Centered Dialog)**:
  - Latar belakang: *Backdrop blur* pekat (`bg-slate-900/60 backdrop-blur-sm`).
  - Kotak Modal: Putih murni, sudut melengkung `rounded-3xl`, bayangan tebal `shadow-2xl`, lebar maksimal `max-w-xl`.
  - **Header Modal**:
    - Kiri: Ikon verifikasi hijau toska dalam rounded square + Judul `Inspeksi Pengembalian • PINJAM-003`.
    - Badge Keterlambatan: `• Terlambat 1 Hari` (pill merah rose terang).
    - Kanan: Tombol silang tutup (`X`).
  - **Kotak Informasi Peminjam & Waktu**:
    - Latar kotak abu-abu terang rounded (`bg-slate-50 p-4 rounded-2xl`).
    - Peminjam: `Ahmad Fauzi (D3 Teknik Informatika)`.
    - Jadwal Kembali: `22 Nov 2026, 16:00 WIB`.
    - Aktual Kembali: `23 Nov 2026, 10:15 WIB` + keterangan merah `(Terlambat 1 Hari)`.
  - **Formulir Pengecekan Kondisi Fisik Barang (Per Item)**:
    - Judul sub-seksi: `Cek Kondisi Fisik Barang` (kiri) dan `2 Item Terdaftar` (kanan).
    - **Item 1**: `Proyektor Epson EB-X400 (1 Unit)` • `SN: EP-400-8821`.
      - Dropdown Pilihan Kondisi: `Baik (Berfungsi Normal)` (berborder hijau mint).
    - **Item 2**: `Kursi Lipat Chitose (10 Unit)` • `Set Kursi Aula`.
      - Dropdown Pilihan Kondisi: `Rusak Ringan (1 Patah Sambungan)` (berborder peach/amber).
  - **Textarea Catatan Tambahan Petugas**:
    - Textarea dengan catatan kondisi riil (contoh: *Catatan: 1 unit kursi lipat baut pengunci longgar, perlu pengencangan di bengkel kampus.*).
  - **Kotak Rincian Tagihan Denda Otomatis (Live Calculation Box)**:
    - Latar kotak biru muda/slate rounded (`bg-blue-50/60 p-4 rounded-2xl`).
    - Baris 1: `Denda Terlambat (1 hari)` $\rightarrow$ `Rp10.000`.
    - Baris 2: `Denda Rusak Ringan` $\rightarrow$ `Rp25.000`.
    - Pembatas garis tipis.
    - Baris Total: `Total Denda:` (kiri) $\rightarrow$ **`Rp35.000`** (kanan, font tebal besar warna merah rose `#E11D48`).
  - **Footer Modal**:
    - Kiri: Ikon struk + teks `Kuitansi denda otomatis diterbitkan ke akun mahasiswa`.
    - Kanan: Tombol sejajar:
      - Tombol `Batal` (outline abu-abu).
      - Tombol `✓ Simpan Pengembalian` warna hijau zamrud solid (`bg-emerald-800 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl`).

---

## 3. Rincian Pekerjaan Teknis

### A. Operasional Sirkulasi Peminjaman
1. **Verifikasi Pengajuan (`POST /api/peminjaman/{id}/verifikasi-petugas`)**:
   - Petugas menyetujui pengajuan umum dari mahasiswa yang berstatus `DIAJUKAN`.
2. **Pencatatan Serah Terima Fisik (`POST /api/peminjaman/{id}/serah-terima`)**:
   - Saat mahasiswa mengambil barang di unit Sarpras, Petugas mencatat penyerahan.
   - Status peminjaman berubah menjadi `DIPINJAM`.

### B. Kalkulasi Denda Polimorfik Real-Time di Modal Pengembalian
1. Ketika modal inspeksi dibuka untuk transaksi tertentu:
   - Hitung selisih hari antara tanggal jatuh tempo dengan hari ini (`hariTerlambat = Math.max(0, hariKembali - tanggalSelesai)`).
2. Setiap kali petugas mengubah dropdown kondisi barang:
   - Evaluasi denda kondisi berdasarkan sub-tipe barang:
     - Barang Elektronik: Rusak Ringan Rp100.000, Rusak Berat 40% harga, Hilang 100% harga.
     - Alat Laboratorium: Rusak Ringan Rp75.000, Rusak Berat 50% harga, Hilang 100% harga.
     - Barang Furnitur: Rusak Ringan Rp25.000, Rusak Berat 30% harga, Hilang 100% harga.
   - Perbarui angka `Total Denda` secara reaktif di layar tanpa perlu refresh halaman.
3. Saat tombol `Simpan Pengembalian` diklik:
   - Kirim permintaan `POST /api/peminjaman/{id}/pengembalian` dengan payload kondisi akhir setiap item dan catatan petugas.
   - Backend Java memverifikasi perhitungan via `KalkulatorDenda.java`, mengubah status menjadi `KEMBALI`, dan menyimpan denda jika ada.

---

## 4. Checklist Penerimaan Tugas (Definition of Done)
- [ ] Tampilan modal inspeksi pengembalian fisik identik 100% dengan `sirkulasi_inspeksi_pengembalian_petugas_sarpras.png`.
- [ ] Dropdown kondisi barang merender opsi Baik, Rusak Ringan, Rusak Berat, dan Hilang.
- [ ] Angka denda keterlambatan dan denda kerusakan terhitung otomatis secara live.
- [ ] Total denda merah mencerminkan hasil akumulasi secara presisi.
- [ ] Eksekusi `Simpan Pengembalian` berhasil memperbarui database dan menutup modal.
