# TASK-BE-04: API Autentikasi, Registrasi & RBAC (3 Peran)

## 1. Identitas Task
- **ID Task**: `TASK-BE-04`
- **Fase**: Fase 3 (Implementasi Endpoints Bisnis)
- **Komponen**: `sipinjam.api.handler.AuthHandler`, `sipinjam.repositori.RepositoriPengguna`
- **Kebutuhan Fungsional**: FR-01, FR-02, FR-03, UC01, UC02
- **Tingkat Kesulitan**: Sedang
- **Estimasi Waktu**: 1 - 2 Hari

---

## 2. Deskripsi & Tujuan
Mengimplementasikan endpoint autentikasi dan pendaftaran akun pengguna ke sistem. Sistem memiliki 3 peran (*Role-Based Access Control*):
1. `MAHASISWA`: Dapat login, register akun mandiri dengan validasi NIM unik, mengajukan peminjaman & booking.
2. `PETUGAS_SARPRAS`: Mengelola master data, verifikasi peminjaman/booking, serah terima, pengembalian, mencetak rekap.
3. `DOSEN_PEMBINA`: Menyetujui/menolak pengajuan barang khusus (alat lab/elektronik bernilai tinggi).

---

## 3. Spesifikasi Endpoint REST API

### 3.1 `POST /api/auth/login`
- **Deskripsi**: Verifikasi kredensial pengguna dan mengembalikan profil akun serta token/sesi.
- **Request Body**:
  ```json
  {
    "username": "mahasiswa",
    "password": "mahasiswa123"
  }
  ```
- **Respons Berhasil (200 OK)**:
  ```json
  {
    "sukses": true,
    "pesan": "Login berhasil",
    "data": {
      "id": "USR-003",
      "username": "mahasiswa",
      "nama": "Ahmad Fauzi",
      "peran": "MAHASISWA",
      "token": "sess-usr-003-token",
      "detail": {
        "nim": "21044110001",
        "programStudi": "D3 Teknik Informatika",
        "statusAktif": true,
        "jumlahPengajuanAktif": 1,
        "tunggakanDenda": 0
      }
    }
  }
  ```
- **Respons Gagal (401 Unauthorized)**:
  ```json
  {
    "sukses": false,
    "pesan": "Username atau kata sandi tidak cocok",
    "kodeKesalahan": "AUTH_GAGAL"
  }
  ```

### 3.2 `POST /api/auth/register`
- **Deskripsi**: Registrasi mahasiswa baru.
- **Validasi**:
  - NIM wajib unik (belum pernah terdaftar di `RepositoriPengguna`).
  - Username wajib unik.
  - Password minimal 6 karakter.
  - Akun baru otomatis berstatus aktif (`statusAktif = true`).
- **Request Body**:
  ```json
  {
    "nim": "21044110055",
    "nama": "Budi Santoso",
    "programStudi": "D3 Teknik Informatika",
    "username": "budis",
    "password": "password123"
  }
  ```
- **Respons Berhasil (201 Created)**:
  ```json
  {
    "sukses": true,
    "pesan": "Registrasi mahasiswa berhasil",
    "data": {
      "id": "USR-005",
      "username": "budis",
      "nim": "21044110055",
      "peran": "MAHASISWA"
    }
  }
  ```

### 3.3 `GET /api/auth/me`
- **Deskripsi**: Mengambil profil pengguna yang sedang login berdasarkan header `Authorization: Bearer <token>` atau parameter `?username=...`.

---

## 4. Langkah-Langkah Pengerjaan
1. Buat kelas `sipinjam.api.handler.AuthHandler` yang mengimplementasikan `HttpHandler`.
2. Hubungkan handler dengan `KonteksAplikasi.getRepoPengguna()`.
3. Tambahkan mekanisme penyimpanan sesi/token sederhana di memori (`Map<String, Pengguna> tokenStore`).
4. Buat helper proteksi peran:
   - `AuthHelper.validasiPeran(HttpExchange exchange, Peran... peranDiizinkan)`.
   - Mengembalikan HTTP 403 Forbidden jika peran tidak sesuai.
5. Pastikan data pengguna baru langsung tersimpan ke berkas teks melalui `PenyimpananData.simpanPengguna()`.

---

## 5. Kriteria Penerimaan (Acceptance Criteria / DoD)
- [x] User bawaan (`petugas`, `pembina`, `mahasiswa`, `mahasiswa2`) berhasil login dan mendapatkan payload profil lengkap beserta detail perannya.
- [x] Percobaan login dengan password salah mengembalikan HTTP 401 tanpa menyebabkan server crash.
- [x] Mahasiswa baru dapat didaftarkan lewat endpoint `/api/auth/register`, tersimpan ke file `data/pengguna.txt`, dan langsung dapat digunakan untuk login.
- [x] Pendaftaran dengan NIM atau username duplikat ditolak dengan status HTTP 400 dan pesan error yang deskriptif.

