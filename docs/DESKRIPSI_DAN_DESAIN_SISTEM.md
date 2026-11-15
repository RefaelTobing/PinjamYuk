# DOKUMEN ARSITEKTUR, DESKRIPSI SISTEM & DESIGN SYSTEM
## SIPINJAM (PinjamYuk) — Sistem Peminjaman Inventaris, Sarana Prasarana, dan Ruangan Kampus

---

## 1. Deskripsi Aplikasi

### 1.1 Latar Belakang & Masalah
Pengelolaan sarana dan prasarana di lingkungan kampus sering menghadapi kendala operasional akibat pencatatan manual:
1. **Ketidakpastian Ketersediaan Barang**: Mahasiswa harus datang langsung untuk menanyakan sisa stok proyektor, speaker, atau alat lab pada tanggal kegiatan mereka.
2. **Double Booking Ruangan**: Terjadinya bentrok penggunaan ruang rapat atau aula karena verifikasi jadwal dilakukan terpisah lewat pesan singkat.
3. **Pengembalian Tidak Terkontrol & Denda Liar**: Tidak adanya perhitungan denda otomatis untuk keterlambatan dan kerusakan fisik menyebabkan kampus menanggung kerugian aset.
4. **Persetujuan Berlapis yang Lambat**: Barang bernilai tinggi (alat laboratorium dan perangkat elektronik khusus) memerlukan tanda tangan dosen pembina yang sulit ditemui secara fisik.

### 1.2 Solusi: Sistem SIPINJAM
**SIPINJAM (PinjamYuk)** adalah sistem informasi berbasis arsitektur *Client-Server (Decoupled)*:
- **Backend (BE)**: Dibangun murni menggunakan **Java** dengan penerapan prinsip **Pemrograman Berorientasi Objek (PBO)** yang ketat, mengelola aturan bisnis (*Rule Engine*), kalkulasi denda polimorfik, serta persistensi data file handling.
- **Frontend (FE)**: Antarmuka berbasis web modern (**FE Bebas** — React/Vite/Tailwind CSS) yang reaktif, menyajikan visualisasi slot ruangan interaktif dan katalog inventaris dengan pengecekan stok dinamis.

### 1.3 Aktor dan Hak Akses (RBAC)

```mermaid
graph TD
    A["Pengguna Sistem"] --> M["Mahasiswa"]
    A --> P["Petugas Sarpras"]
    A --> D["Dosen Pembina"]

    M -->|"1. Jelajah katalog & sisa stok dinamis"| M1["Peminjaman Barang"]
    M -->|"2. Pilih slot jam 07.00-21.00"| M2["Booking Ruangan"]
    M -->|"3. Pantau status & denda"| M3["Riwayat Transaksi"]

    P -->|"1. Kelola barang, ruangan, tarif"| P1["Master Data"]
    P -->|"2. Approval & serah terima"| P2["Operasional Sirkulasi"]
    P -->|"3. Cek kondisi fisik & tagih denda"| P3["Pengembalian"]
    P -->|"4. Unduh laporan & pantau jatuh tempo"| P4["Monitoring"]

    D -->|"1. Review barang lab / elektronik khusus"| D1["Antrean Persetujuan"]
    D -->|"2. Pantau utilisasi fasilitas"| D2["Laporan Penggunaan"]
```

---

## 2. Arsitektur Sistem & Komunikasi Data

Aplikasi mengadopsi pola **Decoupled Architecture**: Frontend dan Backend berjalan independen dan berkomunikasi melalui protokol HTTP dengan pertukaran data berformat JSON.

```mermaid
flowchart LR
    subgraph ClientLayer ["Frontend (Web Bebas - React / Tailwind)"]
        UI_M["Portal Mahasiswa"]
        UI_P["Portal Petugas Sarpras"]
        UI_D["Portal Dosen Pembina"]
        AXIOS["API Client (Axios + Interceptor)"]
    end

    subgraph ServerLayer ["Backend Engine (Java JDK)"]
        HTTP["HTTP Server & CORS Dispatcher"]
        ROUTER["API Router"]
        AUTH["Auth & RBAC Handler"]
        
        subgraph BusinessLogic ["Core OOP Engine"]
            SRV_P["LayananPeminjaman"]
            SRV_B["LayananBookingRuangan"]
            SRV_K["LayananKetersediaan"]
            KALK["KalkulatorDenda (Polimorfik)"]
            RULES["ValidatorPeminjaman (Strategy Rules R1-R5, S1-S7)"]
        end

        subgraph DataLayer ["Penyimpanan Berkas"]
            REPO["Repositori In-Memory"]
            FILE["File Handling (data/*.txt via Pemisah Baris '|')"]
        end
    end

    UI_M --> AXIOS
    UI_P --> AXIOS
    UI_D --> AXIOS

    AXIOS <-->|"REST API (JSON over HTTP:8080)"| HTTP
    HTTP --> ROUTER
    ROUTER --> AUTH
    AUTH --> BusinessLogic
    BusinessLogic --> REPO
    REPO <--> FILE
```

