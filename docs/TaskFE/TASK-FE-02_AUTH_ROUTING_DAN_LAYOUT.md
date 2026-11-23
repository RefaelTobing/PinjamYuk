# TASK-FE-02: Halaman Login & Registrasi Modern Minimalist
## Implementasi Sesuai Mockup `halaman_login_sipinjam.png`

---

## 1. Ringkasan Tugas
Membangun antarmuka autentikasi pengguna (Login dan Registrasi Mahasiswa) yang presisi pixel sesuai berkas mockup `frontend/MockUpPinjamYuk/halaman_login_sipinjam.png`. Antarmuka berpusat pada floating card elegan di atas latar belakang dot-grid, dilengkapi tab peralihan instan, password visibility toggle, dan tombol demonstrasi 1-klik untuk 3 peran.

---

## 2. Acuan Visual Mockup (`halaman_login_sipinjam.png`)
* **Latar Belakang**: Latar putih/slate-50 dengan tekstur dot-grid halus (`bg-dot-grid`).
* **Header Atas (Top Bar)**:
  - Kiri: Logo kubus 3D dalam kotak biru + Teks `SIPINJAM` + Badge versi `V2.4` (pill biru muda).
  - Kanan: Indikator status hijau bulat + teks `Sistem Aktif & Terintegrasi SSO`.
* **Kartu Login Utama (Floating Card di Tengah Layar)**:
  - Dimensi: Lebar maksimal `max-w-md`, padding `p-8` atau `p-10`, background putih, sudut melengkung `rounded-3xl`, border tipis `border-slate-200/80`, dan bayangan lembut `shadow-xl shadow-slate-100/80`.
  - Ikon Pusat: Kotak biru rounded `w-14 h-14` dengan ikon kotak/kubus outline.
  - Judul: `SIPINJAM` (bold besar) dan Subjudul: `Sistem Peminjaman Inventaris & Ruangan Kampus` (`text-sm text-slate-500`).
* **Pill Tab Switcher**:
  - Kontainer abu-abu terang bertipe pill (`bg-slate-100 p-1.5 rounded-xl`).
  - Dua tombol segmen: `Masuk` (aktif: latar putih, teks hitam tebal, bayangan lembut) dan `Daftar Mahasiswa` (inaktif: teks abu-abu).
* **Komponen Form Input**:
  - Input `Username`: Label teks `Username`, field input rounded `rounded-xl border-slate-200` dengan placeholder `nadia.rahmawati@ui.ac.id` atau username akun.
  - Input `Kata Sandi`: Dilengkapi tautan `Lupa sandi?` di sisi kanan label, dan tombol ikon mata (`Eye` / `EyeOff`) di dalam field untuk memperlihatkan/menyembunyikan sandi.
  - Checkbox: Checkbox kustom warna biru + teks `Ingat sesi di perangkat ini`.
  - Tombol Utama: `Masuk →` warna biru tua solid (`bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2`).
* **Bagian Akun Demo (One-Click Demo Login)**:
  - Pembatas garis tipis dengan teks label tengah: `AKUN DEMO`.
  - 3 Tombol Card Demo dalam grid 3 kolom:
    1. **Mahasiswa**: Judul `Mahasiswa`, subteks `Peminjam`.
    2. **Petugas**: Judul `Petugas`, subteks `Sarpras`.
    3. **Pembina**: Judul `Pembina`, subteks `Dosen`.
* **Footer Kartu**:
  - Ikon gembok + teks: `Terkoneksi aman dengan Single Sign-On (SSO) Kampus Merdeka`.
* **Footer Halaman**:
  - Teks copyright: `© 2025 SIPINJAM Kampus Merdeka` • Tautan `Bantuan` • Tautan `SOP Sarpras`.

---

## 3. Rincian Pekerjaan Teknis

### A. Komponen Form Login & Register
1. **Mode Masuk (Login)**:
   - Mengirim permintaan `POST /api/auth/login` dengan payload `{ "username": "...", "password": "..." }`.
   - Menyimpan objek pengguna sesi (`id`, `nama`, `username`, `peran`) ke dalam state global `AuthContext` dan `localStorage`.
2. **Mode Daftar (Register Mahasiswa)**:
   - Form pendaftaran khusus mahasiswa mencakup: `NIM`, `Nama Lengkap`, `Program Studi`, `No. Telepon`, `Username`, dan `Password`.
   - Mengirim permintaan `POST /api/auth/register`.
   - Menampilkan notifikasi sukses dan beralih otomatis ke tab `Masuk`.
3. **One-Click Demo Login**:
   - Klik kartu demo `Mahasiswa` langsung mengisi `mahasiswa` / `mahasiswa123` dan mengeksekusi login.
   - Klik kartu demo `Petugas` langsung mengisi `petugas` / `petugas123` dan mengeksekusi login.
   - Klik kartu demo `Pembina` langsung mengisi `pembina` / `pembina123` dan mengeksekusi login.

---

## 4. Checklist Penerimaan Tugas (Definition of Done)
- [ ] Tampilan halaman login identik 100% dengan `halaman_login_sipinjam.png`.
- [ ] Efek background dot-grid terlihat rapi di berbagai resolusi layar.
- [ ] Tombol toggle tab `Masuk` dan `Daftar Mahasiswa` bertransisi mulus.
- [ ] Fitur intip password (toggle eye icon) berfungsi normal.
- [ ] Ketiga tombol akun demo berfungsi langsung mengautentikasi pengguna ke dashboard perannya masing-masing.
