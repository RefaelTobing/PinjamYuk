# ALUR PENGERJAAN BACKEND (JAVA) — SIPINJAM

Dokumen ini memetakan alur transformasi sistem **SIPINJAM (Sistem Informasi Peminjaman Inventaris, Sarana Prasarana, dan Ruangan Kampus)** dari monolit Java Desktop (Swing) menjadi **Java RESTful Backend Engine**. Backend ini menyediakan API bagi antarmuka Frontend (FE Bebas: Web React/Vue/Next.js/Mobile) sekaligus mempertahankan 100% kepatuhan terhadap rubrik penilaian mata kuliah **Praktikum Pemrograman Berorientasi Objek (PBO)**.

---

## 1. Landasan Arsitektur & Kepatuhan Rubrik PBO

Meskipun Frontend dipisahkan, seluruh logika bisnis, pemodelan entitas, aturan kelayakan, exception handling, struktur koleksi, dan penyimpanan berkas **WAJIB** tetap berada di Backend Java dengan kaidah OOP murni:

| Konsep OOP PBO | Implementasi di Backend Java |
| --- | --- |
| **Class & Object** | Pemodelan entitas domain (`Pengguna`, `Barang`, `Peminjaman`, `BookingRuangan`, `SlotWaktu`, dll.) dan Service layer. |
| **Constructor** | Constructor berparameter dan constructor overloading (misal pada `SlotWaktu`). |
| **Encapsulation** | Semua atribut `private`, akses melalui getter/setter dengan validasi, status transaksi dikunci dalam method transisi internal. |
| **Inheritance** | Hierarki pewarisan `Pengguna` → `Mahasiswa`, `PetugasSarpras`, `DosenPembina` serta `Barang` → `BarangElektronik`, `AlatLaboratorium`, `BarangFurnitur`, `Ruangan`. |
| **Polymorphism** | Overriding method `getJenisBarang()`, `tarifHarian()`, `biayaKondisi()` pada turunan `Barang`; iterasi polimorfik `ArrayList<AturanPeminjaman>` pada `ValidatorPeminjaman`. |
| **Abstraction** | Abstract class `Pengguna` dan `Barang`; Interface `AturanPeminjaman`. |
| **Exception Handling** | Hirarki `AturanDilanggarException` dan custom exception (`StokTidakCukupException`, `BentrokJadwalException`, dll.) yang ditangkap dan diterjemahkan menjadi respons JSON HTTP yang rapi (400 Bad Request / 403 Forbidden). |
| **Collection Framework** | Penggunaan `ArrayList`, `Map`, dan `List` pada repositori dan rekapitulasi data. |
| **File Handling** | Pembacaan dan penulisan berkas teks berpemisah `|` pada direktori `data/` via `PenyimpananData`. |

---

## 2. Pilihan Arsitektur HTTP Server

Untuk mengekspos endpoint REST API dari Java, terdapat 2 pendekatan yang dapat dipilih:

### Opsi A (Direkomendasikan): Native `com.sun.net.httpserver.HttpServer`
* **Kelebihan**: Bawaan standar JDK (JDK 8+), **tanpa dependensi eksternal / Maven / Gradle**. Perintah `build.sh` dan `run.sh` tetap ringan dan bekerja langsung di semua lingkungan praktikum.
* **Karakteristik**: Menggunakan HTTP Handler modular dan JSON parsing utilitas sederhana.

### Opsi B: Spring Boot / Javalin (Jika Diizinkan Asisten Lab)
* **Kelebihan**: Anotasi `@RestController`, auto JSON serialization Jackson.
* **Catatan**: Memerlukan konfigurasi `pom.xml` (Maven) atau `build.gradle`.

> **Catatan Proyek:** Roadmap tugas di bawah dirancang agar kompatibel dengan Opsi A (tanpa dependensi luar) maupun Opsi B.

---

## 3. Roadmap Tahapan Pengerjaan BE (Fase 1 s.d. Fase 5)