---

## 3. Design System (Frontend UI/UX)

Untuk memastikan pengalaman pengguna yang profesional, konsisten, dan mudah digunakan pada saat demonstrasi praktikum, sistem menerapkan panduan desain berikut:

### 3.1 Skema Warna Identitas Peran

| Peran Pengguna | Warna Primer | Kode Hex | Karakter / Makna |
| --- | --- | --- | --- |
| **Mahasiswa** | Indigo / Deep Blue | `#3B82F6` / `#1D4ED8` | Akademis, ramah pengguna, berorientasi layanan |
| **Petugas Sarpras** | Emerald / Forest Teal | `#10B981` / `#047857` | Manajemen aset, operasional, ketertiban fasilitas |
| **Dosen Pembina** | Amber / Burnt Orange | `#F59E0B` / `#B45309` | Pengawasan, persetujuan otoritas, verifikasi |

### 3.2 Indikator Status Transaksi (Badge System)

| Status | Warna Latar | Warna Teks | Keterangan |
| --- | --- | --- | --- |
| `MENUNGGU_PEMBINA` | Amber Muda (`#FEF3C7`) | Amber Tua (`#92400E`) | Menunggu verifikasi dosen pembina |
| `DIAJUKAN` | Biru Langit (`#E0F2FE`) | Biru Tua (`#0369A1`) | Menunggu verifikasi petugas sarpras |
| `DISETUJUI` | Indigo Muda (`#EEF2FF`) | Indigo Tua (`#3730A3`) | Telah disetujui, siap serah terima barang |
| `DIPINJAM` / `TERPAKAI` | Ungu Muda (`#F3E8FF`) | Ungu Tua (`#6B21A8`) | Fisik barang / ruangan sedang aktif digunakan |
| `DIKEMBALIKAN` / `SELESAI`| Hijau Muda (`#DCFCE7`) | Hijau Tua (`#15803D`) | Transaksi ditutup tanpa masalah |
| `DITOLAK` / `DIBATALKAN` | Merah Muda (`#FEE2E2`) | Merah Tua (`#991B1B`) | Dibatalkan atau ditolak verifikator |

### 3.3 Visualisasi Slot Waktu Ruangan (07.00 - 21.00)
Grid jadwal ruangan memiliki 3 state visual:
- **Slot Hijau** (`#22C55E`): Kosong / Tersedia untuk dibooking.
- **Slot Merah / Gelap** (`#EF4444` / `#64748B`): Terisi / Sedang Terpakai (terkunci dengan tooltip nama kegiatan).
- **Slot Kuning Menyala** (`#FACC15`): Sedang dipilih oleh pengguna pada sesi aktif.

---

## 4. Flowchart Alur Bisnis (Business Process Workflows)

### 4.1 Flowchart Siklus Peminjaman Barang Inventaris

