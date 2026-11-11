# DRAF MINGGU 1 — ANALISIS DAN PERANCANGAN SISTEM
## TEMU: Aplikasi Pelaporan dan Pencocokan Barang Hilang di Lingkungan Kampus Berbasis Java

Mata Kuliah: Praktikum Pemrograman Berorientasi Objek
Program Studi: D3 Teknik Informatika PSDKU Lamongan
Bentuk: Kelompok (maksimal 3 mahasiswa)
Status dokumen: DRAF — bagian bertanda `[ISI SENDIRI]` wajib dilengkapi sebelum diserahkan.

---

# BAB I — PENDAHULUAN

## 1.1 Latar Belakang

Barang pribadi mahasiswa (dompet, kunci kendaraan, telepon seluler, flashdisk, jas laboratorium, buku, dan alat praktikum) sering tertinggal di ruang kelas, laboratorium, kantin, perpustakaan, atau area parkir. Ketika barang hilang, mekanisme pencarian yang tersedia saat ini masih tersebar dan tidak terpusat: informasi disampaikan melalui grup percakapan angkatan, unggahan cerita pada media sosial, pengumuman lisan, atau bertanya langsung ke petugas keamanan. Akibatnya terjadi tiga masalah pokok.

Pertama, informasi terpisah-pisah. Laporan kehilangan dan laporan penemuan berada pada kanal yang berbeda, sehingga mahasiswa yang kehilangan barang tidak mengetahui bahwa barangnya sudah ditemukan dan disimpan di suatu tempat. Kedua, tidak ada rekam jejak. Karena laporan hanya berupa percakapan yang tenggelam oleh pesan lain, tidak ada catatan siapa melaporkan apa, kapan, dan di mana, sehingga barang yang telah diserahkan sulit ditelusuri kembali. Ketiga, tidak ada verifikasi kepemilikan. Barang temuan yang diklaim tanpa bukti berpotensi disalahgunakan, sementara pemilik sebenarnya tidak memiliki cara untuk membuktikan kepemilikannya secara tercatat.

Berdasarkan kondisi tersebut, diperlukan sebuah aplikasi yang memusatkan proses pelaporan barang hilang dan barang temuan dalam satu sistem, mampu mencocokkan laporan kehilangan dengan laporan penemuan secara otomatis berdasarkan kategori barang, lokasi, rentang waktu, dan ciri khusus barang, serta menyediakan alur klaim yang terverifikasi. Aplikasi ini dikembangkan menggunakan bahasa pemrograman Java dengan menerapkan konsep Object-Oriented Programming, yaitu encapsulation, inheritance, polymorphism, dan abstraction, serta dilengkapi exception handling, Collection Framework, dan file handling sebagai media penyimpanan data.

`[ISI SENDIRI — data pendukung]` Paragraf di atas sengaja tidak memuat angka statistik. Jangan menuliskan persentase atau jumlah kasus tanpa sumber. Cara mengisinya dengan cara yang sah:
1. Lakukan observasi langsung di lingkungan kampus (misalnya mencatat jumlah unggahan barang hilang pada grup angkatan selama dua pekan) dan tuliskan tanggal serta kanal observasinya.
2. Atau sebar kuesioner singkat kepada mahasiswa satu angkatan (misalnya 20–30 responden), lalu tuliskan "berdasarkan kuesioner terhadap 24 mahasiswa pada [tanggal], 17 responden menyatakan pernah kehilangan barang di kampus dan hanya 6 yang barangnya kembali".
3. Cantumkan hasilnya sebagai data primer pada lampiran laporan.

## 1.2 Rumusan Masalah

1. Bagaimana merancang aplikasi yang memusatkan pelaporan barang hilang dan barang temuan mahasiswa sehingga informasi tidak lagi tersebar di berbagai kanal komunikasi?
2. Bagaimana mencocokkan laporan kehilangan dengan laporan penemuan secara otomatis berdasarkan kategori barang, lokasi, rentang waktu, dan ciri khusus barang sehingga peluang barang kembali meningkat?
3. Bagaimana memastikan bahwa klaim atas barang temuan dilakukan oleh pemilik yang sah melalui alur verifikasi yang tercatat?
4. Bagaimana menerapkan encapsulation, inheritance, polymorphism, dan abstraction beserta exception handling, Collection Framework, dan file handling pada aplikasi yang dibangun?

## 1.3 Tujuan Pengembangan Aplikasi

1. Menghasilkan aplikasi Java yang memusatkan pelaporan barang hilang dan barang temuan di lingkungan kampus.
2. Menghasilkan mekanisme pencocokan otomatis yang menampilkan daftar kandidat barang temuan beserta skor dan alasan kecocokan untuk setiap laporan kehilangan.
3. Menghasilkan alur klaim dan verifikasi kepemilikan yang tercatat sehingga penyerahan barang dapat dipertanggungjawabkan.
4. Menerapkan seluruh konsep OOP yang dipersyaratkan pada struktur program yang modular dan terorganisasi.

