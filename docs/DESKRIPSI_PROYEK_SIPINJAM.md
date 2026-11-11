# DESKRIPSI PROYEK — SIPINJAM

## Sistem Informasi Peminjaman Inventaris, Sarana Prasarana, dan Ruangan Kampus oleh Mahasiswa Berbasis Java

| Atribut | Keterangan |
| --- | --- |
| Mata kuliah | Praktikum Pemrograman Berorientasi Objek (PBO) |
| Program studi | D3 Teknik Informatika PSDKU Lamongan |
| Jenis tugas | Final Project (kelompok, maksimal 3 mahasiswa) |
| Bahasa pemrograman | Java (JDK 8 atau lebih baru) |
| Jenis aplikasi | Aplikasi desktop Java Swing, berjalan lokal (single user per sesi) |
| Media penyimpanan | Berkas teks berpemisah (`file handling`), tanpa basis data |
| Durasi pengerjaan | 4 minggu |
| Status dokumen | Deskripsi proyek — acuan penulisan laporan BAB I dan BAB II |

> Bagian bertanda `[ISI SENDIRI]` wajib dilengkapi sebelum dokumen diserahkan. Jangan menuliskan angka statistik tanpa sumber.

## 1. Ringkasan Proyek

SIPINJAM adalah aplikasi desktop berbasis Java yang memusatkan seluruh proses peminjaman sarana dan prasarana kampus oleh mahasiswa dalam satu sistem. Aplikasi ini menangani dua jenis sumber daya yang selama ini dicatat secara manual, yaitu **barang inventaris** (proyektor, pengeras suara, kursi lipat, meja, jas laboratorium, alat praktikum) dan **ruangan** (ruang kelas, ruang rapat, aula, laboratorium).

Masalah pokok yang diselesaikan bukan sekadar pendataan, melainkan **penentuan ketersediaan secara otomatis**. Untuk barang, sistem menghitung sisa stok pada rentang tanggal yang diminta. Untuk ruangan, sistem memeriksa tumpang tindih slot jam pada tanggal tertentu. Kedua pemeriksaan itu memakai kelas abstrak dan antarmuka yang sama, sehingga penambahan jenis sumber daya baru tidak mengubah alur pengajuan.

Seluruh proses berjalan dalam satu siklus: mahasiswa mengajukan, sistem memeriksa kelayakan peminjam dan ketersediaan sumber daya, petugas memverifikasi (dan dosen pembina menyetujui untuk sumber daya tertentu), petugas mencatat serah terima, lalu mencatat pengembalian beserta kondisi akhir dan denda yang timbul. Di luar siklus itu, sistem menyediakan rekap peminjaman dan tingkat utilisasi ruangan.

## 2. Permasalahan yang Diselesaikan

### 2.1 Peminjaman barang inventaris

1. **Ketersediaan tidak dapat diketahui tanpa bertanya.** Mahasiswa harus datang ke ruang sarana dan prasarana untuk memastikan barang tersedia pada tanggal kegiatan. Jika barang sedang dipinjam, mahasiswa kembali lagi atau mencari alternatif mendadak.
2. **Tidak ada pencegahan bentrok jadwal.** Dua kegiatan pada tanggal yang sama dapat meminjam barang yang sama karena pencatatan manual tidak memeriksa tumpang tindih tanggal.
3. **Pengembalian tidak terkendali.** Tanpa penagihan dan sanksi yang dihitung otomatis, barang melewati tenggat tanpa ada tindakan, dan tidak ada daftar barang yang belum kembali.
4. **Kondisi barang saat kembali tidak tercatat.** Kerusakan atau kehilangan tidak dapat ditelusuri ke peminjam yang bertanggung jawab, sehingga biaya perbaikan ditanggung kampus.
5. **Riwayat tidak terpusat.** Catatan pada buku tidak dapat dicari kembali, tidak dapat diurutkan per peminjam, dan tidak dapat diolah menjadi laporan bulanan.
6. **Persetujuan berlapis berjalan lambat.** Tanda tangan koordinator atau dosen pembina harus ditempuh secara fisik, padahal sebagian barang memerlukan persetujuan dan sebagian tidak.

### 2.2 Booking ruangan dan tempat

7. **Jadwal pemakaian ruangan tidak terpublikasi.** Mahasiswa tidak tahu slot mana yang masih kosong pada tanggal tertentu, sehingga sering datang ke ruangan yang sudah terpakai atau sudah dibooking organisasi lain.
8. **Double booking.** Dua kegiatan dapat memesan ruangan yang sama pada jam yang sama karena persetujuan diberikan lewat pesan singkat tanpa pemeriksaan jadwal terpusat.
9. **Pembatalan mendadak tanpa konsekuensi.** Ruangan yang sudah dibooking lalu ditinggalkan membuat slot terbuang, sementara kegiatan lain yang membutuhkan ruangan tersebut sudah ditolak.
10. **Utilisasi ruangan tidak terukur.** Tidak ada data berapa jam sebuah ruangan terpakai per bulan, sehingga pengelola kampus tidak punya dasar untuk menambah, mengurangi, atau memindahkan jadwal pemakaian.

## 3. Ruang Lingkup

| Modul | Cakupan | Di luar cakupan |
| --- | --- | --- |
| Inventaris dan peminjaman barang | Katalog barang, stok, pengajuan multi-item, pemeriksaan ketersediaan per rentang tanggal, persetujuan berjenjang, serah terima, pengembalian, denda | Pelacakan fisik barang (barcode/RFID), integrasi sistem aset kampus |
| Booking ruangan | Jadwal slot per ruangan per tanggal, pengajuan booking, deteksi bentrok jam, batas kapasitas, pembatalan berdenda, penandaan slot terpakai | Integrasi jadwal kuliah resmi, booking berulang otomatis (recurring), persetujuan multi-level di luar petugas |
| Pengguna dan hak akses | Login tiga peran, registrasi mahasiswa, pengelolaan data mahasiswa | Integrasi SSO kampus, reset kata sandi melalui surel |
| Pelaporan | Rekap peminjaman per kategori dan per periode, tingkat keterlambatan, utilisasi ruangan per jam | Dasbor daring, ekspor ke format lain selain berkas teks |
| Penyimpanan | Berkas teks berpemisah pada folder `data/`, dimuat saat aplikasi mulai | Basis data relasional, sinkronisasi antar komputer |

## 4. Aktor dan Hak Akses

| Aktor | Deskripsi | Hak akses utama |
| --- | --- | --- |
| Mahasiswa | Pemohon peminjaman barang dan booking ruangan | Melihat katalog dan jadwal, mengajukan, membatalkan pengajuannya sendiri, melihat riwayat dan denda, mengubah profil |
| Petugas Sarana dan Prasarana | Pengelola inventaris dan jadwal ruangan | Mengelola data barang, ruangan, kategori, tarif denda; memverifikasi pengajuan dan booking; mencatat serah terima dan pengembalian; mencetak rekap |
| Dosen Pembina | Pemberi persetujuan atas sumber daya tertentu | Menyetujui atau menolak pengajuan yang ditandai memerlukan persetujuan; melihat rekap dan daftar jatuh tempo |

