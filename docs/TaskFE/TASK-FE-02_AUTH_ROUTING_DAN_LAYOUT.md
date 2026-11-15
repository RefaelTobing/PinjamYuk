# TASK-FE-02: Sistem Autentikasi, Route Guard 3 Peran & Layout Shell

## 1. Identitas Task
- **ID Task**: `TASK-FE-02`
- **Fase**: Fase 1 (Inisialisasi & Pondasi UI)
- **Komponen**: `LoginPage`, `RegisterPage`, `AuthContext`, `ProtectedRoute`, `AppLayout`, `Sidebar`, `Navbar`
- **Kebutuhan Fungsional**: FR-01, FR-02, UC01, UC02
- **Tingkat Kesulitan**: Sedang
- **Estimasi Waktu**: 1 - 2 Hari

---

## 2. Deskripsi & Tujuan
Membangun antarmuka masuk (*Login*), pendaftaran mahasiswa baru (*Register*), manajemen sesi autentikasi pengguna, pembatasan hak akses halaman berdasarkan peran (*Role-Based Access Control*), dan kerangka tampilan (*App Shell Layout*) yang dilengkapi dengan navigasi samping (*Sidebar*) dan bilah atas (*Navbar*).

---

## 3. Spesifikasi Teknis & Alur

### 3.1 Halaman Login (`/login`)
- **Input**: `username`, `password`.
- **Fitur Quick-Fill Akun Demo**:
  Sediakan tombol pintas untuk mengisi akun demo praktikum dengan 1 klik:
  - Mahasiswa (`mahasiswa` / `mahasiswa123`)
  - Petugas Sarpras (`petugas` / `petugas123`)
  - Dosen Pembina (`pembina` / `pembina123`)
- **Feedback**: Menampilkan pesan error jika username/password tidak cocok.

### 3.2 Halaman Registrasi Mahasiswa (`/register`)
- **Input**: NIM, Nama Lengkap, Program Studi, Username, Password.
- **Validasi Klien**:
  - NIM wajib berupa angka dan minimal 9 digit.
  - Password minimal 6 karakter.
- **Alur Sukses**: Notifikasi berhasil dan pengalihan ke halaman `/login`.

### 3.3 Struktur Rute Terproteksi (`App.jsx`)
```jsx
// Rute Publik
<Route path="/login" element={<LoginPage />} />
<Route path="/register" element={<RegisterPage />} />

// Rute Mahasiswa
<Route element={<ProtectedRoute allowedRoles={['MAHASISWA']} />}>
  <Route path="/mahasiswa/katalog" element={<KatalogBarangPage />} />
  <Route path="/mahasiswa/booking" element={<BookingRuanganPage />} />
  <Route path="/mahasiswa/riwayat" element={<RiwayatMahasiswaPage />} />
</Route>

// Rute Petugas Sarpras
<Route element={<ProtectedRoute allowedRoles={['PETUGAS_SARPRAS']} />}>
  <Route path="/petugas/inventaris" element={<MasterInventarisPage />} />
  <Route path="/petugas/ruangan" element={<MasterRuanganPage />} />
  <Route path="/petugas/verifikasi" element={<VerifikasiOperasionalPage />} />
  <Route path="/petugas/laporan" element={<LaporanStatistikPage />} />
</Route>

// Rute Dosen Pembina
<Route element={<ProtectedRoute allowedRoles={['DOSEN_PEMBINA']} />}>
  <Route path="/pembina/antrean" element={<AntreanPersetujuanPage />} />
  <Route path="/pembina/laporan" element={<LaporanStatistikPage />} />
</Route>
```

### 3.4 Komponen AppLayout
- **Sidebar**: Menampilkan logo SIPINJAM, info peran pengguna saat ini, dan menu navigasi sesuai peran.
- **Navbar**: Menampilkan tanggal sistem hari ini, status notifikasi, nama akun, dan tombol `Logout`.

---

## 4. Langkah-Langkah Pengerjaan
1. Buat `AuthContext.jsx` yang mengelola state `user`, `token`, fungsi `login()`, dan fungsi `logout()`.
2. Buat komponen `ProtectedRoute.jsx` yang memeriksa apakah pengguna sudah login dan memiliki peran yang diizinkan. Jika tidak, redirect ke `/login` atau tampilkan pesan "403 Akses Ditolak".
3. Bangun halaman visual `LoginPage.jsx` dan `RegisterPage.jsx` dengan styling modern.
4. Bangun `AppLayout.jsx` dengan sidebar responsif (collapsible di mobile).

---

## 5. Kriteria Penerimaan (Acceptance Criteria / DoD)
- [ ] Pengguna dapat login sebagai Mahasiswa, Petugas Sarpras, dan Dosen Pembina, lalu diarahkan ke halaman utama masing-masing peran secara otomatis.
- [ ] Mahasiswa tidak dapat membuka URL rute milik Petugas (di-redirect atau diblokir).
- [ ] Tombol Logout menghapus sesi di `localStorage` dan mengembalikan pengguna ke halaman `/login`.
- [ ] Registrasi mahasiswa baru berhasil mengirim data ke endpoint BE dan akun baru langsung dapat digunakan login.