## 1.4 Batasan Masalah

1. Aplikasi berbasis desktop dan dijalankan secara lokal (single user), tidak menggunakan jaringan atau layanan daring.
2. Data disimpan pada berkas lokal (file handling), belum menggunakan sistem basis data.
3. Data induk kategori barang dan lokasi kampus diinput oleh admin melalui aplikasi, tidak diambil dari sistem informasi kampus.
4. Lokasi barang dipilih dari daftar lokasi yang tersedia, bukan melalui pelacakan GPS.
5. Foto barang tidak diunggah sebagai berkas gambar ke dalam sistem; pengguna hanya menuliskan nama berkas foto sebagai rujukan.
6. Verifikasi klaim dilakukan secara manual oleh admin melalui aplikasi, bukan melalui pemeriksaan dokumen otomatis.
7. Aplikasi tidak menyediakan notifikasi otomatis ke perangkat pengguna.
8. Antarmuka menggunakan [Console / Graphical User Interface (Swing)] — `[PILIH SALAH SATU, sesuaikan dengan kesepakatan kelompok]`.

## 1.5 Manfaat

1. Bagi mahasiswa: menyediakan satu kanal resmi untuk melaporkan barang hilang maupun temuan, serta mempercepat proses pencocokan.
2. Bagi pengelola kampus (BEM/petugas): mempermudah pendataan barang temuan, verifikasi klaim, dan penyusunan rekap.
3. Bagi penulis: menjadi sarana penerapan langsung konsep OOP pada permasalahan nyata.

---

# BAB II — ANALISIS DAN PERANCANGAN SISTEM

## 2.1 Deskripsi Sistem

TEMU adalah aplikasi desktop berbasis Java yang mengelola siklus hidup barang hilang dan barang temuan di lingkungan kampus, mulai dari pelaporan, pencocokan otomatis, pengajuan klaim, verifikasi klaim, hingga pelaporan statistik.

Alur umum sistem:
1. Mahasiswa membuat laporan kehilangan atau laporan penemuan dengan mengisi data barang (nama, kategori, ciri khusus, deskripsi), lokasi, tanggal, dan keterangan tambahan.
2. Sistem menyimpan laporan dan secara otomatis mencari kandidat kecocokan pada kumpulan laporan dengan jenis berlawanan.
3. Sistem menampilkan daftar kandidat yang terurut berdasarkan skor kecocokan beserta alasan kecocokannya.
4. Mahasiswa mengajukan klaim atas laporan penemuan yang dianggap cocok, disertai bukti kepemilikan berupa ciri khusus yang hanya diketahui pemilik.
5. Admin memeriksa klaim dan memutuskan diterima atau ditolak dengan catatan alasan.
6. Jika klaim diterima, status kedua laporan diubah menjadi selesai dan barang dinyatakan telah kembali.
7. Sistem menyajikan rekap jumlah laporan per kategori dan lokasi serta persentase barang yang berhasil kembali.

## 2.2 Aktor

| Aktor | Deskripsi | Hak Akses Utama |
|---|---|---|
| Mahasiswa | Pengguna yang melaporkan kehilangan, melaporkan temuan, mencari laporan, dan mengajukan klaim | Membuat, mengubah, dan menutup laporannya sendiri; mengajukan klaim; melihat riwayat |
| Admin (Pengelola TEMU) | Pengurus/petugas yang mengelola data induk dan memverifikasi klaim | Kelola kategori dan lokasi; verifikasi/tolak klaim; melihat seluruh laporan dan rekap; menghapus laporan tidak valid |

## 2.3 Kebutuhan Fungsional