## 5. Kebutuhan Fungsional

### 5.1 Autentikasi dan data induk

| Kode | Kebutuhan fungsional | Aktor |
| --- | --- | --- |
| FR-01 | Sistem menyediakan login dengan peran (mahasiswa, petugas, pembina) dan menolak kata sandi salah tanpa menghentikan aplikasi | Semua |
| FR-02 | Sistem menyediakan registrasi akun mahasiswa dengan validasi NIM unik | Mahasiswa |
| FR-03 | Sistem menyediakan pengelolaan data mahasiswa (tambah, ubah, nonaktifkan) | Petugas |
| FR-04 | Sistem menyediakan pengelolaan kategori barang | Petugas |
| FR-05 | Sistem menyediakan pengelolaan data barang: kode, nama, kategori, stok, harga satuan, status perlu persetujuan pembina | Petugas |
| FR-06 | Sistem menyediakan pengelolaan data ruangan: kode, nama, kapasitas, fasilitas, status aktif | Petugas |
| FR-07 | Sistem menyediakan pengelolaan tarif denda per jenis barang dan denda pembatalan ruangan | Petugas |

### 5.2 Peminjaman barang

| Kode | Kebutuhan fungsional | Aktor |
| --- | --- | --- |
| FR-08 | Sistem menampilkan katalog barang beserta sisa stok pada rentang tanggal yang dipilih | Mahasiswa |
| FR-09 | Sistem menerima pengajuan peminjaman berisi satu atau lebih barang, jumlah, tanggal mulai, tanggal selesai, dan keperluan | Mahasiswa |
| FR-10 | Sistem menjalankan seluruh aturan kelayakan peminjam secara otomatis sebelum pengajuan disimpan | Sistem |
| FR-11 | Sistem menandai pengajuan yang memerlukan persetujuan dosen pembina dan menerima keputusan setuju atau tolak beserta catatan | Dosen Pembina |
| FR-12 | Sistem menerima verifikasi petugas (setuju atau tolak) beserta catatan alasan | Petugas |
| FR-13 | Sistem mencatat serah terima barang beserta kondisi awal dan mengubah status menjadi dipinjam | Petugas |
| FR-14 | Sistem mencatat pengembalian beserta kondisi akhir per item dan tanggal kembali | Petugas |
| FR-15 | Sistem menghitung denda keterlambatan dan denda kondisi secara otomatis sesuai jenis barang | Sistem |
| FR-16 | Sistem menerima pembatalan pengajuan oleh mahasiswa selama belum diserahterimakan | Mahasiswa |
| FR-17 | Sistem menampilkan daftar peminjaman yang mendekati atau melewati tenggat | Petugas, Dosen Pembina |
| FR-18 | Sistem menampilkan riwayat peminjaman dan denda per mahasiswa | Mahasiswa, Petugas |

### 5.3 Booking ruangan

| Kode | Kebutuhan fungsional | Aktor |
| --- | --- | --- |
| FR-19 | Sistem menampilkan jadwal slot ruangan per tanggal: slot kosong, terisi, dan terpakai, beserta kegiatan yang menempatinya | Mahasiswa, Petugas |
| FR-20 | Sistem menerima pengajuan booking ruangan berisi ruangan, tanggal, jam mulai, jam selesai, jumlah peserta, dan keperluan | Mahasiswa |
| FR-21 | Sistem menolak booking yang bentrok dengan slot lain, di luar jam operasional, atau melebihi kapasitas ruangan | Sistem |
| FR-22 | Sistem menerima verifikasi booking oleh petugas (setuju atau tolak) beserta catatan alasan | Petugas |
| FR-23 | Sistem menerima pembatalan booking oleh mahasiswa dan menghitung denda pembatalan bila dilakukan kurang dari satu hari sebelum tanggal pemakaian | Mahasiswa, Sistem |
| FR-24 | Sistem menandai slot sebagai sedang terpakai pada jam berjalan dan selesai setelah jam selesai terlewati | Sistem |

### 5.4 Pelaporan dan sistem

| Kode | Kebutuhan fungsional | Aktor |
| --- | --- | --- |
| FR-25 | Sistem menampilkan rekap jumlah peminjaman per kategori, tingkat keterlambatan, dan utilisasi ruangan per jam | Petugas, Dosen Pembina |
| FR-26 | Sistem menyimpan seluruh data ke berkas dan memuatnya kembali saat aplikasi dijalankan | Sistem |
| FR-27 | Sistem memvalidasi seluruh input dan menampilkan pesan kesalahan berbahasa Indonesia tanpa menghentikan aplikasi | Sistem |

## 6. Alur Utama

### 6.1 Siklus peminjaman barang

1. Mahasiswa memilih tanggal kegiatan, lalu melihat katalog beserta sisa stok pada tanggal tersebut.
2. Mahasiswa menyusun pengajuan berisi satu atau lebih barang dan jumlahnya.
3. Sistem memeriksa kelengkapan input, kelayakan peminjam (R1–R5), dan ketersediaan barang.
4. Bila barang yang diajukan wajib disetujui pembina, pengajuan masuk ke antrean pembina; bila tidak, langsung ke petugas.
5. Petugas memverifikasi pengajuan. Penolakan wajib disertai alasan.
6. Petugas mencatat serah terima dan kondisi awal barang; status berubah menjadi dipinjam.
7. Pada tanggal selesai, petugas mencatat pengembalian dan kondisi akhir per item.
8. Sistem menghitung denda (keterlambatan dan/atau kondisi), lalu menutup peminjaman.

### 6.2 Siklus booking ruangan

1. Mahasiswa memilih tanggal, lalu sistem menampilkan peta slot ruangan yang masih kosong.
2. Mahasiswa memilih satu ruangan, jam mulai, jam selesai (kelipatan satu jam, maksimal empat jam), jumlah peserta, dan keperluan.
3. Sistem memeriksa kelayakan peminjam (R1–R5), jam operasional, batas kapasitas, dan tumpang tindih slot.
4. Bila lolos, booking berstatus diajukan dan menunggu verifikasi petugas; slot terkunci untuk pengajuan lain sejak status diajukan.
5. Petugas memverifikasi. Setelah disetujui, slot tampil sebagai terisi pada jadwal.
6. Pada jam pemakaian, slot ditandai sedang terpakai; setelah jam selesai terlewati, slot ditandai selesai.
7. Pembatalan oleh mahasiswa hanya dapat dilakukan selama booking belum berjalan; pembatalan kurang dari satu hari sebelum tanggal pemakaian dikenai denda pembatalan.

## 7. Aturan Bisnis

### 7.1 Ketersediaan barang

Ketersediaan diperiksa dengan menghitung jumlah unit yang sudah terpakai pada rentang tanggal yang diminta. Dua rentang dinyatakan bertumpang tindih apabila tanggal mulai peminjaman pertama tidak melewati tanggal selesai peminjaman kedua dan sebaliknya.

