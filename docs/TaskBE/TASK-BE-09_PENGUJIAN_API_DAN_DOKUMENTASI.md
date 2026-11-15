# TASK-BE-09: Pengujian API, Persistensi File & Dokumentasi

## 1. Identitas Task
- **ID Task**: `TASK-BE-09`
- **Fase**: Fase 4 (Sinkronisasi Persistensi & Verifikasi)
- **Komponen**: `sipinjam.penyimpanan`, `sipinjam.uji`, Koleksi API
- **Kebutuhan Fungsional**: FR-26, FR-27
- **Tingkat Kesulitan**: Sedang
- **Estimasi Waktu**: 1 Hari

---

## 2. Deskripsi & Tujuan
Melakukan pengujian menyeluruh terhadap seluruh endpoint REST API Java yang telah dibuat, memastikan keutuhan penyimpanan berkas teks (`data/`), menyiapkan skrip otomatis pengujian via cURL, serta membuat dokumentasi format kontrak API (Postman Collection / file cURL) yang siap digunakan oleh pengembang Frontend.

---

## 3. Spesifikasi Teknis

### 3.1 Skrip Uji Otomatis Endpoint (`test_api.sh`)
Buat skrip pengujian berbasis bash/cURL untuk menguji skenario end-to-end tanpa GUI:
1. **Skenario Auth**: Login petugas, login mahasiswa, registrasi mahasiswa baru, login dengan kredensial salah (harus gagal 401).
2. **Skenario Inventaris & Stok**: Cek stok proyektor pada rentang tanggal kosong vs tanggal bentrok.
3. **Skenario Peminjaman**: Pengajuan multi-item, verifikasi petugas, serah terima, pengembalian lewat tenggat (verifikasi denda terhitung otomatis).
4. **Skenario Booking Ruangan**: Booking ruangan aula, cek jadwal slot, verifikasi bentrok slot (harus ditolak), pembatalan kurang dari H-1 (verifikasi denda Rp50.000).
5. **Skenario Laporan**: Tarik data rekapitulasi kategori dan daftar jatuh tempo.

### 3.2 Uji Persistensi Berkas Teks (`data/`)
Pastikan bahwa setelah server dimatikan (`kill`/`Ctrl+C`) dan dihidupkan kembali:
- Seluruh akun baru di `data/pengguna.txt` tetap ada.
- Seluruh barang baru di `data/barang.txt` tetap ada.
- Transaksi peminjaman di `data/peminjaman.txt` dan booking di `data/booking.txt` termuat ulang secara presisi dengan status terakhirnya.

---

## 4. Langkah-Langkah Pengerjaan
1. Buat file `docs/TaskBE/SIPINJAM_API_COLLECTION.json` atau dokumentasi endpoint lengkap (Markdown/Postman).
2. Buat skrip `test_api.sh` di root direktori project.
3. Jalankan pengujian skenario lengkap secara berurutan.
4. Buat script build & run server yang ringkas:
   ```bash
   ./build.sh
   ./run_server.sh --port 8080
   ```

---

## 5. Kriteria Penerimaan (Acceptance Criteria / DoD)
- [ ] Skrip `test_api.sh` berjalan sukses dari awal sampai akhir (status code 200/201 pada skenario sukses, dan 400/401/409 pada skenario gagal).
- [ ] Berkas teks di `data/` tetap valid dan tidak mengalami korupsi format pemisah pipa (`|`).
- [ ] Dokumentasi endpoint API siap dibagikan kepada pengembang Frontend (FE Bebas).