| Kode | Kebutuhan Fungsional | Aktor |
|---|---|---|
| FR-01 | Sistem dapat melakukan registrasi dan login dengan peran (mahasiswa/admin) | Mahasiswa, Admin |
| FR-02 | Sistem dapat menampilkan, menambah, mengubah, dan menghapus data mahasiswa | Admin |
| FR-03 | Sistem dapat menampilkan, menambah, mengubah, dan menghapus data kategori barang | Admin |
| FR-04 | Sistem dapat menampilkan, menambah, mengubah, dan menghapus data lokasi kampus | Admin |
| FR-05 | Sistem dapat mencatat laporan kehilangan barang (nama barang, kategori, ciri khusus, deskripsi, lokasi terakhir, tanggal kejadian, kontak) | Mahasiswa |
| FR-06 | Sistem dapat mencatat laporan penemuan barang (nama barang, kategori, kondisi barang, lokasi penemuan, tanggal penemuan, tempat penyimpanan barang) | Mahasiswa |
| FR-07 | Sistem dapat mengubah dan menutup laporan yang dibuat oleh pengguna yang bersangkutan | Mahasiswa |
| FR-08 | Sistem dapat menghapus laporan yang tidak valid beserta catatan alasannya | Admin |
| FR-09 | Sistem dapat mencari dan memfilter laporan berdasarkan kata kunci, kategori, lokasi, jenis laporan, status, dan rentang tanggal | Mahasiswa, Admin |
| FR-10 | Sistem dapat menampilkan kandidat kecocokan laporan kehilangan dengan laporan penemuan secara otomatis, terurut berdasarkan skor, beserta alasan kecocokan | Mahasiswa |
| FR-11 | Sistem dapat menerima pengajuan klaim atas laporan penemuan beserta bukti kepemilikan, dan menolak pengajuan ganda pada laporan yang sama | Mahasiswa |
| FR-12 | Sistem dapat memverifikasi klaim (setuju/tolak) dengan catatan alasan, lalu memperbarui status laporan terkait | Admin |
| FR-13 | Sistem dapat menampilkan riwayat laporan dan klaim per mahasiswa | Mahasiswa, Admin |
| FR-14 | Sistem dapat menampilkan rekap statistik: jumlah laporan per kategori, per lokasi, dan persentase barang kembali | Admin |
| FR-15 | Sistem dapat menyimpan seluruh data ke berkas dan memuatnya kembali saat aplikasi dijalankan | Sistem |
| FR-16 | Sistem dapat memvalidasi seluruh input pengguna dan menampilkan pesan kesalahan yang jelas tanpa menghentikan aplikasi | Sistem |
| FR-17 | Sistem dapat menandai laporan kehilangan yang melewati batas waktu tertentu sebagai kadaluarsa | Sistem |

## 2.4 Kebutuhan Non-Fungsional

1. Aplikasi berjalan pada Java Development Kit versi 8 atau lebih baru tanpa dependensi pustaka eksternal wajib.
2. Struktur program modular: pemisahan lapisan model (data), layanan (logika), penyimpanan (berkas), dan antarmuka (tampilan).
3. Data tetap tersimpan setelah aplikasi ditutup dan dapat dimuat kembali tanpa kehilangan data.
4. Pesan kesalahan ditampilkan dalam bahasa Indonesia yang mudah dipahami pengguna.
5. Seluruh atribut data dilindungi (private) dan hanya diakses melalui method yang disediakan.

## 2.5 Use Case Diagram

Aktor: Mahasiswa, Admin.

| Kode | Use Case | Aktor | Relasi |
|---|---|---|---|
| UC-01 | Login | Mahasiswa, Admin | — |
| UC-02 | Registrasi akun mahasiswa | Mahasiswa | — |
| UC-03 | Kelola data mahasiswa | Admin | `<<include>>` UC-01 |
| UC-04 | Kelola kategori barang | Admin | `<<include>>` UC-01 |
| UC-05 | Kelola lokasi kampus | Admin | `<<include>>` UC-01 |
| UC-06 | Buat laporan kehilangan | Mahasiswa | `<<include>>` UC-09 (pencocokan otomatis) |
| UC-07 | Buat laporan penemuan | Mahasiswa | `<<include>>` UC-09 (pencocokan otomatis) |
| UC-08 | Cari dan filter laporan | Mahasiswa, Admin | — |
| UC-09 | Lihat kandidat kecocokan | Mahasiswa | `<<include>>` UC-01 |
| UC-10 | Ajukan klaim barang | Mahasiswa | `<<include>>` UC-09, `<<extend>>` UC-11 |
| UC-11 | Unggah/isikan bukti kepemilikan | Mahasiswa | `<<extend>>` dari UC-10 |
| UC-12 | Verifikasi klaim | Admin | `<<include>>` UC-01 |
| UC-13 | Lihat riwayat laporan dan klaim | Mahasiswa, Admin | — |
| UC-14 | Lihat rekap statistik | Admin | `<<include>>` UC-01 |
| UC-15 | Simpan dan muat data | Sistem | — |

Untuk digambar di draw.io, susun dua kolom aktor (Mahasiswa kiri, Admin kanan), tempatkan UC-01 s.d. UC-15 di tengah, lalu tarik garis asosiasi sesuai kolom Aktor. Hubungkan UC-06 dan UC-07 ke UC-09 dengan panah putus-putus bertanda `<<include>>`, dan UC-11 ke UC-10 dengan `<<extend>>`.

## 2.6 Skenario Use Case Utama (Contoh Format)