```
terpakai(barang, mulai, selesai) = jumlah semua detail peminjaman
    yang barangnya sama, statusnya DISETUJUI atau DIPINJAM,
    dan rentang tanggalnya bertumpang tindih dengan (mulai, selesai)

tersedia(barang, mulai, selesai) = stok - terpakai(barang, mulai, selesai)
```

Pengajuan ditolak bila `tersedia < jumlah yang diminta` untuk salah satu item.

### 7.2 Aturan kelayakan peminjam

| Kode | Aturan | Ketentuan |
| --- | --- | --- |
| R1 | Status mahasiswa | Hanya mahasiswa berstatus aktif yang boleh mengajukan |
| R2 | Batas peminjaman aktif | Maksimal dua pengajuan aktif (DIAJUKAN, DISETUJUI, DIPINJAM, atau BOOKING aktif) dalam satu waktu |
| R3 | Tunggakan denda | Pengajuan ditolak bila masih ada denda yang belum dibayar |
| R4 | Batas waktu pengajuan | Barang: paling lambat satu hari sebelum tanggal mulai. Ruangan: paling lambat tiga hari sebelum tanggal pemakaian |
| R5 | Durasi | Barang: maksimal tujuh hari. Ruangan: maksimal empat jam per pengajuan, dalam satu hari |

### 7.3 Denda barang

| Jenis barang | Denda per hari | Rusak ringan | Rusak berat | Hilang |
| --- | --- | --- | --- | --- |
| BarangElektronik | Rp10.000 | Rp100.000 | 40% harga satuan | 100% harga satuan |
| AlatLaboratorium | Rp15.000 | Rp75.000 | 50% harga satuan | 100% harga satuan |
| BarangFurnitur | Rp5.000 | Rp25.000 | 30% harga satuan | 100% harga satuan |
| Ruangan | Tidak ada | Tidak ada | Tidak ada | Denda pembatalan Rp50.000 bila batal kurang dari H-1 |

```
denda = (tarifHarian x hariTerlambat) + biayaKondisi(kondisiAkhir)
hariTerlambat = maksimum(0, tanggalKembali - tanggalSelesai)
```

### 7.4 Aturan slot ruangan

| Kode | Aturan | Ketentuan |
| --- | --- | --- |
| S1 | Jam operasional | Slot hanya boleh berada di antara 07.00 dan 21.00 pada hari yang sama, tanpa melewati tengah malam |
| S2 | Satuan slot | Jam mulai dan jam selesai kelipatan 60 menit; durasi minimal 1 jam, maksimal 4 jam |
| S3 | Tumpang tindih | Dua booking dinyatakan bentrok bila `mulai1 < selesai2` dan `mulai2 < selesai1`. Slot yang berakhir tepat saat slot lain mulai tidak dianggap bentrok |
| S4 | Kapasitas | Jumlah peserta tidak boleh melebihi kapasitas ruangan |
| S5 | Kunci slot | Booking berstatus DIAJUKAN dan DISETUJUI mengunci slot; booking yang ditolak atau dibatalkan melepas slot |
| S6 | Pembatalan | Pembatalan kurang dari satu hari sebelum tanggal pemakaian dikenai denda Rp50.000 dan denda tersebut menjadi tunggakan |
| S7 | Ruangan nonaktif | Ruangan berstatus nonaktif tidak muncul dalam daftar pilihan dan seluruh booking aktifnya ditolak otomatis |

### 7.5 Status

| Objek | Status | Perpindahan |
| --- | --- | --- |
| Peminjaman barang | DIAJUKAN, DISETUJUI, DIPINJAM, DIKEMBALIKAN, DITOLAK, DIBATALKAN | DIAJUKAN → DISETUJUI atau DITOLAK; DISETUJUI → DIPINJAM → DIKEMBALIKAN; DIAJUKAN atau DISETUJUI → DIBATALKAN |
| Booking ruangan | DIAJUKAN, DISETUJUI, TERPAKAI, SELESAI, DITOLAK, DIBATALKAN | DIAJUKAN → DISETUJUI atau DITOLAK; DISETUJUI → TERPAKAI → SELESAI; DIAJUKAN atau DISETUJUI → DIBATALKAN |

Status terlambat tidak disimpan sebagai status tersendiri, melainkan dihitung dari perbandingan tanggal selesai dengan tanggal kembali, agar status tidak pernah bertentangan dengan tanggal yang tercatat.

## 8. Rancangan Berorientasi Objek

### 8.1 Daftar kelas per paket

**Paket Pengguna**

| No | Kelas / Interface | Jenis | Tanggung jawab |
| --- | --- | --- | --- |
| 1 | `Pengguna` | abstract class | Identitas dasar; method abstrak `getPeran()` dan `tampilkanProfil()` |
| 2 | `Mahasiswa` | class (extends Pengguna) | NIM, program studi, status aktif, jumlah pengajuan aktif |
| 3 | `PetugasSarpras` | class (extends Pengguna) | NIP dan unit kerja |
| 4 | `DosenPembina` | class (extends Pengguna) | NIDN dan jabatan |

**Paket Inventaris**

| No | Kelas / Interface | Jenis | Tanggung jawab |
| --- | --- | --- | --- |
| 5 | `KategoriBarang` | class | Data induk kategori |
| 6 | `Barang` | abstract class | Kode, nama, stok, harga satuan; method abstrak `getJenisBarang()`, `hitungDenda()`, `cekBentrok()` |
| 7 | `BarangElektronik` | class (extends Barang) | Tarif denda elektronik; `cekBentrok()` berbasis sisa stok pada rentang tanggal |
| 8 | `AlatLaboratorium` | class (extends Barang) | Tarif denda alat laboratorium; `cekBentrok()` berbasis stok |
| 9 | `BarangFurnitur` | class (extends Barang) | Tarif denda furnitur; `cekBentrok()` berbasis stok |
| 10 | `Ruangan` | class (extends Barang) | Kapasitas dan fasilitas; tanpa denda harian; `cekBentrok()` berbasis tumpang tindih interval jam |

**Paket Transaksi**

| No | Kelas / Interface | Jenis | Tanggung jawab |
| --- | --- | --- | --- |
| 11 | `DetailPeminjaman` | class | Barang, jumlah, kondisi awal, subtotal denda |
| 12 | `Peminjaman` | class | Identitas pengajuan, peminjam, tanggal, status, keperluan, perhitungan keterlambatan |
| 13 | `Pengembalian` | class | Tanggal kembali, kondisi akhir per item, total denda, status bayar |
| 14 | `SlotWaktu` | class | Jam mulai dan jam selesai; method `bertumpangTindih(SlotWaktu)` dan `durasiJam()` |
| 15 | `JadwalRuangan` | class | Kumpulan booking pada satu ruangan dan satu tanggal; `slotKosong()`, `cariBentrok(SlotWaktu)` |

**Paket Aturan**

