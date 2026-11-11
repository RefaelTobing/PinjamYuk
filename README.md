# SIPINJAM

Sistem Informasi Peminjaman Inventaris, Sarana Prasarana, dan Ruangan Kampus oleh Mahasiswa.
Final Project Praktikum Pemrograman Berorientasi Objek, D3 Teknik Informatika PSDKU Lamongan.

Aplikasi desktop Java (Swing) untuk mengelola dua jenis sumber daya kampus:

1. **Barang inventaris** (proyektor, pengeras suara, kursi lipat, jas laboratorium, alat praktikum) yang dipinjam pada rentang tanggal, dengan pemeriksaan sisa stok otomatis.
2. **Ruangan** (ruang rapat, aula, ruang kelas) yang dipesan per slot jam, dengan deteksi bentrok jadwal, batas kapasitas, dan denda pembatalan.

## Fitur

- Login tiga peran: mahasiswa, petugas sarana prasarana, dosen pembina.
- Peminjaman barang: katalog + sisa stok per tanggal, keranjang multi-item, persetujuan pembina untuk barang tertentu, verifikasi petugas, serah terima, pengembalian, denda otomatis.
- Booking ruangan: papan jadwal slot 07.00-21.00, penolakan bentrok, batas kapasitas, pembatalan berdenda.
- Aturan kelayakan peminjam dijalankan sebagai sembilan kelas aturan terpisah (R1-R5, S1-S4).
- Riwayat, rekap peminjaman per kategori, tingkat keterlambatan, utilisasi ruangan per jam.
- Penyimpanan berkas teks berpemisah pada folder `data/`, dimuat otomatis saat aplikasi mulai.

## Akun contoh

Data contoh dibuat otomatis saat aplikasi pertama kali dijalankan:

| Peran | Username | Kata sandi |
| --- | --- | --- |
| Petugas Sarana dan Prasarana | `petugas` | `petugas123` |
| Dosen Pembina | `pembina` | `pembina123` |
| Mahasiswa | `mahasiswa` | `mahasiswa123` |
| Mahasiswa kedua | `mahasiswa2` | `mahasiswa123` |

## Cara menjalankan

Prasyarat: JDK 8 atau lebih baru.

```
./build.sh
./run.sh
```

Atau tanpa skrip:

```
javac -encoding UTF-8 -d out $(find src -name "*.java")
java -cp out sipinjam.AplikasiSipinjam
```

Folder data dapat ditentukan sendiri:

```
java -cp out sipinjam.AplikasiSipinjam --data /jalur/folder/data
```

Aplikasi harus dijalankan dari folder proyek karena folder `data/` dibaca relatif terhadap direktori kerja.

## Pengujian

```
java -cp out sipinjam.uji.UjiSkenario data-uji
```

Program tersebut menjalankan skenario TC-01 sampai TC-18 tanpa membuka antarmuka, lalu mencetak status LULUS atau GAGAL untuk setiap skenario. Kode keluar bernilai 1 bila ada skenario yang gagal.

## Struktur paket

```
src/sipinjam/
  AplikasiSipinjam.java    kelas utama
  KonteksAplikasi.java     perakitan repositori, layanan, penyimpanan
  model/                   entitas dan enum
  aturan/                  antarmuka AturanPeminjaman dan sembilan implementasinya
  layanan/                 logika alur bisnis
  repositori/              koleksi objek
  penyimpanan/             baca-tulis berkas
  exception/               kesalahan domain
  tampilan/                antarmuka Swing
  uji/                     pengujian skenario
```

## Batasan

- Aplikasi desktop lokal, tanpa jaringan dan tanpa basis data.
- Booking ruangan memakai slot kelipatan satu jam dalam satu hari, 07.00-21.00, tanpa booking berulang dan tanpa integrasi jadwal kuliah.
- Pembayaran denda hanya dicatat sebagai status lunas atau belum lunas.
