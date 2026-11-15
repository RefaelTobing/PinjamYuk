# TASK-FE-10: Integrasi End-to-End, Testing & Kesiapan Demo Final Project

## 1. Identitas Task
- **ID Task**: `TASK-FE-10`
- **Fase**: Fase 5 (Integrasi, Poles UI/UX & Kesiapan Demo)
- **Komponen**: Cross-Cutting Integration, Error Handling Toast, Skeleton Loader, Responsiveness, Demo Script
- **Tingkat Kesulitan**: Sedang
- **Estimasi Waktu**: 1 - 2 Hari

---

## 2. Deskripsi & Tujuan
Melakukan pengujian integrasi akhir secara menyeluruh (*End-to-End Testing*) antara Frontend Bebas dengan Backend Java REST API. Melengkapi antarmuka dengan notifikasi umpan balik (*toast notifications*), status memuat (*loading skeletons*), penanganan jika server Java mati/offline, serta menyiapkan skenario demonstrasi aplikasi untuk presentasi di hadapan Dosen dan Asisten Praktikum PBO.

---

## 3. Checklist Kualitas & UX Polish

### 3.1 Penanganan Error Jaringan & Status Offline
- Tambahkan banner / toast jika server Java backend belum dijalankan atau tidak dapat dijangkau:
  *"Tidak dapat terhubung ke Backend Server Java (port 8080). Pastikan server backend telah aktif."*
- Penanganan form validasi ramah pengguna (pesan bahasa Indonesia sesuai ketentuan FR-27).

### 3.2 Loading Skeletons & Empty States
- Sediakan visual placeholder skeleton saat data sedang diambil via Axios/Fetch.
- Sediakan ilustrasi/pesan ramah saat data kosong (misal: "Belum ada riwayat peminjaman").

### 3.3 Skenario Alur Demonstrasi Praktikum (Demo Script)
Siapkan alur demonstrasi interaktif yang mendemonstrasikan keunggulan arsitektur FE Bebas + BE Java OOP:
1. **Prolog**: Jelaskan arsitektur client-server: Frontend modern berkomunikasi via JSON REST API ke Backend Java yang mengimplementasikan seluruh kaidah PBO (Inheritance, Polymorphism, Abstraction, Exception, File Handling).
2. **Demonstrasi Mahasiswa**:
   - Login akun `mahasiswa`.
   - Pilih tanggal kegiatan $\to$ perlihatkan sisa stok barang berubah dinamis.
   - Masukkan proyektor & speaker ke keranjang $\to$ ajukan peminjaman.
   - Pindah ke menu Booking Ruangan $\to$ perlihatkan matriks slot jam 07.00 - 21.00 $\to$ pilih slot aula $\to$ kirim booking.
3. **Demonstrasi Dosen Pembina**:
   - Login akun `pembina`.
   - Tunjukkan antrean barang khusus $\to$ klik setujui dengan catatan.
4. **Demonstrasi Petugas Sarpras**:
   - Login akun `petugas`.
   - Verifikasi pengajuan mahasiswa.
   - Buka tab Serah Terima $\to$ catat kondisi awal $\to$ ubah status jadi `DIPINJAM`.
   - Buka tab Pengembalian $\to$ simulasikan pengembalian lewat batas tanggal $\to$ perlihatkan kalkulasi denda otomatis (keterlambatan + denda kondisi).
   - Tunjukkan dashboard grafik statistik peminjaman dan utilisasi ruangan.
5. **Demonstrasi Persistensi Data**:
   - Matikan server Java $\to$ jalankan kembali $\to$ refresh halaman frontend $\to$ buktikan data tetap utuh dari berkas teks `data/`.

---

## 4. Langkah-Langkah Pengerjaan
1. Pasang pustaka toast notifikasi (misal: `react-hot-toast` atau buat komponen toast kustom).
2. Uji alur transaksi dari akun mahasiswa hingga selesai di akun petugas secara langsung di browser.
3. Pastikan tidak ada console error atau visual layout glitch di browser (periksa responsiveness mobile dan desktop).
4. Buat dokumen panduan ringkas cara menjalankan kedua sisi:
   - Terminal 1 (Backend): `./run_server.sh`
   - Terminal 2 (Frontend): `npm run dev`

---

## 5. Kriteria Penerimaan (Acceptance Criteria / DoD)
- [ ] Seluruh skenario alur transaksi dari Login $\to$ Pengajuan $\to$ Approval $\to$ Serah Terima $\to$ Pengembalian $\to$ Denda berjalan mulus tanpa error.
- [ ] Pengguna mendapatkan notifikasi visual jelas (toast hijau untuk sukses, toast merah untuk error validasi).
- [ ] Tim pengembang siap mendemonstrasikan aplikasi dan mempertanggungjawabkan implementasi OOP Java di depan dosen penguji.