```
[FASE 1: Audit & Restrukturisasi Core]
  └── TASK-BE-01: Audit Domain Model, Repositori, dan Kepatuhan OOP PBO
        │
[FASE 2: Pondasi REST API & Komunikasi]
  ├── TASK-BE-02: Setup HTTP Server, Dispatcher Router & Penanganan CORS
  └── TASK-BE-03: Layer DTO & Utilitas Serialisasi/Deserialisasi JSON
        │
[FASE 3: Implementasi Endpoints Bisnis]
  ├── TASK-BE-04: API Autentikasi, Registrasi & RBAC (3 Peran)
  ├── TASK-BE-05: API Master Data Inventaris, Ruangan & Cek Stok Dinamis
  ├── TASK-BE-06: API Siklus Peminjaman Barang & Validasi Aturan R1-R5
  ├── TASK-BE-07: API Siklus Booking Ruangan & Validasi Slot S1-S7
  └── TASK-BE-08: API Rekapitulasi, Pelaporan & Pelacakan Jatuh Tempo
        │
[FASE 4: Sinkronisasi Persistensi & Verifikasi]
  └── TASK-BE-09: Integrasi Penyimpanan Data Berkas Teks & Otomasi Pengujian
        │
[FASE 5: Deployment Backend & Kontrak API FE]
  └── Validasi integrasi cURL/Postman siap konsumsi oleh tim Frontend
```

---

## 4. Daftar Modul Tugas Backend (`docs/TaskBE/`)

| File Task | Nama Tugas | Fokus Utama | Status |
| --- | --- | --- | :---: |
| [TASK-BE-01](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskBE/TASK-BE-01_REFACTORING_CORE_DAN_PBO_AUDIT.md) | Refactoring Core & Audit Kepatuhan OOP | Memisahkan Swing GUI tanpa merusak model, aturan, repositori, layanan | **[x] SELESAI** |
| [TASK-BE-02](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskBE/TASK-BE-02_HTTP_SERVER_ROUTER_DAN_CORS.md) | HTTP Server, Router & CORS | Inisialisasi HTTP Server Java, router modular, support OPTIONS/CORS untuk FE | **[x] SELESAI** |
| [TASK-BE-03](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskBE/TASK-BE-03_DTO_DAN_JSON_SERIALIZER.md) | DTO Layer & JSON Parser | Parsing body request JSON & format respons JSON standar | **[x] SELESAI** |
| [TASK-BE-04](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskBE/TASK-BE-04_AUTH_DAN_RBAC_HANDLER.md) | Autentikasi & RBAC (3 Peran) | Login, register mahasiswa, validasi wewenang (Mahasiswa, Petugas, Pembina) | **[x] SELESAI** |
| [TASK-BE-05](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskBE/TASK-BE-05_INVENTARIS_DAN_STOK_API.md) | Master Data & Cek Stok Dinamis | Katalog barang, ruangan, kategori, cek ketersediaan stok per tanggal | **[x] SELESAI** |
| [TASK-BE-06](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskBE/TASK-BE-06_TRANSAKSI_PEMINJAMAN_API.md) | Peminjaman Barang & Rule Engine R1-R5 | Pengajuan multi-item, approval pembina, verifikasi petugas, denda | **[x] SELESAI** |
| [TASK-BE-07](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskBE/TASK-BE-07_BOOKING_RUANGAN_API.md) | Booking Ruangan & Rule Engine S1-S7 | Slot jam 07.00-21.00, deteksi bentrok jadwal, pembatalan & denda | **[x] SELESAI** |
| [TASK-BE-08](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskBE/TASK-BE-08_LAPORAN_DAN_STATISTIK_API.md) | Pelaporan & Statistik | Rekapitulasi kategori, utilisasi ruangan per jam, jatuh tempo | **[x] SELESAI** |
| [TASK-BE-09](file:///home/refael_tobing/Kuliah/Semester%203/Prak%20PBO/Final%20Project/PinjamYuk/docs/TaskBE/TASK-BE-09_PENGUJIAN_API_DAN_DOKUMENTASI.md) | Pengujian API & Persistensi File | Uji otomatis endpoint HTTP, integritas file handling `data/`, Postman/OpenAPI | **[x] SELESAI** |

---

## 5. Standar Format Respons REST API

Semua endpoint Backend Java wajib mengembalikan format JSON standar:

### Respons Berhasil (HTTP 200 / 201)
```json
{
  "sukses": true,
  "pesan": "Operasi berhasil dijalankan",
  "data": { ... }
}
```

### Respons Gagal / Validasi Ditolak (HTTP 400 / 401 / 403 / 404 / 500)
```json
{
  "sukses": false,
  "pesan": "Jumlah stok barang 'PROY-01' tidak mencukupi untuk rentang tanggal tersebut.",
  "kodeKesalahan": "STOK_TIDAK_CUKUP",
  "detail": [ ... ]
}
```

