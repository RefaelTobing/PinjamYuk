# TASK-FE-10: Integrasi End-to-End, Testing & Kesiapan Demonstrasi
## Finalisasi & Pengujian Menyeluruh Frontend Berbasis Mockup Baru

---

## 1. Ringkasan Tugas
Melakukan pengujian integrasi *end-to-end* (E2E) yang menghubungkan antarmuka Frontend baru secara penuh dengan Backend Java REST API (port 8080). Memastikan seluruh alur operasional 3 peran pengguna (Mahasiswa, Dosen Pembina, Petugas Sarpras) berjalan tanpa cela (*zero error*), melakukan audit keselarasan visual terhadap ke-8 gambar mockup, serta menyusun panduan skenario demonstrasi langsung di hadapan dosen penguji.

---

## 2. Matriks Pengujian Integrasi Alur Transaksi

```
[1. Mahasiswa]
   ├── Login via Demo 1-Klik Mahasiswa (halaman_login_sipinjam.png)
   ├── Cek sisa stok dinamis per rentang tanggal di Katalog (katalog_inventaris_mahasiswa.png)
   ├── Tambah barang biasa + barang khusus ke Keranjang
   ├── Buka Slide-Over Drawer, periksa checklist hijau & isi keperluan (katalog_inventaris_keranjang_pengajuan.png)
   └── Submit Pengajuan -> Status: MENUNGGU_PEMBINA (karena ada alat lab/khusus)
         │
[2. Dosen Pembina]
   ├── Login via Demo 1-Klik Pembina
   ├── Buka Antrean Persetujuan (persetujuan_dosen_pembina_minimalist.png)
   ├── Periksa kartu pengajuan beraset tinggi & klik "Setujui Pengajuan"
   └── Status Peminjaman berubah menjadi: DISETUJUI
         │
[3. Petugas Sarpras]
   ├── Login via Demo 1-Klik Petugas
   ├── Buka modul Sirkulasi & lakukan "Serah Terima" fisik -> Status: DIPINJAM
   ├── Buka modal "Inspeksi Pengembalian" (sirkulasi_inspeksi_pengembalian_petugas_sarpras.png)
   ├── Pilih kondisi (misal: 1 barang Rusak Ringan), amati live calculation denda otomatis
   ├── Klik "Simpan Pengembalian" -> Status: KEMBALI
   └── Buka Laporan Monitoring (monitoring_laporan_sirkulasi_petugas_sarpras.png) untuk melihat rekapitulasi denda
         │
[4. Mahasiswa Kembali]
   ├── Buka halaman Riwayat & Denda (riwayat_denda_mahasiswa.png)
   └── Verifikasi status transaksi menjadi "Dikembalikan" dan rincian denda tercatat transparan
```

---

## 3. Rincian Pekerjaan Teknis

### A. Audit Keselarasan Visual (Pixel & Layout Quality Audit)
1. **Header Navbar**:
   - Memastikan pergantian peran (Mahasiswa $\rightarrow$ Petugas $\rightarrow$ Pembina) mengubah warna tema navbar, badge pill peran, dan tabs navigasi secara instan.
2. **Kesesuaian Desain Mockup**:
   - Login: Efek background dot-grid, floating card rounded-3xl.
   - Katalog: Grid 3 kolom, kotak ilustrasi aset, stepper kuantitas.
   - Drawer Keranjang: Animasi slide-over kanan mulus, checklist hijau otomatis.
   - Riwayat: 3 kartu metrik atas, tabel transaksi clean minimalist.
   - Pembina: Kotak sorotan aset bernilai tinggi dengan estimasi nilai.
   - Master Data: Tab inventaris/ruangan, kartu wawasan operasional di bawah.
   - Modal Inspeksi: Kotak perhitungan live total denda merah.
   - Monitoring Laporan: 3 kartu analitik metrik dengan badge tren.

### B. Error Handling & Feedback Interaktif
- Memasang notifikasi toast mengambang yang informatif (menggunakan toast visual modern) untuk:
  - Sukses mengajukan peminjaman.
  - Peringatan stok habis atau melebihi kuota.
  - Sukses persetujuan pembina / verifikasi petugas.
  - Sukses pencatatan pengembalian dan denda.
- Menampilkan pesan error validasi bisnis dari Backend Java secara manusiawi.

### C. Kesiapan Skenario Live Demo
Menyediakan akun demo 1-klik dan data contoh yang siap dipresentasikan tanpa perlu mengetik ulang dari nol, sehingga proses demonstrasi di hadapan dosen berjalan cepat dan memukau.

---

## 4. Checklist Penerimaan Tugas (Definition of Done)
- [ ] Seluruh 10 task Frontend diuji dan terintegrasi tanpa error console / network.
- [ ] Seluruh visual antarmuka selaras 100% dengan 8 mockup di `frontend/MockUpPinjamYuk/`.
- [ ] Pengujian alur lengkap (Mahasiswa ajukan $\rightarrow$ Pembina setujui $\rightarrow$ Petugas serah terima & inspeksi kembali $\rightarrow$ Mahasiswa cek denda) sukses 100%.
- [ ] Build produksi frontend (`npm run build`) berhasil tanpa error linting atau kompilasi.
- [ ] Aplikasi siap digunakan untuk demonstrasi live ujian praktikum PBO.