Use case: UC-09 Lihat kandidat kecocokan
Aktor: Mahasiswa
Prakondisi: Pengguna sudah login; laporan kehilangan sudah tersimpan.
Alur utama:
1. Mahasiswa membuka detail laporan kehilangannya.
2. Sistem mengambil seluruh laporan penemuan berstatus terbuka.
3. Sistem menghitung skor kecocokan setiap laporan penemuan terhadap laporan kehilangan tersebut.
4. Sistem menyaring kandidat dengan skor di bawah ambang batas.
5. Sistem mengurutkan kandidat dari skor tertinggi dan menampilkan maksimal lima kandidat beserta skor dan alasan kecocokan.
6. Mahasiswa memilih salah satu kandidat untuk melihat detail atau mengajukan klaim.

Alur alternatif:
3a. Tidak ada laporan penemuan yang tersimpan — sistem menampilkan pesan "belum ada laporan penemuan".
4a. Seluruh kandidat berada di bawah ambang batas — sistem menampilkan pesan bahwa belum ada kandidat yang cocok dan menyarankan pemantauan berkala.

## 2.7 Proses Utama: Aturan Pencocokan Otomatis

Pencocokan dilakukan antara satu laporan kehilangan dan satu laporan penemuan. Skor total berkisar 0–100 dengan pembagian bobot sebagai berikut.

| Kriteria | Aturan Penilaian | Bobot Maksimum |
|---|---|---|
| Kategori barang | Kategori identik mendapat nilai penuh; berbeda mendapat 0 | 30 |
| Lokasi | Lokasi identik mendapat nilai penuh; berbeda mendapat 0 | 25 |
| Selisih waktu | 0 hari = 25; 1–3 hari = 15; 4–7 hari = 8; lebih dari 7 hari = 0 | 25 |
| Kemiripan kata kunci | Perbandingan kata pada nama barang dan ciri khusus menggunakan irisan kata (Jaccard) dikalikan bobot | 20 |

Kandidat ditampilkan apabila skor total minimal 45, diurutkan dari skor tertinggi, maksimal lima kandidat. Sistem juga menampilkan alasan kecocokan, misalnya "kategori sama, lokasi sama, selisih 1 hari".

Catatan perancangan: bobot setiap kriteria disimpan pada masing-masing kelas kriteria sehingga dapat diubah tanpa mengubah logika perhitungan. Perhitungan total dilakukan oleh satu method yang menerima kumpulan kriteria, sehingga penambahan kriteria baru tidak memerlukan perubahan pada kode pemanggil. Inilah alasan pemakaian interface pada bagian ini.

## 2.8 Rancangan Kelas

### 2.8.1 Daftar Kelas

| No | Kelas / Interface | Jenis | Tanggung Jawab |
|---|---|---|---|
| 1 | `Pengguna` | abstract class | Menyimpan identitas dasar pengguna; menyediakan method abstrak `getPeran()` dan `tampilkanProfil()` |
| 2 | `Mahasiswa` | class (extends Pengguna) | Menyimpan NIM, program studi, nomor telepon |
| 3 | `Admin` | class (extends Pengguna) | Menyimpan jabatan/unit kerja |
| 4 | `Barang` | class | Menyimpan nama barang, kategori, ciri khusus, dan deskripsi |
| 5 | `Kategori` | class | Data induk kategori barang |
| 6 | `Lokasi` | class | Data induk lokasi kampus |
| 7 | `Laporan` | abstract class | Menyimpan data laporan (id, barang, pelapor, lokasi, tanggal, status); method abstrak `getJenis()` dan `getDeskripsiSingkat()` |
| 8 | `LaporanKehilangan` | class (extends Laporan) | Menyimpan tanggal kejadian dan kontak; meng-override `getJenis()` dan `getDeskripsiSingkat()` |
| 9 | `LaporanPenemuan` | class (extends Laporan) | Menyimpan kondisi barang dan tempat penyimpanan; meng-override `getJenis()` dan `getDeskripsiSingkat()` |
| 10 | `Klaim` | class | Menyimpan pengajuan klaim: laporan penemuan, pengklaim, bukti kepemilikan, status, catatan admin |
| 11 | `KriteriaPencocokan` | interface | Mendefinisikan `getNama()`, `getBobot()`, dan `hitungSkor(Laporan, Laporan)` |
| 12 | `KriteriaKategori` | class (implements KriteriaPencocokan) | Menilai kesamaan kategori |
| 13 | `KriteriaLokasi` | class (implements KriteriaPencocokan) | Menilai kesamaan lokasi |
| 14 | `KriteriaWaktu` | class (implements KriteriaPencocokan) | Menilai kedekatan selisih tanggal |
| 15 | `KriteriaKataKunci` | class (implements KriteriaPencocokan) | Menilai kemiripan kata pada nama dan ciri barang |
| 16 | `HasilPencocokan` | class | Menyimpan pasangan laporan, skor total, dan daftar alasan kecocokan |
| 17 | `MesinPencocokan` | class | Menghitung skor total dari seluruh kriteria dan mengurutkan hasil |
| 18 | `RepositoriLaporan` | class | Menyimpan dan mengelola koleksi laporan (`ArrayList<Laporan>`), pencarian, dan filter |
| 19 | `RepositoriPengguna` | class | Menyimpan dan mengelola koleksi pengguna (`ArrayList<Pengguna>`) |
| 20 | `RepositoriKlaim` | class | Menyimpan dan mengelola koleksi klaim (`ArrayList<Klaim>`) |
| 21 | `PenyimpananData` | class | Menyimpan dan memuat seluruh data ke/dari berkas |
| 22 | `LayananTemu` | class | Mengatur alur bisnis: buat laporan, cari kandidat, ajukan klaim, verifikasi klaim, rekap |
| 23 | `RekapStatistik` | class | Menghitung rekap per kategori, per lokasi, dan persentase barang kembali |
| 24 | `AplikasiTemu` | class | Kelas utama yang menjalankan aplikasi dan menu antarmuka |

