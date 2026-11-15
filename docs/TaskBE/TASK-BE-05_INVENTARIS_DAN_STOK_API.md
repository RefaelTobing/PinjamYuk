# TASK-BE-05: API Master Data Inventaris, Ruangan & Cek Stok Dinamis

## 1. Identitas Task
- **ID Task**: `TASK-BE-05`
- **Fase**: Fase 3 (Implementasi Endpoints Bisnis)
- **Komponen**: `sipinjam.api.handler.InventarisHandler`, `sipinjam.repositori.RepositoriBarang`, `sipinjam.layanan.LayananKetersediaan`
- **Kebutuhan Fungsional**: FR-04, FR-05, FR-06, FR-07, FR-08, UC03, UC04, UC06
- **Tingkat Kesulitan**: Sedang
- **Estimasi Waktu**: 2 Hari

---

## 2. Deskripsi & Tujuan
Menyediakan antarmuka REST API untuk menampilkan katalog sumber daya kampus, manajemen master data inventaris & ruangan oleh Petugas Sarpras, serta fitur krusial penentuan **ketersediaan stok otomatis pada rentang tanggal tertentu** menggunakan formula:
```
terpakai(barang, mulai, selesai) = jumlah unit pada peminjaman aktif yang bertumpang tindih
tersedia(barang, mulai, selesai) = totalStok - terpakai
```

---

## 3. Spesifikasi Endpoint REST API

### 3.1 `GET /api/inventaris/barang`
- **Deskripsi**: Menampilkan daftar barang inventaris.
- **Query Parameters**:
  - `kategori`: filter kategori (opsional).
  - `mulai`: tanggal mulai format `YYYY-MM-DD` (opsional).
  - `selesai`: tanggal selesai format `YYYY-MM-DD` (opsional).
  - `cari`: kata kunci pencarian nama atau kode barang (opsional).
- **Catatan Penting**: Jika parameter `mulai` dan `selesai` diberikan, respons **WAJIB** menyertakan atribut `stokTersedia` hasil kalkulasi dari `LayananKetersediaan`.

### 3.2 `POST /api/inventaris/barang` (Khusus Petugas)
- **Deskripsi**: Menambah barang baru ke inventaris.
- **Request Body**:
  ```json
  {
    "kode": "PROY-03",
    "nama": "Proyektor Epson EB-X500",
    "kategori": "Elektronik",
    "stok": 3,
    "hargaSatuan": 6500000,
    "perluPersetujuan": true,
    "jenis": "BarangElektronik",
    "masaGaransi": 24
  }
  ```

### 3.3 `PUT /api/inventaris/barang/{kode}` (Khusus Petugas)
- **Deskripsi**: Mengubah data barang, jumlah stok, harga satuan, atau syarat persetujuan pembina.

### 3.4 `GET /api/inventaris/ruangan`
- **Deskripsi**: Menampilkan daftar ruangan beserta kapasitas, fasilitas, dan status aktif.

### 3.5 `POST /api/inventaris/ruangan` (Khusus Petugas)
- **Deskripsi**: Menambah ruangan baru atau mengupdate status aktif/nonaktif ruangan.

### 3.6 `GET /api/inventaris/kategori`
- **Deskripsi**: Mengambil daftar kategori barang inventaris.

---

## 4. Langkah-Langkah Pengerjaan
1. Buat kelas `sipinjam.api.handler.InventarisHandler`.
2. Integrasikan dengan `KonteksAplikasi.getRepoBarang()` dan `KonteksAplikasi.getKetersediaan()`.
3. Terapkan polimorfisme saat serialisasi data:
   - Jika instansi `BarangElektronik`, sertakan `masaGaransi` dan tarif denda keterlambatan (Rp10.000/hari).
   - Jika instansi `AlatLaboratorium`, sertakan `laboratorium` dan tarif denda (Rp15.000/hari).
   - Jika instansi `BarangFurnitur`, sertakan `bahan` dan tarif denda (Rp5.000/hari).
4. Saat query parameter `mulai` dan `selesai` disertakan, panggil method:
   ```java
   int terpakai = ketersediaan.hitungTerpakai(barang.getKode(), tglMulai, tglSelesai);
   int sisa = barang.getStok() - terpakai;
   ```
5. Simpan setiap perubahan data barang ke file `data/barang.txt`.

---

## 5. Kriteria Penerimaan (Acceptance Criteria / DoD)
- [ ] Endpoint `GET /api/inventaris/barang` mengembalikan daftar barang lengkap dengan detail jenis spesifiknya.
- [ ] Cek stok dinamis berfungsi akurat: bila barang A sedang dipinjam 2 unit pada rentang tanggal X s.d Y, maka request dengan tanggal yang tumpang tindih mengembalikan `stokTersedia` yang sudah berkurang 2.
- [ ] Petugas dapat menambah dan mengedit barang/ruangan melalui method `POST` dan `PUT`.
- [ ] Akses modifikasi master data ditolak dengan HTTP 403 jika dilakukan oleh pengguna non-petugas.

