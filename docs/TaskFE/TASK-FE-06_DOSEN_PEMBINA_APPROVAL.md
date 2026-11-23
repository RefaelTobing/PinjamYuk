# TASK-FE-06: Dashboard Antrean Persetujuan Dosen Pembina
## Implementasi Sesuai Mockup `persetujuan_dosen_pembina_minimalist.png`

---

## 1. Ringkasan Tugas
Membangun antarmuka khusus **Dosen Pembina** untuk meninjau, menyetujui, atau menolak pengajuan peminjaman barang inventaris khusus (alat laboratorium sensitif dan perangkat elektronik bernilai tinggi) sesuai berkas mockup `frontend/MockUpPinjamYuk/persetujuan_dosen_pembina_minimalist.png`.

---

## 2. Acuan Visual Mockup (`persetujuan_dosen_pembina_minimalist.png`)
* **Header Navbar Dosen Pembina**:
  - Logo kubus 3D dalam rounded square oranye/terracotta + Teks `SIPINJAM` + Badge peran `Dosen Pembina` (pill peach/amber).
  - Segmented pill tabs: `Antrean Persetujuan` (aktif: latar amber muda `bg-amber-100 text-amber-900`) dan `Riwayat`.
  - Kapsul Profil: Avatar biru/gelap + Teks `Dr. Hendra Wijaya • Dosen Pembina`.
* **Header Halaman**:
  - Judul: `Antrean Persetujuan Barang Khusus` (`text-3xl font-extrabold text-slate-900`).
  - Badge counter antrean: `• 2 Menunggu` dalam pill peach/oranye.
  - Teks deskripsi kanan: `Pemberian rekomendasi kelayakan peminjaman inventaris bernilai tinggi.`
* **Kartu Antrean Pengajuan (Minimalist Card List)**:
  - Latar putih dengan border lembut `border-slate-200/80` dan sudut melengkung `rounded-2xl`.
  - **Baris Atas**:
    - ID Transaksi & Tanggal: `PINJAM-005 • Diajukan 23 Nov 2026`.
    - Badge Kategori Otorisasi di kanan: `🛡️ Perlu Otorisasi Lab/Elektronik` (pill abu-abu keunguan).
  - **Profil Pemohon**:
    - Avatar bulat (ikon topi toga wisuda atau user).
    - Nama & Identitas: `Ahmad Fauzi` (`text-base font-bold`) dan subteks `NIM 21044110001 • D3 Teknik Informatika`.
  - **Kotak Rincian Jadwal & Keperluan** (kotak abu-abu terang di tengah):
    - Kiri: `JADWAL PEMINJAMAN` + ikon kalender + `24–26 Nov 2026 (3 Hari)`.
    - Kanan: `KEPERLUAN` + ikon dokumen/video + teks deskripsi kegiatan.
  - **Kotak Sorotan Aset Bernilai Tinggi**:
    - Latar kotak ungu muda/biru muda lembut dengan ikon mikroskop atau kamera.
    - Judul aset: `2x Mikroskop Binokuler Olympus`.
    - Subteks: `Estimasi Nilai: Rp12.000.000 • Lab Mikrobiologi Terpadu`.
    - Badge kanan: `• Aset Bernilai Tinggi` (pill peach/oranye).
  - **Baris Aksi Bawah**:
    - Kiri: Tautan dokumen `📄 Lihat Berkas Proposal PDF`.
    - Kanan: Tombol aksi sejajar:
      - Tombol `Tolak` (warna teks merah/rose lembut berlatar pink muda).
      - Tombol `✓ Setujui Pengajuan` (warna cokelat/terracotta amber tua solid: `bg-amber-900 hover:bg-amber-800 text-white font-semibold px-6 py-2.5 rounded-xl`).
* **Footer Keterangan**:
  - Ikon info + teks: `ⓘ Persetujuan otomatis diteruskan ke Petugas Loket Sarpras untuk persiapan serah-terima fisik.`

---

## 3. Rincian Pekerjaan Teknis

### A. Pengambilan Data Antrean Pembina
1. Mengirim permintaan `GET /api/peminjaman?status=MENUNGGU_PEMBINA`.
2. Menampilkan daftar pengajuan yang mengandung item bertanda `perluPersetujuan = true`.

### B. Aksi Persetujuan & Penolakan
1. **Setujui Pengajuan**:
   - Dosen mengklik tombol `Setujui Pengajuan`.
   - Mengirim permintaan `POST /api/peminjaman/{id}/persetujuan-pembina` dengan payload `{ "disetujui": true }`.
   - Status peminjaman di Backend Java otomatis berubah menjadi `DISETUJUI` (atau siap diverifikasi Sarpras).
   - Kartu dihapus dari antrean dengan animasi transisi mulus dan memunculkan toast sukses.
2. **Tolak Pengajuan**:
   - Membuka modal konfirmasi penolakan dengan field alasan penolakan wajib.
   - Mengirim permintaan `POST /api/peminjaman/{id}/persetujuan-pembina` dengan payload `{ "disetujui": false, "alasan": "..." }`.
   - Status peminjaman di Backend Java berubah menjadi `DITOLAK`.

---

## 4. Checklist Penerimaan Tugas (Definition of Done)
- [ ] Tampilan antrean persetujuan pembina sesuai persis dengan `persetujuan_dosen_pembina_minimalist.png`.
- [ ] Indikator `• Aset Bernilai Tinggi` dan estimasi nilai aset tampil dengan jelas.
- [ ] Tombol `Setujui Pengajuan` berhasil memperbarui status transaksi di Backend Java.
- [ ] Tombol `Tolak` menampilkan dialog input alasan sebelum mengirimkan pembatalan.
- [ ] Notifikasi informatif bawah ("diteruskan ke Petugas Loket Sarpras") terpasang rapi.