### 2.8.2 Rincian Atribut dan Method Kelas Inti

Kelas `Pengguna` (abstract)
```
- idPengguna : String
- nama       : String
- username   : String
- password   : String
+ Pengguna(idPengguna, nama, username, password)
+ getUsername() : String
+ cekPassword(input : String) : boolean
+ getPeran() : String            <<abstract>>
+ tampilkanProfil() : String     <<abstract>>
```

Kelas `Laporan` (abstract)
```
- idLaporan    : String
- barang       : Barang
- pelapor      : Pengguna
- lokasi       : Lokasi
- tanggal      : LocalDate
- keterangan   : String
- status       : StatusLaporan
+ Laporan(idLaporan, barang, pelapor, lokasi, tanggal, keterangan)
+ getJenis() : String                    <<abstract>>
+ getDeskripsiSingkat() : String         <<abstract>>
+ getStatus() / setStatus(status)
+ tandaiSelesai()
+ tampilkanDetail() : String             (dapat di-override)
```

Kelas `LaporanKehilangan` (extends Laporan)
```
- tanggalKejadian : LocalDate
- kontakPelapor   : String
+ getJenis() : String                 -> "KEHILANGAN"
+ getDeskripsiSingkat() : String      -> "Hilang: <nama barang> di <lokasi>"
+ tampilkanDetail() : String          (override, menambahkan kontak)
```

Kelas `LaporanPenemuan` (extends Laporan)
```
- kondisiBarang     : String
- tempatPenyimpanan : String
+ getJenis() : String                 -> "PENEMUAN"
+ getDeskripsiSingkat() : String      -> "Ditemukan: <nama barang> di <lokasi>"
+ tampilkanDetail() : String          (override, menambahkan tempat penyimpanan)
```

Interface `KriteriaPencocokan`
```
+ getNama() : String
+ getBobot() : double
+ hitungSkor(laporanHilang : Laporan, laporanTemu : Laporan) : double
```

Kelas `MesinPencocokan`
```
- daftarKriteria : ArrayList<KriteriaPencocokan>
- ambangBatas    : double
+ tambahKriteria(k : KriteriaPencocokan)
+ hitungSkor(hilang : LaporanKehilangan, temu : LaporanPenemuan) : HasilPencocokan
+ cariKandidat(hilang : LaporanKehilangan, semuaTemuan : ArrayList<Laporan>) : ArrayList<HasilPencocokan>
```

Kelas `Klaim`
```
- idKlaim            : String
- laporanPenemuan    : LaporanPenemuan
- pengklaim          : Mahasiswa
- buktiKepemilikan   : String
- waktuPengajuan     : LocalDateTime
- status             : StatusKlaim
- catatanAdmin       : String
+ verifikasi(admin : Admin, disetujui : boolean, catatan : String) : void
+ getStatus() : StatusKlaim
```

## 2.9 Class Diagram (Relasi Antar Kelas)

Hubungan utama yang wajib tergambar:

1. Generalisasi (inheritance):
   `Pengguna` ⟵ `Mahasiswa`, `Pengguna` ⟵ `Admin`
   `Laporan` ⟵ `LaporanKehilangan`, `Laporan` ⟵ `LaporanPenemuan`
2. Realisasi (interface):
   `KriteriaPencocokan` ⟵ `KriteriaKategori`, `KriteriaLokasi`, `KriteriaWaktu`, `KriteriaKataKunci`
