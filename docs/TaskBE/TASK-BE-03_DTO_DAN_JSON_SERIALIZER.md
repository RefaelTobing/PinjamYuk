# TASK-BE-03: Layer DTO & Utilitas Serialisasi / Deserialisasi JSON

## 1. Identitas Task
- **ID Task**: `TASK-BE-03`
- **Fase**: Fase 2 (Pondasi REST API & Komunikasi)
- **Komponen**: `sipinjam.api.dto`, `sipinjam.api.json`
- **Tingkat Kesulitan**: Sedang
- **Estimasi Waktu**: 1 - 2 Hari

---

## 2. Deskripsi & Tujuan
Menyediakan lapisan *Data Transfer Object* (DTO) serta utilitas serialisasi (Object Java ke JSON) dan deserialisasi (String JSON ke Object Java). Lapisan ini bertindak sebagai jembatan tipe data antara dunia Java OOP (yang memiliki encapsulation, enum, LocalDate) dengan dunia JSON yang dikonsumsi oleh Frontend.

---

## 3. Spesifikasi Teknis

### 3.1 Pilihan Parser JSON
- **Opsi Standar (Zero-Dependency)**: Membuat kelas parser/builder JSON sederhana `JsonUtil.java` (atau `JsonBuilder.java`) yang mampu:
  - Mengubah `Map<String, Object>` dan `List<Object>` menjadi string JSON terformat.
  - Mem-parse payload sederhana (key-value strings, numbers, arrays).
  - Mengonversi `LocalDate` (format `YYYY-MM-DD`) dan enum (`StatusPeminjaman`, `Peran`, `KondisiBarang`).
- **Opsi Alternatif (External Lib)**: Menambahkan `gson.jar` atau `jackson-core.jar` pada classpath jika diizinkan oleh instruktur.

### 3.2 Daftar DTO Utama yang Harus Dibuat
1. **Autentikasi**:
   - `LoginRequestDTO` (`username`, `password`)
   - `RegisterMahasiswaRequestDTO` (`nim`, `nama`, `jurusan`, `angkatan`, `username`, `password`)
   - `PenggunaResponseDTO` (`id`, `username`, `nama`, `peran`, `detailKhusus`)
2. **Peminjaman Barang**:
   - `ItemPeminjamanDTO` (`kodeBarang`, `jumlah`)
   - `PengajuanPeminjamanRequestDTO` (`nim`, `tanggalMulai`, `tanggalSelesai`, `keperluan`, `items`: `List<ItemPeminjamanDTO>`)
   - `VerifikasiPeminjamanRequestDTO` (`id`, `disetujui`: `boolean`, `catatan`: `String`)
   - `SerahTerimaRequestDTO` (`id`, `kondisiAwalPerItem`: `Map<String, String>`)
   - `PengembalianRequestDTO` (`id`, `tanggalKembali`, `kondisiAkhirPerItem`: `Map<String, String>`)
3. **Booking Ruangan**:
   - `PengajuanBookingRequestDTO` (`nim`, `kodeRuangan`, `tanggal`, `jamMulai`, `jamSelesai`, `jumlahPeserta`, `keperluan`)
   - `VerifikasiBookingRequestDTO` (`id`, `disetujui`: `boolean`, `catatan`: `String`)
   - `BatalBookingRequestDTO` (`id`, `alasan`: `String`)

---

## 4. Langkah-Langkah Pengerjaan
1. Buat direktori `src/sipinjam/api/dto/` dan `src/sipinjam/api/json/`.
2. Implementasikan serialisasi untuk seluruh model entitas domain:
   - `Barang` (dan subkelas `BarangElektronik`, `AlatLaboratorium`, `BarangFurnitur`, `Ruangan`)
   - `Peminjaman` dan `DetailPeminjaman`
   - `BookingRuangan` dan `SlotWaktu`
   - `Pengembalian` dan `RincianDenda`
3. Pastikan penanganan nilai `null` dan format tanggal `LocalDate` konsisten dalam format ISO (`YYYY-MM-DD`).
4. Buat unit test mandiri untuk menguji serialisasi dan deserialisasi data bertingkat (nested JSON).

---

## 5. Kriteria Penerimaan (Acceptance Criteria / DoD)
- [x] Utilitas JSON berhasil mengubah objek entitas Java menjadi format string JSON yang valid (RFC 8259).
- [x] Payload request JSON dari klien berhasil dipetakan ke objek DTO Java dengan penanganan kesalahan tipe data yang aman.
- [x] Serialisasi entitas polimorfik (misal daftar barang yang berisi campuran elektronik, furnitur, dan alat lab) menghasilkan atribut spesifik masing-masing subkelas (misal: `masaGaransi`, `laboratorium`, `bahan`).