```mermaid
flowchart TD
    Start(["Mulai: Mahasiswa Buka Katalog"]) --> InputTgl["Input Rentang Tanggal (Mulai & Selesai)"]
    InputTgl --> CheckClient{"Validasi Batas Waktu<br/>H-1 & Durasi <= 7 Hari?"}
    CheckClient -- "Tidak" --> AlertClient["Tampilkan Kesalahan Validasi Tanggal"]
    AlertClient --> InputTgl
    CheckClient -- "Ya" --> QueryStok["API: Cek Stok Tersedia per Tanggal"]
    QueryStok --> PilihBarang["Pilih Barang & Tentukan Kuantitas (Multi-Item)"]
    PilihBarang --> InputKeperluan["Isi Keperluan Kegiatan & Submit"]
    
    InputKeperluan --> RunRules{"Eksekusi ValidatorPeminjaman<br/>(R1: Mhs Aktif?<br/>R2: Peminjaman Aktif <= 2?<br/>R3: Bebas Tunggakan Denda?<br/>Stok Aktual Cukup?)"}
    RunRules -- "Ada Aturan Dilanggar" --> TolakPengajuan["HTTP 400: Tolak & Tampilkan Pesan Aturan"]
    
    RunRules -- "Lolos Seluruh Aturan" --> CheckNeedPembina{"Apakah Ada Barang Perlu<br/>Persetujuan Pembina?"}
    CheckNeedPembina -- "Ya" --> StatusMenunggu["Status: MENUNGGU_PEMBINA"]
    CheckNeedPembina -- "Tidak" --> StatusDiajukan["Status: DIAJUKAN"]
    
    StatusMenunggu --> ActionPembina{"Keputusan Dosen Pembina?"}
    ActionPembina -- "Tolak + Alasan" --> StatusDitolak["Status: DITOLAK"]
    ActionPembina -- "Setuju" --> StatusDiajukan
    
    StatusDiajukan --> ActionPetugas{"Verifikasi Petugas Sarpras?"}
    ActionPetugas -- "Tolak + Alasan" --> StatusDitolak
    ActionPetugas -- "Setuju" --> StatusDisetujui["Status: DISETUJUI"]
    
    StatusDisetujui --> SerahTerima["Mahasiswa Datang ke Sarpras:<br/>Petugas Catat Kondisi Awal"]
    SerahTerima --> StatusDipinjam["Status: DIPINJAM"]
    
    StatusDipinjam --> Pengembalian["Selesai Kegiatan:<br/>Pengembalian Fisik Barang"]
    Pengembalian --> Inspeksi["Petugas Catat Tanggal Nyata &<br/>Kondisi Akhir Setiap Item Barang"]
    Inspeksi --> HitungDenda["KalkulatorDenda Polimorfik:<br/>1. Denda Keterlambatan (Hari x Tarif Harian)<br/>2. Denda Kerusakan/Kehilangan (% Harga Satuan)"]
    HitungDenda --> SelesaiPinjam["Status: DIKEMBALIKAN<br/>Data Tersimpan ke Berkas Teks"]
    SelesaiPinjam --> End(["Selesai"])
    StatusDitolak --> End
```

---

### 4.2 Flowchart Siklus Booking Ruangan

```mermaid
flowchart TD
    StartBkg(["Mulai: Mahasiswa Buka Jadwal Ruangan"]) --> PilihRuang["Pilih Ruangan & Tanggal Pemakaian (Min. H-3)"]
    PilihRuang --> FetchJadwal["API: Ambil Matriks Slot Jam (07.00 - 21.00)"]
    FetchJadwal --> PilihSlot["Pilih Slot Jam (Kelipatan 1 Jam, Maks. 4 Jam)"]
    PilihSlot --> InputForm["Input Jumlah Peserta & Keperluan"]
    
    InputForm --> CheckRules{"Validator Slot Ruangan:<br/>S1: 07.00 - 21.00?<br/>S2: Durasi 1 s.d. 4 Jam?<br/>S3: Tumpang Tindih Slot (Bentrok)?<br/>S4: Peserta <= Kapasitas Ruangan?<br/>R1-R3: Status Mhs, Kuota, Bebas Denda?"}
    
    CheckRules -- "Bentrok / Tidak Valid" --> RejectBkg["Tolak Pengajuan & Tampilkan Alasan"]
    CheckRules -- "Valid" --> LockSlot["Status: DIAJUKAN<br/>(Slot Langsung Terkunci di Jadwal)"]
    
    LockSlot --> ActionVerif{"Verifikasi Petugas Sarpras?"}
    ActionVerif -- "Tolak" --> BkgDitolak["Status: DITOLAK<br/>Slot Dilepas Kembali"]
    ActionVerif -- "Setuju" --> BkgDisetujui["Status: DISETUJUI"]
    
    BkgDisetujui --> CheckBatal{"Apakah Mahasiswa Ingin Membatalkan?"}
    CheckBatal -- "Ya" --> CheckWaktuBatal{"Waktu Pembatalan?"}
    CheckWaktuBatal -- ">= H-1" --> BatalBebas["Batal Tanpa Biaya (Denda Rp0)"]
    CheckWaktuBatal -- "< H-1 (Mendadak)" --> BatalDenda["Denda Pembatalan Rp50.000<br/>Dicatat sebagai Tunggakan"]
    BatalBebas --> BkgDilepas["Status: DIBATALKAN<br/>Slot Jadwal Dibuka Kembali"]
    BatalDenda --> BkgDilepas
    
    CheckBatal -- "Tidak" --> JamMulai["Jam Pemakaian Berlangsung"]
    JamMulai --> StatusTerpakai["Status: TERPAKAI"]
    StatusTerpakai --> JamSelesai["Jam Selesai Terlewati"]
    JamSelesai --> StatusSelesai["Status: SELESAI"]
    StatusSelesai --> EndBkg(["Selesai"])
```