3. Asosiasi:
   `Laporan` — `Barang` (satu laporan memiliki satu barang)
   `Laporan` — `Lokasi`
   `Laporan` — `Pengguna` (pelapor)
   `Klaim` — `LaporanPenemuan`, `Klaim` — `Mahasiswa`
4. Agregasi / komposisi:
   `MesinPencocokan` ◇— `KriteriaPencocokan` (0..*)
   `RepositoriLaporan` ◇— `Laporan` (0..*)
   `RepositoriPengguna` ◇— `Pengguna` (0..*)
   `RepositoriKlaim` ◇— `Klaim` (0..*)
5. Ketergantungan:
   `LayananTemu` ⇢ `RepositoriLaporan`, `RepositoriKlaim`, `MesinPencocokan`, `PenyimpananData`
   `AplikasiTemu` ⇢ `LayananTemu`

Blok Mermaid berikut dapat ditempel ke mermaid.live untuk menghasilkan gambar class diagram, lalu diunduh sebagai PNG untuk laporan:

```
classDiagram
    class Pengguna {
        <<abstract>>
        -String idPengguna
        -String nama
        -String username
        -String password
        +getPeran() String
        +tampilkanProfil() String
    }
    class Mahasiswa {
        -String nim
        -String programStudi
        -String noTelepon
    }
    class Admin {
        -String jabatan
    }
    class Barang {
        -String namaBarang
        -String ciriKhusus
        -String deskripsi
    }
    class Kategori {
        -String idKategori
        -String namaKategori
    }
    class Lokasi {
        -String idLokasi
        -String namaLokasi
    }
    class Laporan {
        <<abstract>>
        -String idLaporan
        -LocalDate tanggal
        -String keterangan
        -StatusLaporan status
        +getJenis() String
        +getDeskripsiSingkat() String
    }
    class LaporanKehilangan {
        -LocalDate tanggalKejadian
        -String kontakPelapor
        +getJenis() String
    }
    class LaporanPenemuan {
        -String kondisiBarang
        -String tempatPenyimpanan
        +getJenis() String
    }
    class Klaim {
        -String idKlaim
        -String buktiKepemilikan
        -StatusKlaim status
        -String catatanAdmin
        +verifikasi(Admin, boolean, String) void
    }
    class KriteriaPencocokan {
        <<interface>>
        +getNama() String
        +getBobot() double
        +hitungSkor(Laporan, Laporan) double
    }
    class KriteriaKategori
    class KriteriaLokasi
    class KriteriaWaktu
    class KriteriaKataKunci
    class HasilPencocokan {
        -double skorTotal
        -String alasan
    }
    class MesinPencocokan {
        -double ambangBatas
        +cariKandidat(LaporanKehilangan, ArrayList) ArrayList
    }
    class RepositoriLaporan {
        -ArrayList daftarLaporan
        +tambah(Laporan) void
        +cari(String) ArrayList
    }
    class RepositoriPengguna {
        -ArrayList daftarPengguna
        +cariUsername(String) Pengguna
    }
    class RepositoriKlaim {
        -ArrayList daftarKlaim
        +tambah(Klaim) void
        +cariMenunggu() ArrayList
    }
    class LayananTemu
    class PenyimpananData
    class RekapStatistik
    class AplikasiTemu

    Pengguna <|-- Mahasiswa
    Pengguna <|-- Admin
    Laporan <|-- LaporanKehilangan
    Laporan <|-- LaporanPenemuan
    KriteriaPencocokan <|.. KriteriaKategori
    KriteriaPencocokan <|.. KriteriaLokasi
    KriteriaPencocokan <|.. KriteriaWaktu
    KriteriaPencocokan <|.. KriteriaKataKunci
    Laporan --> Barang
    Laporan --> Lokasi
    Laporan --> Pengguna
    Barang --> Kategori
    Klaim --> LaporanPenemuan
    Klaim --> Mahasiswa
    MesinPencocokan o-- KriteriaPencocokan
    MesinPencocokan --> HasilPencocokan
    RepositoriLaporan o-- Laporan
    RepositoriPengguna o-- Pengguna
    RepositoriKlaim o-- Klaim
    LayananTemu --> RepositoriLaporan
    LayananTemu --> RepositoriPengguna
    LayananTemu --> RepositoriKlaim
    LayananTemu --> MesinPencocokan
    LayananTemu --> PenyimpananData
    LayananTemu --> RekapStatistik
    AplikasiTemu --> LayananTemu
```

## 2.10 Pemetaan Konsep OOP ke Implementasi

Tabel ini dipakai untuk menjawab pertanyaan dosen dan mengisi BAB III laporan.