| No | Kelas / Interface | Jenis | Tanggung jawab |
| --- | --- | --- | --- |
| 16 | `AturanPeminjaman` | interface | `getNamaAturan()` dan `periksa(Mahasiswa, Pengajuan)` |
| 17 | `AturanStatusMahasiswa` | class (implements) | R1 |
| 18 | `AturanMaksimalAktif` | class (implements) | R2 |
| 19 | `AturanTunggakanDenda` | class (implements) | R3 |
| 20 | `AturanBatasWaktu` | class (implements) | R4 |
| 21 | `AturanDurasiMaksimal` | class (implements) | R5 |
| 22 | `AturanBentrokJadwal` | class (implements) | S3: memeriksa tumpang tindih slot pada ruangan yang sama |
| 23 | `AturanJamOperasional` | class (implements) | S1 dan S2: rentang 07.00–21.00, kelipatan jam, durasi maksimal |
| 24 | `AturanKapasitasRuang` | class (implements) | S4: jumlah peserta terhadap kapasitas |
| 25 | `ValidatorPeminjaman` | class | Menjalankan seluruh aturan yang terdaftar dan mengumpulkan pelanggaran |

**Paket Layanan**

| No | Kelas / Interface | Jenis | Tanggung jawab |
| --- | --- | --- | --- |
| 26 | `LayananKetersediaan` | class | Menghitung stok terpakai pada rentang tanggal dan menentukan ketersediaan barang |
| 27 | `LayananBookingRuangan` | class | Menyusun jadwal slot, mencari slot kosong, mengajukan dan membatalkan booking |
| 28 | `KalkulatorDenda` | class | Denda keterlambatan, denda kondisi, denda pembatalan ruangan |
| 29 | `LayananPeminjaman` | class | Fasade alur bisnis: ajukan, verifikasi, serah terima, kembalikan, jatuh tempo |
| 30 | `RekapPeminjaman` | class | Rekap per kategori, tingkat keterlambatan, utilisasi ruangan per jam |

**Paket Penyimpanan dan Antarmuka**

| No | Kelas / Interface | Jenis | Tanggung jawab |
| --- | --- | --- | --- |
| 31 | `RepositoriBarang` | class | Koleksi barang dan ruangan, pencarian, filter ketersediaan |
| 32 | `RepositoriPeminjaman` | class | Koleksi peminjaman dan booking, pencarian berdasarkan status dan tanggal |
| 33 | `RepositoriPengguna` | class | Koleksi pengguna dan autentikasi |
| 34 | `PenyimpananData` | class | Simpan dan muat seluruh koleksi ke/dari berkas teks |
| 35 | `AplikasiSipinjam` | class | Kelas utama, menu per peran, penanganan masukan pengguna |

### 8.2 Pemetaan konsep OOP ke implementasi

| Konsep | Ketentuan instruksi | Rencana implementasi | Alasan pemakaian |
| --- | --- | --- | --- |
| Class dan object | Minimal 5 kelas saling berinteraksi | 63 berkas `.java` (21 model, 12 aturan, 5 layanan, 4 repositori, 2 penyimpanan, 8 exception, 8 tampilan, 2 kelas akar, 1 pengujian), dengan `LayananPeminjaman` dan `KonteksAplikasi` sebagai pengatur interaksi | Setiap kelas mewakili satu entitas atau satu tanggung jawab tunggal |
| Constructor berparameter | Wajib | Seluruh kelas model memakai constructor berparameter; `SlotWaktu` memiliki constructor overloading (durasi atau jam selesai) | Objek tidak dapat lahir dalam keadaan tidak valid |
| Encapsulation | Atribut private dan getter/setter | Semua atribut model `private`; setter memuat validasi; status hanya berubah melalui method transisi | Mencegah perubahan status dan nilai denda dari luar kelas |
| Inheritance | Minimal satu pewarisan | `Pengguna` → `Mahasiswa`, `PetugasSarpras`, `DosenPembina`; `Barang` → `BarangElektronik`, `AlatLaboratorium`, `BarangFurnitur`, `Ruangan` | Dua kelompok objek berbagi data dan perilaku, tetapi berbeda pada atribut khusus dan tarif denda |
| Polymorphism | Overriding atau antarmuka secara polimorfik | (a) Overriding `getJenisBarang()`, `tarifHarian()`, `biayaKondisi()`, dan `dikelolaPerSlot()` pada empat subclass `Barang`; (b) satu loop memanggil `aturan.periksa(...)` pada `ArrayList<AturanPeminjaman>` | Satu alur pengajuan melayani barang dan ruangan tanpa percabangan berdasarkan jenis |
| Abstraction | Minimal satu abstract class atau interface | `Pengguna` dan `Barang` sebagai abstract class; `AturanPeminjaman` sebagai interface | Tidak ada objek `Barang` generik yang berdiri sendiri, dan aturan dapat ditambah tanpa mengubah validator |
| Exception handling | try-catch yang sesuai | `StokTidakCukupException`, `BentrokJadwalException`, `DiLuarJamOperasionalException`, `KapasitasTerlampauiException`, `AturanDilanggarException`, `DataTidakDitemukanException`, `FormatBerkasException` | Kesalahan input pengguna ditampilkan sebagai pesan, aplikasi tidak berhenti |
| Collection | ArrayList atau lainnya | `ArrayList<Barang>`, `ArrayList<Peminjaman>`, `ArrayList<AturanPeminjaman>`, `ArrayList<SlotWaktu>`; `Map<String, Integer>` untuk rekap | Data dinamis, sering diiterasi dan difilter |
| File handling | Simpan dan baca data | Berkas teks berpemisah `\|` pada folder `data/`, dimuat saat mulai dan disimpan setelah setiap perubahan | Data tetap ada setelah aplikasi ditutup |

Pola perancangan pendukung: **Strategy** (`AturanPeminjaman`, `KriteriaDenda`), **Facade** (`LayananPeminjaman`), **Repository** (kelas `Repositori*`).

### 8.3 Penyesuaian kelas saat implementasi

Dari 35 kelas inti pada rancangan, saat implementasi ditambahkan 28 berkas pendukung sehingga total menjadi 63 berkas `.java`. Penambahan dilakukan karena antarmuka memakai Swing (bukan menu console), pengujian otomatis diperlukan, dan pemisahan koleksi booking dari koleksi peminjaman membuat pemeriksaan slot lebih jelas.