---

### 4.3 Flowchart Perhitungan Denda Pengembalian Barang (Polimorfik)

```mermaid
flowchart TD
    StartDenda(["Mulai Kalkulasi Denda"]) --> TglKembali["Input Tanggal Kembali & Tanggal Selesai"]
    TglKembali --> CalcLate["Hari Terlambat = Maksimum(0, TanggalKembali - TanggalSelesai)"]
    
    CalcLate --> LoopItem["Iterasi Setiap Item Barang yang Dikembalikan"]
    LoopItem --> CheckType{"Tipe Subkelas Barang?"}
    
    CheckType -- "BarangElektronik" --> TarifElek["Tarif Terlambat: Rp10.000/hari<br/>Rusak Ringan: Rp100.000<br/>Rusak Berat: 40% Harga Satuan<br/>Hilang: 100% Harga Satuan"]
    CheckType -- "AlatLaboratorium" --> TarifLab["Tarif Terlambat: Rp15.000/hari<br/>Rusak Ringan: Rp75.000<br/>Rusak Berat: 50% Harga Satuan<br/>Hilang: 100% Harga Satuan"]
    CheckType -- "BarangFurnitur" --> TarifFur["Tarif Terlambat: Rp5.000/hari<br/>Rusak Ringan: Rp25.000<br/>Rusak Berat: 30% Harga Satuan<br/>Hilang: 100% Harga Satuan"]
    
    TarifElek --> Subtotal
    TarifLab --> Subtotal
    TarifFur --> Subtotal
    
    Subtotal["Subtotal Item = (HariTerlambat x TarifHarian) + BiayaKondisi(KondisiAkhir)"]
    Subtotal --> MoreItem{"Masih Ada Item Lain?"}
    MoreItem -- "Ya" --> LoopItem
    MoreItem -- "Tidak" --> TotalDenda["Total Denda = Sum(Subtotal Seluruh Item)"]
    TotalDenda --> CetakRincian["Buat Objek RincianDenda & Tampilkan ke Petugas"]
    CetakRincian --> EndDenda(["Selesai"])
```

---

## 5. Rancangan Berorientasi Objek (Backend Java PBO)

Backend Java mengimplementasikan struktur kelas yang modular dengan arah dependensi satu arah:
$$\text{API Handlers} \longrightarrow \text{Layanan (Services)} \longrightarrow \text{Aturan \& Repositori} \longrightarrow \text{Model Domain}$$

```mermaid
classDiagram
    class Pengguna {
        <<abstract>>
        -String id
        -String username
        -String password
        -String nama
        +getPeran()* String
        +tampilkanProfil()* void
    }

    class Mahasiswa {
        -String nim
        -String prodi
        -boolean statusAktif
        -double tunggakanDenda
        +getPeran() String
        +isBolehMeminjam() boolean
    }

    class PetugasSarpras {
        -String nip
        -String unitKerja
        +getPeran() String
    }

    class DosenPembina {
        -String nidn
        -String jabatan
        +getPeran() String
    }

    Pengguna <|-- Mahasiswa
    Pengguna <|-- PetugasSarpras
    Pengguna <|-- DosenPembina

    class Barang {
        <<abstract>>
        -String kode
        -String nama
        -int stok
        -double hargaSatuan
        -boolean perluPersetujuan
        +getJenisBarang()* String
        +tarifHarian()* double
        +biayaKondisi(KondisiBarang k)* double
    }

    class BarangElektronik {
        -int masaGaransi
        +tarifHarian() double
        +biayaKondisi(KondisiBarang k) double
    }

    class AlatLaboratorium {
        -String laboratorium
        +tarifHarian() double
        +biayaKondisi(KondisiBarang k) double
    }

    class BarangFurnitur {
        -String bahan
        +tarifHarian() double
        +biayaKondisi(KondisiBarang k) double
    }

    class Ruangan {
        -int kapasitas
        -String fasilitas
        -boolean aktif
        +tarifHarian() double
        +biayaKondisi(KondisiBarang k) double
    }

    Barang <|-- BarangElektronik
    Barang <|-- AlatLaboratorium
    Barang <|-- BarangFurnitur
    Barang <|-- Ruangan

    class AturanPeminjaman {
        <<interface>>
        +getNamaAturan() String
        +periksa(Mahasiswa m, KonteksPengajuan k) void
    }

    class ValidatorPeminjaman {
        -List~AturanPeminjaman~ daftarAturan
        +validasi(Mahasiswa m, KonteksPengajuan k) void
    }

    class Peminjaman {
        -String id
        -Mahasiswa peminjam
        -LocalDate tanggalMulai
        -LocalDate tanggalSelesai
        -StatusPeminjaman status
        -List~DetailPeminjaman~ items
        -Pengembalian pengembalian
        +hitungHariTerlambat(LocalDate tglKembali) int
    }

    class BookingRuangan {
        -String id
        -Mahasiswa pemesan
        -Ruangan ruangan
        -LocalDate tanggal
        -SlotWaktu slot
        -int jumlahPeserta
        -StatusBooking status
    }

    ValidatorPeminjaman o-- AturanPeminjaman
    Peminjaman *-- DetailPeminjaman
    DetailPeminjaman --> Barang
    BookingRuangan --> Ruangan
```