| Konsep | Ketentuan pada Instruksi | Rencana Implementasi | Alasan Pemakaian |
|---|---|---|---|
| Class dan Object | Minimal 5 kelas saling berinteraksi | 24 kelas/interface (lihat 2.8.1), dengan `LayananTemu` sebagai pengatur interaksi | Setiap kelas mewakili satu entitas atau satu tanggung jawab tunggal |
| Constructor berparameter | Wajib | Seluruh kelas model memiliki constructor berparameter; beberapa memiliki constructor overloading | Objek tidak dapat dibuat dalam keadaan tidak valid |
| Encapsulation | Atribut private + getter/setter | Semua atribut model `private`; setter hanya dibuat untuk atribut yang memang boleh diubah, dan memuat validasi | Melindungi integritas data (misalnya skor tidak dapat diubah dari luar) |
| Inheritance | Minimal satu hubungan pewarisan | `Pengguna` → `Mahasiswa`, `Admin`; `Laporan` → `LaporanKehilangan`, `LaporanPenemuan` | Dua jenis laporan berbagi data dan perilaku yang sama, hanya berbeda pada atribut khusus dan cara menampilkan ringkasan |
| Polymorphism | Overriding atau interface secara polimorfik | (a) Overriding `getJenis()`, `getDeskripsiSingkat()`, `tampilkanDetail()`; (b) satu loop memanggil `kriteria.hitungSkor(...)` pada `ArrayList<KriteriaPencocokan>` | Daftar laporan dapat ditampilkan seragam, dan penambahan kriteria pencocokan baru tidak mengubah kode perhitungan |
| Abstraction | Minimal satu abstract class atau interface | `Pengguna` dan `Laporan` sebagai abstract class; `KriteriaPencocokan` sebagai interface | Objek `Pengguna` atau `Laporan` generik tidak boleh berdiri sendiri tanpa jenis yang jelas |
| Exception Handling | try-catch yang sesuai | `InputTidakValidException`, `DataTidakDitemukanException`, `KlaimGandaException`, `AksesDitolakException`, `FormatBerkasException`; ditangkap pada lapisan layanan dan ditampilkan sebagai pesan | Kesalahan input pengguna tidak boleh menghentikan aplikasi |
| Collection | ArrayList atau lainnya | `ArrayList<Laporan>`, `ArrayList<Pengguna>`, `ArrayList<Klaim>`, `ArrayList<KriteriaPencocokan>`; `Map<String, Integer>` untuk rekap statistik | Data bersifat dinamis dan perlu diiterasi |
| File Handling | Simpan dan baca data | Berkas teks berpemisah `|` (pipe) untuk pengguna, kategori, lokasi, laporan, dan klaim; dimuat otomatis saat aplikasi mulai dan disimpan setelah setiap perubahan | Data tetap tersedia setelah aplikasi ditutup |

Penerapan pola perancangan (opsional, bernilai tambah pada komponen struktur program):
- Strategy: `KriteriaPencocokan` memungkinkan algoritma penilaian diganti tanpa mengubah `MesinPencocokan`.
- Facade: `LayananTemu` menyederhanakan akses antarmuka ke seluruh repositori dan mesin pencocokan.
- Repository: pemisahan penyimpanan koleksi dari logika bisnis.

## 2.11 Rancangan Penyimpanan Data (File Handling)

Format berkas: teks dengan pemisah `|`, satu baris satu data, disimpan pada folder `data/`. Berkas yang dibuat:

```
data/pengguna.txt     -> idPengguna|nama|username|password|peran|nim_atau_jabatan
data/kategori.txt     -> idKategori|namaKategori
data/lokasi.txt       -> idLokasi|namaLokasi
data/laporan.txt      -> idLaporan|jenis|namaBarang|idKategori|ciriKhusus|idLokasi|tanggal|keterangan|idPelapor|status|dataKhusus
data/klaim.txt        -> idKlaim|idLaporanTemuan|usernamePengklaim|bukti|waktu|status|catatanAdmin
```

`dataKhusus` pada `laporan.txt` berisi atribut khas per jenis laporan (untuk laporan kehilangan: tanggal kejadian dan kontak; untuk laporan penemuan: kondisi barang dan tempat penyimpanan). Saat memuat data, program membaca kolom `jenis` lebih dahulu untuk menentukan objek subclass yang akan dibuat.

## 2.12 Rancangan Antarmuka (Menu)

Menu Mahasiswa:
1. Login
2. Lapor barang hilang
3. Lapor barang temuan
4. Cari laporan
5. Lihat kandidat kecocokan untuk laporan saya
6. Ajukan klaim
7. Riwayat laporan dan klaim saya
8. Ubah profil
9. Keluar

Menu Admin:
1. Login
2. Kelola data mahasiswa
3. Kelola kategori barang
4. Kelola lokasi kampus
5. Lihat semua laporan dan filter
6. Hapus laporan tidak valid
7. Verifikasi klaim
8. Rekap statistik
9. Keluar