| No | Kelas / Interface | Paket | Alasan penambahan |
| --- | --- | --- | --- |
| 1 | `KonteksAplikasi` | `sipinjam` | Merakit seluruh repositori, layanan, dan penyimpanan sekaligus pada satu titik |
| 2 | `BookingRuangan` | `model` | Objek pengajuan ruangan yang berbeda siklus statusnya dari `Peminjaman` |
| 3 | `RincianDenda` | `model` | Menampung rincian denda (hari, denda terlambat, denda kondisi) untuk ditampilkan ke petugas |
| 4 | `Peran` | `model` | Enum peran pengguna |
| 5 | `StatusPeminjaman` | `model` | Enum status peminjaman beserta aturan perpindahannya |
| 6 | `StatusBooking` | `model` | Enum status booking beserta aturan perpindahannya |
| 7 | `KondisiBarang` | `model` | Enum kondisi barang saat serah terima dan pengembalian |
| 8 | `KonteksPengajuan` | `aturan` | Wadah data yang dibagikan seluruh aturan; menyediakan dua pembuat objek (barang dan ruangan) |
| 9 | `AturanKetersediaanStok` | `aturan` | Pemeriksaan stok dijalankan sebagai satu aturan agar validasinya seragam dalam satu loop |
| 10 | `RepositoriBooking` | `repositori` | Koleksi booking terpisah dari koleksi peminjaman |
| 11 | `PemisahBaris` | `penyimpanan` | Utilitas baca-tulis baris berpemisah pipa dan konversi tanggal |
| 12 | `KomponenUI` | `tampilan` | Pembantu komponen Swing, format tanggal, dan format rupiah |
| 13 | `FormLogin` | `tampilan` | Halaman masuk dan pendaftaran mahasiswa |
| 14 | `FormUtama` | `tampilan` | Jendela utama dengan tab per peran |
| 15 | `PanelMahasiswa` | `tampilan` | Katalog, keranjang, dan pengajuan peminjaman |
| 16 | `PanelBooking` | `tampilan` | Papan jadwal slot dan pengajuan booking |
| 17 | `PanelRiwayat` | `tampilan` | Riwayat peminjaman dan booking milik mahasiswa |
| 18 | `PanelPetugas` | `tampilan` | Verifikasi, sirkulasi, inventaris, dan rekap |
| 19 | `PanelPembina` | `tampilan` | Antrean persetujuan pembina |
| 20 | `AturanDilanggarException` | `exception` | Induk kesalahan aturan; subklasnya memperluas kelas ini |
| 21 | `StokTidakCukupException` | `exception` | Kesalahan khusus stok |
| 22 | `BentrokJadwalException` | `exception` | Kesalahan khusus slot bentrok |
| 23 | `DiLuarJamOperasionalException` | `exception` | Kesalahan khusus jam operasional |
| 24 | `KapasitasTerlampauiException` | `exception` | Kesalahan khusus kapasitas |
| 25 | `DataTidakDitemukanException` | `exception` | Data tidak ditemukan |
| 26 | `AksesDitolakException` | `exception` | Tindakan melampaui wewenang peran |
| 27 | `FormatBerkasException` | `exception` | Baris berkas tidak sesuai format |
| 28 | `UjiSkenario` | `uji` | Menjalankan TC-01 s.d. TC-18 tanpa membuka antarmuka |

## 9. Struktur Direktori dan Ketentuan Teknis (Implementasi)

### 9.1 Prinsip struktur

1. Satu berkas `.java` untuk satu kelas publik, dan nama berkas sama dengan nama kelas.
2. Pengelompokan berdasarkan lapisan tanggung jawab, bukan berdasarkan aktor atau menu.
3. Arah dependensi satu arah: `tampilan` → `layanan` → (`aturan`, `repositori`, `penyimpanan`) → `model`. Paket `model` tidak mengimpor paket lain milik aplikasi, sehingga kelas model dapat diuji tanpa antarmuka.
4. Pemanggilan `System.out` dan komponen Swing hanya berada di paket `tampilan` (dan pada kelas pengujian). Akses berkas hanya berada di paket `penyimpanan`.
5. Tanpa pustaka eksternal: hanya JDK 8 atau lebih baru, mencakup `java.time`, `java.util`, `java.io`, `java.nio`, dan `javax.swing`.

### 9.2 Pohon direktori

