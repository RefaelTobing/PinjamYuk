# TASK-FE-07: Pengelolaan Master Data Inventaris, Ruang & Tarif Denda

## 1. Identitas Task
- **ID Task**: `TASK-FE-07`
- **Fase**: Fase 4 (Modul Petugas Sarpras)
- **Komponen**: `MasterInventarisPage`, `MasterRuanganPage`, `ModalFormBarang`, `ModalFormRuangan`, `TarifDendaCard`
- **Aktor**: Petugas Sarana dan Prasarana
- **Kebutuhan Fungsional**: FR-03, FR-04, FR-05, FR-06, FR-07, UC03, UC04, UC05
- **Tingkat Kesulitan**: Sedang
- **Estimasi Waktu**: 2 Hari

---

## 2. Deskripsi & Tujuan
Membangun modul pengelolaan data master bagi Petugas Sarpras, mencakup pengelolaan inventaris barang kampus (tambah barang baru, perbarui stok, ubah harga referensi denda, pengaturan switch persetujuan dosen pembina), pengelolaan data ruangan (nama, kapasitas peserta, daftar fasilitas, sakelar status aktif/nonaktif), dan informasi tarif denda operasional.

---

## 3. Spesifikasi Tampilan & Form Input

### 3.1 Manajemen Barang Inventaris (`MasterInventarisPage`)
- Tabel interaktif dengan fitur filter kategori, search kode/nama, dan paginasi/sorting.
- Kolom: Kode, Nama Barang, Kategori, Subtipe Polimorfik (Elektronik / Lab / Furnitur), Stok Total, Harga Satuan, Butuh Pembina (Badge Ya/Tidak), dan Aksi (Edit).
- Tombol: `+ Tambah Barang Baru`.

### 3.2 Modal Form Tambah / Edit Barang (`ModalFormBarang`)
- Field Umum: Kode Barang, Nama Barang, Kategori, Jumlah Stok, Harga Satuan, Switch "Perlu Persetujuan Pembina".
- Dynamic Sub-Fields (berdasarkan tipe kelas turunan OOP):
  - Jika **Barang Elektronik**: Input Masa Garansi (bulan).
  - Jika **Alat Laboratorium**: Input Nama Laboratorium pemilik.
  - Jika **Barang Furnitur**: Input Jenis Bahan (Kayu, Logam, Plastik).

### 3.3 Manajemen Ruangan (`MasterRuanganPage`)
- Kartu/Tabel daftar ruangan kampus (Aula, Rapat, Lab).
- Form Input: Kode Ruangan, Nama Ruangan, Kapasitas Peserta, Daftar Fasilitas (tag input/chips), Sakelar Status (Aktif / Nonaktif).
- Catatan: Ruangan yang di-nonaktifkan tidak akan muncul pada pilihan booking mahasiswa (Aturan S7).

### 3.4 Ringkasan Tarif Denda Resmi
- Panel informasi ketentuan denda sesuai SK kampus:
  - Denda harian keterlambatan: Elektronik (Rp10.000/hari), Alat Lab (Rp15.000/hari), Furnitur (Rp5.000/hari).
  - Denda kerusakan/kehilangan: Rusak Ringan (flat), Rusak Berat (% harga), Hilang (100% harga).
  - Denda pembatalan booking ruangan $< \text{H}-1$: Rp50.000.

---

## 4. Langkah-Langkah Pengerjaan
1. Bangun halaman `MasterInventarisPage.jsx` dan `MasterRuanganPage.jsx`.
2. Buat modal form pembuatan dan penyuntingan barang dengan dukungan dynamic fields untuk atribut polimorfik.
3. Hubungkan ke endpoint API Backend:
   - `GET /api/inventaris/barang`
   - `POST /api/inventaris/barang`
   - `PUT /api/inventaris/barang/{kode}`
   - `GET /api/inventaris/ruangan`
   - `POST /api/inventaris/ruangan`
4. Berikan notifikasi toast saat data master berhasil disimpan atau diperbarui.

---

## 5. Kriteria Penerimaan (Acceptance Criteria / DoD)
- [ ] Petugas dapat menambahkan barang baru dengan input subkelas yang sesuai (elektronik/lab/furnitur) dan data tersimpan ke Backend Java.
- [ ] Petugas dapat mengubah stok barang, dan stok baru langsung terrefleksi di katalog mahasiswa.
- [ ] Petugas dapat menonaktifkan ruangan, dan ruangan tersebut otomatis hilang/terkunci dari pilihan booking mahasiswa.