## 2.13 Rencana Pengujian (Untuk BAB IV)

| Kode | Skenario Uji | Input | Hasil yang Diharapkan |
|---|---|---|---|
| TC-01 | Input kategori kosong saat membuat laporan | Field kategori dikosongkan | Muncul pesan validasi, laporan tidak tersimpan |
| TC-02 | Tanggal di masa depan | Tanggal kejadian diisi melebihi hari ini | Ditolak dengan pesan kesalahan |
| TC-03 | Login dengan password salah | Password keliru | Muncul pesan, aplikasi tetap berjalan |
| TC-04 | Pencocokan menemukan kandidat | Laporan hilang dompet di Kantin, laporan temuan dompet di Kantin dengan selisih 1 hari | Muncul sebagai kandidat teratas dengan skor tinggi dan alasan kecocokan |
| TC-05 | Pencocokan tanpa kandidat | Kategori, lokasi, dan tanggal seluruhnya berbeda | Muncul pesan belum ada kandidat yang cocok |
| TC-06 | Klaim ganda | Dua mahasiswa mengajukan klaim atas laporan temuan yang sama | Pengajuan kedua ditolak dengan pesan klaim ganda |
| TC-07 | Verifikasi klaim ditolak | Admin menolak dengan catatan | Status klaim menjadi ditolak, laporan kembali berstatus terbuka |
| TC-08 | Verifikasi klaim diterima | Admin menyetujui | Status klaim dan kedua laporan berubah menjadi selesai |
| TC-09 | Simpan lalu muat data | Tambah laporan, tutup aplikasi, jalankan ulang | Data laporan masih tampil lengkap termasuk atribut khusus subkelas |
| TC-10 | Berkas data rusak | Baris pada berkas data diubah formatnya | Muncul pesan kesalahan berkas, aplikasi tidak berhenti mendadak |
| TC-11 | Akses menu admin oleh mahasiswa | Mahasiswa membuka menu verifikasi klaim | Ditolak dengan pesan akses ditolak |
| TC-12 | Pencarian dan filter | Kata kunci "dompet", filter kategori Dompet | Hanya laporan relevan yang tampil |

---

# RENCANA KERJA 4 MINGGU

| Minggu | Target | Keluaran |
|---|---|---|
| 1 | Analisis dan perancangan | Dokumen ini dilengkapi data pendukung, use case diagram, class diagram final, persetujuan dosen |
| 2 | Implementasi konsep OOP | Struktur paket, seluruh kelas model, inheritance, interface, konstruktor, encapsulation, exception |
| 3 | Pengembangan dan integrasi | Menu lengkap, Collection, file handling, perhitungan pencocokan, klaim, rekap, pengujian awal |
| 4 | Pengujian dan finalisasi | 12 skenario uji dijalankan, perbaikan bug, laporan BAB I–V, video demonstrasi 5–10 menit, slide presentasi |

# RENCANA PEMBAGIAN TUGAS (3 ORANG, SESUAIKAN NAMA)

| Anggota | Fokus Utama | Berkas/Bagian |
|---|---|---|
| Anggota 1 | Model dan relasi kelas | `Pengguna`, `Mahasiswa`, `Admin`, `Barang`, `Kategori`, `Lokasi`, `Laporan`, `LaporanKehilangan`, `LaporanPenemuan` |
| Anggota 2 | Logika pencocokan dan klaim | `KriteriaPencocokan` beserta empat implementasinya, `MesinPencocokan`, `HasilPencocokan`, `Klaim`, `LayananTemu` |
| Anggota 3 | Antarmuka, penyimpanan, dokumentasi | `AplikasiTemu`, `PenyimpananData`, `Repositori*`, `RekapStatistik`, penulisan laporan dan video |

Catatan keadilan nilai: bagian pemahaman individu dinilai 10% dan dosen boleh menunjuk anggota secara acak untuk menjelaskan kode. Karena itu setiap anggota tetap harus bisa menjelaskan alur keseluruhan, bukan hanya bagiannya.

---

# CHECKLIST MINGGU 1 (Sebelum diserahkan)

- [ ] Judul dan studi kasus disetujui dosen pengampu (wajib menurut poin 3)
- [ ] Data pendukung pada latar belakang dilengkapi (hasil observasi atau kuesioner)
- [ ] Pilihan antarmuka ditetapkan: console atau Swing
- [ ] Use case diagram digambar di draw.io dan diekspor
- [ ] Class diagram dirender dari blok Mermaid dan diekspor
- [ ] Nama anggota kelompok dan pembagian tugas dicantumkan
- [ ] Batasan masalah disesuaikan dengan kemampuan kelompok (jangan menjanjikan fitur yang tidak akan selesai)