---

## 6. Format Penyimpanan Berkas Teks (`data/`)

Data disimpan permanen menggunakan berkas teks berpemisah pipa (`|`) tanpa basis data SQL luar, sesuai persyaratan praktikum:

### 6.1 `data/pengguna.txt`
```
USR-001|petugas|petugas123|Budi Santoso|PETUGAS_SARPRAS|NIP-19800101|Sarana dan Prasarana
USR-002|pembina|pembina123|Dr. Hendra Wijaya|DOSEN_PEMBINA|NIDN-070102|Pembina Kemahasiswaan
USR-003|mahasiswa|mahasiswa123|Ahmad Fauzi|MAHASISWA|21044110001|D3 Teknik Informatika|AKTIF|0
```

### 6.2 `data/barang.txt`
```
PROY-01|Proyektor Epson EB-X400|Elektronik|5|5000000|TIDAK|BarangElektronik|24
LAB-01|Mikroskop Binokuler Olympus|Laboratorium|3|12000000|YA|AlatLaboratorium|Lab Biologi
FUR-01|Kursi Lipat Chitose|Furnitur|50|250000|TIDAK|BarangFurnitur|Baja & Busa
R-AULA-01|Aula Gedung Utama|Ruangan|1|0|TIDAK|Ruangan|150|AC, Sound System, Proyektor|AKTIF
```

### 6.3 `data/peminjaman.txt`
```
PINJAM-001|USR-003|2026-11-20|2026-11-22|DIKEMBALIKAN|Seminar Himpunan|2026-11-23|120000|LUNAS|PROY-01:1:BAIK:BAIK;FUR-01:10:BAIK:RUSAK_RINGAN
```

### 6.4 `data/booking.txt`
```
BKG-001|USR-003|R-AULA-01|2026-11-25|08:00|12:00|80|Seminar Kewirausahaan|DISETUJUI|0
```

---

## 7. Standar Kontrak REST API (JSON)

### 7.1 Format Respons Berhasil (200 OK / 201 Created)
```json
{
  "sukses": true,
  "pesan": "Operasi peminjaman berhasil diajukan",
  "data": {
    "id": "PINJAM-005",
    "status": "MENUNGGU_PEMBINA",
    "tanggalMulai": "2026-11-20",
    "tanggalSelesai": "2026-11-22"
  }
}
```

### 7.2 Format Respons Kesalahan / Penolakan Aturan (400 / 403 / 409)
```json
{
  "sukses": false,
  "pesan": "Pengajuan ditolak: Mahasiswa masih memiliki tunggakan denda sebesar Rp 50.000 (Aturan R3)",
  "kodeKesalahan": "ATURAN_TUNGGAKAN_DENDA",
  "detail": {
    "aturan": "R3_TUNGGAKAN_DENDA",
    "tunggakan": 50000
  }
}
```

---

## 8. Panduan Menjalankan Sistem

Untuk menjalankan seluruh sistem secara terpisah:

```bash
# 1. Jalankan Backend Server Java (Port 8080)
javac -encoding UTF-8 -d out $(find src -name "*.java")
java -cp out sipinjam.AplikasiServer --port 8080

# 2. Jalankan Frontend Web Modern (Port 5173)
cd frontend
npm run dev
```
Akses antarmuka pengguna pada peramban melalui alamat: **`http://localhost:5173`**.
