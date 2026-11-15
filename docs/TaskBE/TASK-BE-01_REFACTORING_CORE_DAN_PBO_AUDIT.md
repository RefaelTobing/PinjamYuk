# TASK-BE-01: Refactoring Core Domain & Audit Kepatuhan OOP PBO

## 1. Identitas Task
- **ID Task**: `TASK-BE-01`
- **Fase**: Fase 1 (Audit & Restrukturisasi Core)
- **Komponen**: `sipinjam.model`, `sipinjam.aturan`, `sipinjam.layanan`, `sipinjam.repositori`, `sipinjam.penyimpanan`
- **Tingkat Kesulitan**: Sedang
- **Estimasi Waktu**: 1 - 2 Hari

---

## 2. Deskripsi & Tujuan
Memastikan seluruh logika inti sistem SIPINJAM terbebas dari ketergantungan tampilan grafis lama (`javax.swing`), sekaligus memverifikasi bahwa seluruh konsep Pemrograman Berorientasi Objek (PBO) sesuai rubrik penilaian tugas akhir tetap utuh, teruji, dan siap dipanggil oleh controller HTTP API.

---

## 3. Analisis Kebutuhan Fungsional & Diagram
- **Diagram Terkait**: `docs/diagrams/class_model_sipinjam.png`, `docs/diagrams/class_aturan_sipinjam.png`, `docs/diagrams/class_penyimpanan_sipinjam.png`.
- **Target Konsep PBO**:
  1. **Abstraction**: Abstract class `Pengguna` dan `Barang`; interface `AturanPeminjaman`.
  2. **Encapsulation**: Atribut `private`, getter/setter dengan proteksi validasi, mutasi status lewat metode terstandar.
  3. **Inheritance**: `Mahasiswa`, `PetugasSarpras`, `DosenPembina` extends `Pengguna`; `BarangElektronik`, `AlatLaboratorium`, `BarangFurnitur`, `Ruangan` extends `Barang`.
  4. **Polymorphism**: Overriding `getJenisBarang()`, `tarifHarian()`, `biayaKondisi()`; eksekusi polymorphic validation rules via `ValidatorPeminjaman`.
  5. **Exception Handling**: Hirarki `AturanDilanggarException` dan custom exception turunan.
  6. **Collection Framework**: `ArrayList<Barang>`, `ArrayList<Peminjaman>`, `ArrayList<BookingRuangan>`, `Map<String, Integer>`.
  7. **File Handling**: Serialisasi/deserialisasi berkas teks pipa (`|`) pada direktori `data/`.

---

## 4. Langkah-Langkah Pengerjaan

1. **Audit Dependensi Swing**:
   - Periksa seluruh file di `src/sipinjam/model/`, `src/sipinjam/aturan/`, `src/sipinjam/layanan/`, `src/sipinjam/repositori/`, dan `src/sipinjam/penyimpanan/`.
   - Pastikan **TIDAK ADA SATUPUN IMPORT** dari package `javax.swing.*`, `java.awt.*`, atau `sipinjam.tampilan.*`.
   - Hanya paket `sipinjam.tampilan` (GUI lama) yang boleh mengimpor Swing.

2. **Verifikasi `KonteksAplikasi.java`**:
   - Pastikan `KonteksAplikasi` berperan murni sebagai *Composition Root* yang merakit repositori, rule validator, layanan kalkulator denda, layanan ketersediaan, layanan booking, dan penyimpanan file handling.
   - Sediakan method accessor yang bersih untuk digunakan oleh API server.

3. **Verifikasi Jalannya `UjiSkenario.java`**:
   - Jalankan `javac` dan uji scenario test TC-01 s.d TC-18.
   - Pastikan seluruh pengujian unit model & layanan lolos 100% tanpa membuka GUI.

4. **Persiapan Pemisahan Entrypoint**:
   - Buat kelas `sipinjam.AplikasiServer.java` sebagai entry point baru yang menjalankan backend REST API tanpa menyentuh `AplikasiSipinjam.java` (GUI lama tetap dibiarkan ada sebagai cadangan).

---

## 5. Kriteria Penerimaan (Acceptance Criteria / DoD)
- [ ] Paket `model`, `aturan`, `layanan`, `repositori`, dan `penyimpanan` terbukti 100% bebas dari dependensi Swing/AWT.
- [ ] Seluruh 9 implementasi aturan (R1-R5, S1-S4) berjalan sempurna di bawah `ValidatorPeminjaman`.
- [ ] Seluruh skenario pengujian di `UjiSkenario` sukses dieksekusi via terminal:
  ```bash
  javac -encoding UTF-8 -d out $(find src -name "*.java")
  java -cp out sipinjam.uji.UjiSkenario
  ```
- [ ] Seluruh 9 poin rubrik PBO (Class/Object, Constructor, Encapsulation, Inheritance, Polymorphism, Abstraction, Exception, Collection, File Handling) terverifikasi dan terdokumentasi.