```
SIPINJAM/
|-- docs/
|   |-- ARSIP_TEMU_tidak_dipakai.md
|   |-- DESKRIPSI_PROYEK_SIPINJAM.docx
|   |-- DESKRIPSI_PROYEK_SIPINJAM.md
|   |-- INSTRUKSI FINAL PROJECT PBO_1794199365272.docx
|   |-- LAPORAN_SIPINJAM_BAB1_BAB2.docx
|   |-- build_deskripsi.py
|   |-- build_diagrams.py
|   `-- build_laporan.py
|   `-- diagrams/
|       |-- class_aturan_sipinjam.png
|       |-- class_model_sipinjam.png
|       |-- class_penyimpanan_sipinjam.png
|       `-- usecase_sipinjam.png
|-- src/
|   `-- sipinjam
|       |-- aturan
|       |   |-- AturanBatasWaktu.java
|       |   |-- AturanBentrokJadwal.java
|       |   |-- AturanDurasiMaksimal.java
|       |   |-- AturanJamOperasional.java
|       |   |-- AturanKapasitasRuang.java
|       |   |-- AturanKetersediaanStok.java
|       |   |-- AturanMaksimalAktif.java
|       |   |-- AturanPeminjaman.java
|       |   |-- AturanStatusMahasiswa.java
|       |   |-- AturanTunggakanDenda.java
|       |   |-- KonteksPengajuan.java
|       |   `-- ValidatorPeminjaman.java
|       |-- exception
|       |   |-- AksesDitolakException.java
|       |   |-- AturanDilanggarException.java
|       |   |-- BentrokJadwalException.java
|       |   |-- DataTidakDitemukanException.java
|       |   |-- DiLuarJamOperasionalException.java
|       |   |-- FormatBerkasException.java
|       |   |-- KapasitasTerlampauiException.java
|       |   `-- StokTidakCukupException.java
|       |-- layanan
|       |   |-- KalkulatorDenda.java
|       |   |-- LayananBookingRuangan.java
|       |   |-- LayananKetersediaan.java
|       |   |-- LayananPeminjaman.java
|       |   `-- RekapPeminjaman.java
|       |-- model
|       |   |-- AlatLaboratorium.java
|       |   |-- Barang.java
|       |   |-- BarangElektronik.java
|       |   |-- BarangFurnitur.java
|       |   |-- BookingRuangan.java
|       |   |-- DetailPeminjaman.java
|       |   |-- DosenPembina.java
|       |   |-- JadwalRuangan.java
|       |   |-- KategoriBarang.java
|       |   |-- KondisiBarang.java
|       |   |-- Mahasiswa.java
|       |   |-- Peminjaman.java
|       |   |-- Pengembalian.java
|       |   |-- Pengguna.java
|       |   |-- Peran.java
|       |   |-- PetugasSarpras.java
|       |   |-- RincianDenda.java
|       |   |-- Ruangan.java
|       |   |-- SlotWaktu.java
|       |   |-- StatusBooking.java
|       |   `-- StatusPeminjaman.java
|       |-- penyimpanan
|       |   |-- PemisahBaris.java
|       |   `-- PenyimpananData.java
|       |-- repositori
|       |   |-- RepositoriBarang.java
|       |   |-- RepositoriBooking.java
|       |   |-- RepositoriPeminjaman.java
|       |   `-- RepositoriPengguna.java
|       |-- tampilan
|       |   |-- FormLogin.java
|       |   |-- FormUtama.java
|       |   |-- KomponenUI.java
|       |   |-- PanelBooking.java
|       |   |-- PanelMahasiswa.java
|       |   |-- PanelPembina.java
|       |   |-- PanelPetugas.java
|       |   `-- PanelRiwayat.java
|       |-- uji
|       |   `-- UjiSkenario.java
|       |-- AplikasiSipinjam.java
|       `-- KonteksAplikasi.java
|-- .gitignore
|-- build.sh
|-- README.md
`-- run.sh
`-- out/                          hasil kompilasi (*.class), di-ignore
```

### 9.3 Isi setiap folder

| Folder | Isi | Jumlah berkas |
| --- | --- | --- |
| `src/sipinjam/` | `AplikasiSipinjam` (kelas utama) dan `KonteksAplikasi` (perakitan objek) | 2 |
| `src/sipinjam/model/` | 17 kelas model dan 4 enum | 21 |
| `src/sipinjam/aturan/` | Antarmuka `AturanPeminjaman`, `KonteksPengajuan`, sembilan implementasi aturan, dan `ValidatorPeminjaman` | 12 |
| `src/sipinjam/layanan/` | `LayananPeminjaman`, `LayananKetersediaan`, `LayananBookingRuangan`, `KalkulatorDenda`, `RekapPeminjaman` | 5 |
| `src/sipinjam/repositori/` | Koleksi pengguna, barang, peminjaman, dan booking | 4 |
| `src/sipinjam/penyimpanan/` | `PenyimpananData` dan `PemisahBaris` | 2 |
| `src/sipinjam/exception/` | Satu induk kesalahan aturan, empat subklasnya, dan tiga kesalahan lain | 8 |
| `src/sipinjam/tampilan/` | Tiga form, empat panel peran, dan satu pembantu komponen Swing | 8 |
| `src/sipinjam/uji/` | `UjiSkenario` untuk TC-01 s.d. TC-18 | 1 |
| `data/` | Berkas data hasil `file handling`; dibuat otomatis saat aplikasi pertama kali dijalankan | 6 berkas |
| `docs/` | Dokumen, skrip pembuat dokumen dan diagram, serta gambar diagram | — |
| `out/` | Hasil kompilasi (`.class`) dan `sipinjam.jar`; tidak disimpan di repositori | — |

Jumlah berkas `.java`: **63 berkas**, terdiri atas 35 kelas inti pada rancangan (bagian 8.1) dan 28 berkas pendukung yang dijelaskan pada bagian 8.3.

### 9.4 Pemetaan folder ke anggota kelompok

| Anggota | Folder yang menjadi tanggung jawab | Jumlah berkas |
| --- | --- | --- |
| Anggota 1 | `model/` | 21 |
| Anggota 2 | `aturan/`, `layanan/`, `exception/` | 25 |
| Anggota 3 | `repositori/`, `penyimpanan/`, `tampilan/`, `uji/`, `AplikasiSipinjam`, `KonteksAplikasi` | 17 |

Anggota 2 terlihat memegang berkas terbanyak, tetapi delapan di antaranya kelas exception yang hanya berisi satu constructor. Beban kerja sebenarnya ditentukan oleh lima kelas `layanan/`, sehingga bagian itu sebaiknya ditinjau bersama oleh anggota 1 pada akhir Minggu 3.

### 9.5 Aturan dependensi antar paket

| Paket | Boleh mengimpor | Dilarang mengimpor |
| --- | --- | --- |
| `model` | `java.time`, `java.util` | seluruh paket `sipinjam.*` lain |
| `exception` | — | seluruh paket lain |
| `repositori` | `model` | `tampilan`, `layanan` |
| `penyimpanan` | `model`, `exception`, `java.io`, `java.nio` | `tampilan`, `layanan` |
| `aturan` | `model`, `exception`, `repositori` | `layanan`, `penyimpanan`, `tampilan` |
| `layanan` | `model`, `aturan`, `repositori`, `penyimpanan`, `exception` | `tampilan` |
| `tampilan` | `layanan`, `model`, `exception`, `javax.swing`, `java.awt` | `penyimpanan`, `repositori` |
| `uji` | `layanan`, `model`, `exception`, `penyimpanan` | `tampilan` |

Pemeriksaan cepat bahwa aturan ini tidak dilanggar, dijalankan dari folder `SIPINJAM/`:

```
grep -rn "import sipinjam" src/sipinjam/model/ | grep -v "import sipinjam.model"
grep -rn "javax.swing" src/sipinjam/model src/sipinjam/layanan src/sipinjam/aturan
```

Kedua perintah harus tidak menghasilkan keluaran.

### 9.6 Konvensi penamaan

| Elemen | Aturan | Contoh |
| --- | --- | --- |
| Paket | huruf kecil, kata tunggal | `sipinjam.layanan` |
| Kelas | PascalCase, kata benda | `Peminjaman`, `SlotWaktu`, `JadwalRuangan` |
| Antarmuka | PascalCase, menyatakan kemampuan | `AturanPeminjaman` |
| Enum | PascalCase; konstanta UPPER_SNAKE | `StatusBooking.DISETUJUI` |
| Atribut | camelCase, wajib `private` | `tanggalMulai`, `jamSelesai` |
| Method | camelCase, kata kerja | `hitungDenda()`, `cekBentrok()`, `slotKosong()` |
| Method boolean | awalan `is`, `perlu`, atau `ada` | `isTerlambat()`, `perluPersetujuan()`, `adaTunggakan()` |
| Konstanta | UPPER_SNAKE, `static final` | `DENDA_PEMBATALAN`, `PEMISAH` |
| Berkas | sama dengan nama kelas publik | `JadwalRuangan.java` |
| Exception | akhiran `Exception`, turunan `Exception` | `BentrokJadwalException` |
| Bahasa | istilah domain berbahasa Indonesia, istilah JDK tetap Inggris | `DIPINJAM`, `LocalDate` |

### 9.7 Kompilasi dan menjalankan

```
./build.sh          # kompilasi ke out/ lalu membentuk sipinjam.jar
./run.sh            # menjalankan jar
```

Isi `build.sh`:

```
#!/usr/bin/env bash
set -e
rm -rf out && mkdir -p out
javac -encoding UTF-8 -d out $(find src -name "*.java")
jar cfe sipinjam.jar sipinjam.AplikasiSipinjam -C out .
echo "Selesai. Jalankan dengan: ./run.sh"
```

Tanpa skrip:

```
javac -encoding UTF-8 -d out $(find src -name "*.java")
java  -Dfile.encoding=UTF-8 -cp out sipinjam.AplikasiSipinjam
```

Pada Windows, pengumpulan berkas sumber memakai berkas daftar:

```
dir /s /b src\*.java > sources.txt
javac -encoding UTF-8 -d out @sources.txt
java -cp out sipinjam.AplikasiSipinjam
```

Aplikasi harus dijalankan dari folder proyek karena folder `data/` dibaca relatif terhadap direktori kerja. Untuk lokasi lain, alamat folder data diberikan sebagai argumen: `java -cp out sipinjam.AplikasiSipinjam --data /jalur/data`.

Menjalankan pengujian skenario:

```
java -cp out sipinjam.uji.UjiSkenario data-uji
```

### 9.8 Perilaku berkas data saat runtime

1. Saat aplikasi mulai, `PenyimpananData.muat()` memeriksa folder `data/`. Bila berkas pengguna belum ada, folder dan data contoh dibuat: dua akun petugas dan pembina, dua akun mahasiswa, enam barang, dan tiga ruangan, sehingga aplikasi dapat langsung dicoba.
2. Format berkas: UTF-8, satu baris satu record, pemisah pipa, tanpa baris header. Karakter pemisah pada masukan pengguna diganti oleh `PemisahBaris.bersihkan()` agar format tidak rusak.
3. Setiap operasi yang mengubah data langsung memanggil `simpan()`. Bila penyimpanan gagal, pesan kesalahan disimpan pada `PenyimpananData.getPesanTerakhir()` dan aplikasi tetap berjalan.
4. Penulisan memakai berkas sementara `*.tmp` lalu diganti nama secara atomik, sehingga data lama tidak rusak bila proses berhenti di tengah penulisan.
5. Baris yang jumlah kolomnya tidak sesuai dilewati, dicatat sebagai peringatan, dan data valid lainnya tetap dimuat.

Isi `.gitignore`:

```
out/
*.class
*.jar
*.tmp
data/
data-uji/
data-uji-rusak/
.idea/
*.iml
```

### 9.9 Urutan pengerjaan berkas

| Tahap | Berkas yang dibuat lebih dahulu | Alasan urutan |
| --- | --- | --- |
| Minggu 2, hari 1 | 4 enum `model/` dan 8 kelas `exception/` | Kelas lain bergantung pada tipe status dan kesalahan |
| Minggu 2, hari 2–4 | `Pengguna` dan tiga subclass, `Barang` dan empat subclass, `DetailPeminjaman`, `Peminjaman`, `Pengembalian`, `SlotWaktu`, `JadwalRuangan`, `BookingRuangan`, `RincianDenda` | Inti inheritance dan polymorphism, harus selesai sebelum aturan ditulis |
| Minggu 2, hari 5–7 | `AturanPeminjaman`, `KonteksPengajuan`, sembilan implementasi aturan, `ValidatorPeminjaman` | Aturan hanya bergantung pada model dan repositori sehingga dapat dikerjakan paralel |
| Minggu 3, hari 1–2 | Empat `repositori/` dan dua `penyimpanan/` | Layanan membutuhkan koleksi dan media simpan |
| Minggu 3, hari 2–5 | Lima kelas `layanan/` | Seluruh alur bisnis, termasuk deteksi bentrok slot dan perhitungan denda |
| Minggu 3, hari 5–7 | `KomponenUI`, `FormLogin`, `FormUtama`, empat panel peran | Antarmuka dikerjakan terakhir agar perubahan logika tidak memaksa menulis ulang tampilan |
| Minggu 4 | `UjiSkenario`, perbaikan bug, laporan dan video | Pengujian otomatis memastikan seluruh skenario berjalan sebelum demonstrasi |

## 10. Rancangan Penyimpanan Data

| Berkas | Format baris |
| --- | --- |
| `data/pengguna.txt` | id, nama, username, password, peran, data1, data2, data3, aktif. Untuk mahasiswa: data1=NIM, data2=program studi, data3=telepon; untuk petugas: NIP dan unit; untuk pembina: NIDN dan jabatan |
| `data/kategori.txt` | kode, nama |
| `data/barang.txt` | kode, nama, kodeKategori, jenis, stok, hargaSatuan, perluPersetujuan, data1, data2. Ruangan memakai data1=kapasitas dan data2=fasilitas |
| `data/peminjaman.txt` | id, username, keperluan, tanggalPengajuan, mulai, selesai, status, idPembina, catatan, tanggalKembali, lunas |
| `data/detail_peminjaman.txt` | idPeminjaman, kodeBarang, jumlah, kondisiAwal, kondisiAkhir, subtotalDenda |
| `data/booking_ruangan.txt` | id, kodeRuangan, username, tanggalPengajuan, tanggal, jamMulai, jamSelesai, peserta, keperluan, status, catatan, denda, lunas |

Kolom `jenis` pada `barang.txt` dibaca lebih dahulu saat memuat data untuk membentuk subclass yang tepat: `ELEKTRONIK`, `ALAT_LAB`, `FURNITUR`, atau `RUANGAN`. Detail peminjaman dimuat setelah peminjaman dan disambungkan melalui kolom `idPeminjaman`. Status pada berkas dipulihkan dengan menelusuri perpindahan status yang sah pada enum, sehingga data yang rusak tidak dapat menghasilkan status yang mustahil.

## 11. Rancangan Antarmuka (Swing)

Antarmuka dibangun dengan Java Swing dan diatur dalam jendela `FormUtama` yang berisi tab sesuai peran.

Tab Mahasiswa:

1. **Peminjaman Barang** — pilih tanggal mulai dan selesai untuk melihat sisa stok pada katalog, susun keranjang, isi keperluan, lalu ajukan.
2. **Booking Ruangan** — pilih ruangan dan tanggal untuk melihat papan jadwal slot 07.00-21.00 beserta pemegangnya, pilih jam mulai dan selesai, lalu ajukan.
3. **Riwayat Saya** — daftar peminjaman dan booking miliknya beserta status dan denda, dengan tombol batalkan bila masih memungkinkan.

Tab Petugas (berisi sub-tab):

1. **Verifikasi peminjaman** — tabel seluruh pengajuan; tombol setujui, tolak, catat serah terima, catat pengembalian (dengan pilihan kondisi per barang), dan tandai denda lunas.
2. **Verifikasi booking** — tabel seluruh booking; tombol setujui dan tolak.
3. **Data inventaris** — tabel barang dan ruangan; form tambah barang, tambah ruangan, dan ubah stok.
4. **Rekap** — unit dipinjam per kategori, utilisasi ruangan per jam, peminjaman lewat tenggat, tingkat keterlambatan, dan total denda.

Tab Dosen Pembina:

1. **Persetujuan** — antrean pengajuan yang memerlukan persetujuan pembina beserta tombol setujui dan tolak dengan catatan.

Halaman `FormLogin` menyediakan masuk dengan peran dan pendaftaran akun mahasiswa baru. Seluruh formulir divalidasi dengan pesan berbahasa Indonesia; kesalahan aturan bisnis ditampilkan tanpa menghentikan aplikasi.

## 12. Batasan Masalah

1. Aplikasi berjalan lokal sebagai desktop, tanpa jaringan, tanpa API, dan tanpa multi-pengguna serentak.
2. Data disimpan pada berkas teks, bukan basis data.
3. Data induk barang, ruangan, kategori, dan tarif diinput petugas; tidak terhubung sistem informasi aset kampus.
4. Ketersediaan barang diperiksa dari stok dan rentang tanggal, bukan pelacakan fisik.
5. Booking ruangan memakai slot kelipatan satu jam dalam satu hari, jam 07.00–21.00, tanpa booking berulang dan tanpa integrasi jadwal kuliah resmi.
6. Satu pengajuan booking hanya untuk satu ruangan; kegiatan yang memakai beberapa ruangan diajukan terpisah.
7. Verifikasi dan persetujuan dilakukan manual oleh petugas dan pembina melalui aplikasi.
8. Pembayaran denda hanya dicatat sebagai status lunas atau belum lunas, tanpa integrasi pembayaran.
9. Foto barang atau ruangan tidak diunggah sebagai berkas gambar; hanya nama berkas yang dirujuk.
10. Antarmuka menggunakan `[console / GUI Swing — pilih satu, sesuaikan kesepakatan kelompok]`.

## 13. Rencana Pengujian Inti

Seluruh skenario TC-01 s.d. TC-18 pada tabel di bawah telah dijalankan lewat kelas `sipinjam.uji.UjiSkenario` (tanpa membuka antarmuka) dan dinyatakan lulus, termasuk empat pemeriksaan tambahan atas konsep OOP: tarif denda berbeda per subclass tanpa percabangan, `dikelolaPerSlot()` membedakan ruangan dan barang, aturan tumpang tindih slot, dan jumlah aturan yang terdaftar pada validator. Perintah: `java -cp out sipinjam.uji.UjiSkenario data-uji`.



| Kode | Skenario | Input | Hasil yang diharapkan |
| --- | --- | --- | --- |
| TC-01 | Login kata sandi salah | Kata sandi keliru | Pesan kesalahan, aplikasi tetap berjalan |
| TC-02 | Stok tidak cukup | Pinjam 3 proyektor saat tersisa 2 pada tanggal itu | Pengajuan ditolak dengan pesan sisa stok |
| TC-03 | Rentang tanggal bertumpang tindih | Dua pengajuan proyektor pada tanggal beririsan | Peminjaman kedua ditolak bila stok habis pada irisan tersebut |
| TC-04 | Melebihi batas peminjaman aktif | Pengajuan ketiga saat dua masih aktif | Ditolak dengan pesan R2 |
| TC-05 | Tunggakan denda | Pengajuan saat masih ada denda belum lunas | Ditolak dengan pesan R3 |
| TC-06 | Pengajuan kurang dari batas waktu | Barang diajukan pada hari yang sama; ruangan diajukan H-2 | Ditolak dengan pesan R4 |
| TC-07 | Keterlambatan pengembalian | Kembali 3 hari melewati tenggat, barang elektronik | Denda Rp30.000 |
| TC-08 | Barang kembali rusak | Kondisi akhir rusak ringan, alat laboratorium | Denda kondisi Rp75.000 ditambahkan |
| TC-09 | Pengajuan butuh persetujuan | Barang bertanda perlu persetujuan | Masuk antrean pembina sebelum petugas |
| TC-10 | **Booking bentrok jam** | Booking 09.00–11.00 pada ruangan yang sudah 10.00–12.00 | Ditolak dengan pesan bentrok dan slot yang bertabrakan |
| TC-11 | **Bersebelahan tidak bentrok** | Booking 11.00–13.00 setelah booking 09.00–11.00 | Diterima |
| TC-12 | **Di luar jam operasional** | Booking 06.00–08.00 atau 20.00–22.00 | Ditolak dengan pesan jam operasional |
| TC-13 | **Melebihi kapasitas** | 45 peserta pada ruangan berkapasitas 40 | Ditolak dengan pesan kapasitas |
| TC-14 | **Pembatalan mendadak** | Batal H-0 pada booking yang disetujui | Denda Rp50.000 tercatat sebagai tunggakan |
| TC-15 | Slot dilepas setelah ditolak | Pengajuan lain pada slot yang bookingnya ditolak petugas | Slot kembali tersedia untuk diajukan |
| TC-16 | Simpan lalu muat data | Tambah peminjaman dan booking, tutup, jalankan ulang | Seluruh data dan status tetap utuh |
| TC-17 | Berkas data rusak | Satu baris pada berkas diubah formatnya | Pesan kesalahan berkas, aplikasi tidak berhenti mendadak |
| TC-18 | Akses menu petugas oleh mahasiswa | Mahasiswa membuka verifikasi | Ditolak dengan pesan akses ditolak |

## 14. Rencana Kerja dan Pembagian Tugas

| Minggu | Target | Keluaran |
| --- | --- | --- |
| 1 | Analisis dan perancangan | Deskripsi proyek, use case, class diagram, persetujuan dosen |
| 2 | Implementasi model dan aturan | Seluruh kelas model, inheritance, antarmuka aturan, exception, constructor, encapsulation |
| 3 | Integrasi alur | Menu lengkap, Collection, file handling, ketersediaan barang, booking ruangan, denda, rekap |
| 4 | Pengujian dan finalisasi | Skenario uji dijalankan, perbaikan bug, laporan BAB I–V, video demonstrasi, slide |

| Anggota | Fokus | Berkas atau bagian |
| --- | --- | --- |
| Anggota 1 | Model dan relasi kelas | `Pengguna`, `Mahasiswa`, `PetugasSarpras`, `DosenPembina`, `KategoriBarang`, `Barang` beserta empat subclass, `DetailPeminjaman`, `Peminjaman`, `Pengembalian`, `SlotWaktu`, `JadwalRuangan` |
| Anggota 2 | Aturan, layanan, dan denda | `AturanPeminjaman` beserta sembilan implementasinya, `ValidatorPeminjaman`, `LayananKetersediaan`, `LayananBookingRuangan`, `KalkulatorDenda`, `LayananPeminjaman` |
| Anggota 3 | Antarmuka, penyimpanan, dokumentasi | `AplikasiSipinjam`, `PenyimpananData`, `Repositori*`, `RekapPeminjaman`, laporan, video, slide |

Karena komponen pemahaman individu dinilai dan dosen dapat menunjuk anggota secara acak, setiap anggota wajib memahami alur keseluruhan, bukan hanya bagiannya.

## 15. Skenario Demo

Urutan demonstrasi yang memperlihatkan seluruh konsep wajib dalam waktu singkat:

1. Login sebagai petugas, tampilkan data barang dan ruangan hasil muat dari berkas.
2. Login sebagai mahasiswa, lihat sisa stok pada tanggal kegiatan.
3. Ajukan peminjaman 2 unit proyektor; tunjukkan validasi berjalan (R1–R5) dan persetujuan pembina.
4. Tampilkan jadwal ruangan, lalu ajukan booking 09.00–11.00 dan berhasil.
5. Coba booking 10.00–12.00 pada ruangan yang sama; tunjukkan penolakan bentrok beserta slot yang bertabrakan.
6. Verifikasi booking sebagai petugas, lalu batalkan booking lain H-0 untuk memperlihatkan denda pembatalan.
7. Catat pengembalian barang dengan kondisi rusak ringan; tunjukkan perhitungan denda.
8. Buka rekap: peminjaman per kategori, tingkat keterlambatan, utilisasi ruangan per jam.
9. Tutup aplikasi, jalankan ulang, tunjukkan data dan status tetap utuh.

## 16. Bagian yang Harus Dilengkapi Sebelum Diserahkan

- [ ] Nama anggota, NIM, kelas, dan nama dosen pengampu
- [ ] Data pendukung latar belakang: hasil observasi buku peminjaman atau kuesioner, beserta tanggal pelaksanaannya
- [ ] Pilihan antarmuka: console atau Swing
- [ ] Persetujuan judul dan studi kasus oleh dosen pengampu
- [ ] Use case diagram dan class diagram final (diekspor dari skrip pembuat diagram)
- [ ] Penyesuaian batasan masalah dengan kemampuan kelompok
