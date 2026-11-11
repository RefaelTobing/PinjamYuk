package sipinjam.uji;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import sipinjam.KonteksAplikasi;
import sipinjam.exception.AksesDitolakException;
import sipinjam.exception.AturanDilanggarException;
import sipinjam.exception.BentrokJadwalException;
import sipinjam.exception.DiLuarJamOperasionalException;
import sipinjam.exception.KapasitasTerlampauiException;
import sipinjam.exception.StokTidakCukupException;
import sipinjam.model.Barang;
import sipinjam.model.BookingRuangan;
import sipinjam.model.DetailPeminjaman;
import sipinjam.model.DosenPembina;
import sipinjam.model.KondisiBarang;
import sipinjam.model.Mahasiswa;
import sipinjam.model.Peminjaman;
import sipinjam.model.Pengguna;
import sipinjam.model.RincianDenda;
import sipinjam.model.Ruangan;
import sipinjam.model.SlotWaktu;

/**
 * Pengujian skenario TC-01 s.d. TC-18 tanpa membuka antarmuka.
 * Jalankan: java -cp out sipinjam.uji.UjiSkenario [folder-data-uji]
 */
public class UjiSkenario {
    private static int lulus = 0;
    private static int gagal = 0;
    private static int nomorMahasiswa = 0;

    public static void main(String[] args) throws Exception {
        String folder = args.length > 0 ? args[0] : "data-uji";
        hapusFolder(Paths.get(folder));

        KonteksAplikasi k = new KonteksAplikasi(folder);
        LocalDate h = k.hariIni();
        DosenPembina pembina = (DosenPembina) k.getRepoPengguna().cariUsername("pembina");
        Mahasiswa mhs = (Mahasiswa) k.getRepoPengguna().cariUsername("mahasiswa");

        System.out.println("=== UJI SKENARIO SIPINJAM ===");
        System.out.println("Folder data uji : " + Paths.get(folder).toAbsolutePath());
        System.out.println("Tanggal acuan   : " + h);
        System.out.println();

        tc01(k);
        tc02_tc03(k, h);
        tc04(k, h);
        tc09_dan_tc07(k, h, pembina);
        tc08(k, h);
        tc05(k, h);
        tc06(k, h);
        tc10_tc11(k, h);
        tc12(k, h);
        tc13(k, h);
        tc14(k, h);
        tc15(k, h);
        tc18(k, h, pembina, mhs);
        tc_konsep_oop(k);
        tc16(k, folder);
        tc17(folder);

        System.out.println();
        System.out.println("==================================================");
        System.out.println("LULUS: " + lulus + "   GAGAL: " + gagal);
        System.out.println("==================================================");
        if (gagal > 0) {
            System.exit(1);
        }
    }

    // ------------------------------------------------------------------ TC-01
    private static void tc01(KonteksAplikasi k) throws Exception {
        boolean salah = k.getRepoPengguna().login("mahasiswa", "salah") == null;
        boolean benar = k.getRepoPengguna().login("mahasiswa", "mahasiswa123") != null;
        boolean userSalah = k.getRepoPengguna().login("tidakada", "apa") == null;
        cek("TC-01", "login menolak kata sandi salah tanpa berhenti", salah && benar && userSalah,
                "salah=" + salah + " benar=" + benar + " userSalah=" + userSalah);
    }

    // ------------------------------------------------------------------ TC-02 & TC-03
    private static void tc02_tc03(KonteksAplikasi k, LocalDate h) throws Exception {
        Mahasiswa a = mahasiswa(k, "uji_a");
        Mahasiswa b = mahasiswa(k, "uji_b");
        Mahasiswa c = mahasiswa(k, "uji_c");
        Barang proyektor = k.getRepoBarang().cari("PJK-01");
        try {
            Peminjaman p = k.getLayanan().ajukanBarang(a, detail(proyektor, 3),
                    h.plusDays(20), h.plusDays(21), "Uji stok penuh", h);
            k.getLayanan().setujuiPembina(p, pembina(k));
            k.getLayanan().verifikasiPetugas(p, true, "");
            cek("TC-02", "stok 3 unit disetujui untuk tanggal yang sama",
                    p.getStatus().name().equals("DISETUJUI"), "status=" + p.getStatus());
        } catch (Exception e) {
            cek("TC-02", "stok 3 unit disetujui untuk tanggal yang sama", false, e.getMessage());
        }

        String pesan = "";
        try {
            k.getLayanan().ajukanBarang(b, detail(proyektor, 1), h.plusDays(20), h.plusDays(21),
                    "Uji bentrok stok", h);
        } catch (StokTidakCukupException e) {
            pesan = e.getMessage();
        } catch (AturanDilanggarException e) {
            pesan = e.getMessage();
        }
        cek("TC-03", "pengajuan pada rentang tanggal bertumpang tindih ditolak karena stok habis",
                pesan.toLowerCase().contains("stok"), pesan);

        boolean tanggalLain = false;
        try {
            k.getLayanan().ajukanBarang(c, detail(proyektor, 1), h.plusDays(25), h.plusDays(26),
                    "Tanggal berbeda", h);
            tanggalLain = true;
        } catch (AturanDilanggarException e) {
            tanggalLain = false;
        }
        cek("TC-03b", "tanggal tidak bertumpang tindih tetap dapat diajukan", tanggalLain,
                "diterima=" + tanggalLain);
    }

    // ------------------------------------------------------------------ TC-04
    private static void tc04(KonteksAplikasi k, LocalDate h) throws Exception {
        Mahasiswa m = mahasiswa(k, "uji_d");
        Ruangan r = k.getRepoBarang().cariRuangan("R-101");
        String pesan = "";
        try {
            k.getLayanan().ajukanBooking(m, r, h.plusDays(6), new SlotWaktu(9, 10), 10,
                    "Kegiatan satu", h);
            k.getLayanan().ajukanBarang(m, detail(k.getRepoBarang().cari("KRS-01"), 2),
                    h.plusDays(6), h.plusDays(7), "Kegiatan dua", h);
            k.getLayanan().ajukanBarang(m, detail(k.getRepoBarang().cari("MEJ-01"), 1),
                    h.plusDays(6), h.plusDays(7), "Kegiatan tiga", h);
        } catch (AturanDilanggarException e) {
            pesan = e.getMessage();
        }
        cek("TC-04", "pengajuan ketiga ditolak karena batas dua pengajuan aktif",
                pesan.contains("batas maksimal 2"), pesan);
    }

    // ------------------------------------------------------------------ TC-09, TC-07
    private static void tc09_dan_tc07(KonteksAplikasi k, LocalDate h, DosenPembina pembina) throws Exception {
        Mahasiswa m = mahasiswa(k, "uji_e");
        Barang proyektor = k.getRepoBarang().cari("PJK-01");
        Peminjaman p = null;
        try {
            p = k.getLayanan().ajukanBarang(m, detail(proyektor, 1), h.plusDays(30), h.plusDays(31),
                    "Uji persetujuan", h);
        } catch (AturanDilanggarException e) {
            cek("TC-09", "pengajuan barang berlabel persetujuan masuk antrean pembina", false,
                    e.getMessage());
            return;
        }
        boolean diAntrean = k.getLayanan().menungguPembina().contains(p);
        String pesan = "";
        try {
            k.getLayanan().verifikasiPetugas(p, true, "");
        } catch (AksesDitolakException e) {
            pesan = e.getMessage();
        }
        cek("TC-09", "pengajuan barang berlabel persetujuan menunggu pembina sebelum petugas",
                diAntrean && pesan.toLowerCase().contains("pembina"),
                "antrean=" + diAntrean + " pesan=" + pesan);

        try {
            k.getLayanan().setujuiPembina(p, pembina);
            k.getLayanan().verifikasiPetugas(p, true, "");
            k.getLayanan().serahTerima(p);
        } catch (Exception e) {
            cek("TC-07", "denda keterlambatan tiga hari barang elektronik Rp30.000", false, e.getMessage());
            return;
        }
        RincianDenda rincian = kembalikan(k, p, h.plusDays(31).plusDays(3), KondisiBarang.BAIK, false);
        cek("TC-07", "denda keterlambatan tiga hari barang elektronik Rp30.000",
                Math.abs(rincian.getTotal() - 30000.0) < 0.01, "total=" + rincian.getTotal()
                + " hari=" + rincian.getHariTerlambat());
    }

    // ------------------------------------------------------------------ TC-08
    private static void tc08(KonteksAplikasi k, LocalDate h) throws Exception {
        Mahasiswa m = mahasiswa(k, "uji_f");
        Barang jas = k.getRepoBarang().cari("JAS-01");
        try {
            Peminjaman p = k.getLayanan().ajukanBarang(m, detail(jas, 1), h.plusDays(10),
                    h.plusDays(11), "Uji kondisi", h);
            k.getLayanan().verifikasiPetugas(p, true, "");
            k.getLayanan().serahTerima(p);
            RincianDenda rincian = kembalikan(k, p, h.plusDays(11), KondisiBarang.RUSAK_RINGAN, false);
            cek("TC-08", "denda kondisi rusak ringan alat laboratorium Rp75.000",
                    Math.abs(rincian.getDendaKondisi() - 75000.0) < 0.01,
                    "dendaKondisi=" + rincian.getDendaKondisi());
        } catch (Exception e) {
            cek("TC-08", "denda kondisi rusak ringan alat laboratorium Rp75.000", false, e.getMessage());
        }
    }

    // ------------------------------------------------------------------ TC-05
    private static void tc05(KonteksAplikasi k, LocalDate h) throws Exception {
        Mahasiswa m = mahasiswa(k, "uji_g");
        Barang jas = k.getRepoBarang().cari("JAS-01");
        String pesan = "";
        try {
            Peminjaman p = k.getLayanan().ajukanBarang(m, detail(jas, 1), h.plusDays(3),
                    h.plusDays(4), "Uji tunggakan", h);
            k.getLayanan().verifikasiPetugas(p, true, "");
            k.getLayanan().serahTerima(p);
            kembalikan(k, p, h.plusDays(6), KondisiBarang.BAIK, false);
            k.getLayanan().ajukanBarang(m, detail(jas, 1), h.plusDays(12), h.plusDays(13),
                    "Setelah denda", h);
        } catch (AturanDilanggarException e) {
            pesan = e.getMessage();
        }
        cek("TC-05", "pengajuan ditolak selama masih ada denda belum lunas",
                pesan.toLowerCase().contains("denda"), pesan);
    }

    // ------------------------------------------------------------------ TC-06
    private static void tc06(KonteksAplikasi k, LocalDate h) throws Exception {
        Mahasiswa m = mahasiswa(k, "uji_h");
        String pesanBarang = "";
        String pesanRuang = "";
        try {
            k.getLayanan().ajukanBarang(m, detail(k.getRepoBarang().cari("MEJ-01"), 1), h, h.plusDays(1),
                    "Hari ini", h);
        } catch (AturanDilanggarException e) {
            pesanBarang = e.getMessage();
        }
        try {
            k.getLayanan().ajukanBooking(m, k.getRepoBarang().cariRuangan("R-103"), h.plusDays(2),
                    new SlotWaktu(9, 10), 5, "H-2", h);
        } catch (AturanDilanggarException e) {
            pesanRuang = e.getMessage();
        }
        cek("TC-06", "batas waktu H-1 untuk barang dan H-3 untuk ruangan",
                pesanBarang.contains("H-1") && pesanRuang.contains("H-3"),
                "barang=" + pesanBarang + " | ruang=" + pesanRuang);
    }

    // ------------------------------------------------------------------ TC-10 & TC-11
    private static void tc10_tc11(KonteksAplikasi k, LocalDate h) throws Exception {
        Mahasiswa a = mahasiswa(k, "uji_i");
        Mahasiswa b = mahasiswa(k, "uji_j");
        Ruangan r = k.getRepoBarang().cariRuangan("R-101");
        try {
            BookingRuangan b1 = k.getLayanan().ajukanBooking(a, r, h.plusDays(8),
                    new SlotWaktu(9, 11), 10, "Kegiatan pagi", h);
            k.getLayanan().verifikasiBooking(b1, true, "");
        } catch (Exception e) {
            cek("TC-10", "booking yang bertumpang tindih ditolak", false, e.getMessage());
            return;
        }
        String pesan = "";
        try {
            k.getLayanan().ajukanBooking(b, r, h.plusDays(8), new SlotWaktu(10, 12), 5,
                    "Kegiatan bentrok", h);
        } catch (BentrokJadwalException e) {
            pesan = e.getMessage();
        } catch (AturanDilanggarException e) {
            pesan = e.getMessage();
        }
        cek("TC-10", "booking 10.00-12.00 ditolak karena bentrok 09.00-11.00",
                pesan.toLowerCase().contains("bentrok"), pesan);

        boolean besebelahan = false;
        try {
            k.getLayanan().ajukanBooking(b, r, h.plusDays(8), new SlotWaktu(11, 13), 5,
                    "Kegiatan siang", h);
            besebelahan = true;
        } catch (AturanDilanggarException e) {
            besebelahan = false;
        }
        cek("TC-11", "booking 11.00-13.00 diterima karena bersebelahan, bukan bertumpang tindih",
                besebelahan, "diterima=" + besebelahan);
    }

    // ------------------------------------------------------------------ TC-12
    private static void tc12(KonteksAplikasi k, LocalDate h) throws Exception {
        Mahasiswa m = mahasiswa(k, "uji_k");
        Ruangan r = k.getRepoBarang().cariRuangan("R-102");
        String pesanAwal = "";
        String pesanAkhir = "";
        try {
            k.getLayanan().ajukanBooking(m, r, h.plusDays(9), new SlotWaktu(6, 8), 5, "Subuh", h);
        } catch (DiLuarJamOperasionalException e) {
            pesanAwal = e.getMessage();
        } catch (AturanDilanggarException e) {
            pesanAwal = e.getMessage();
        }
        try {
            k.getLayanan().ajukanBooking(m, r, h.plusDays(9), new SlotWaktu(20, 22), 5, "Malam", h);
        } catch (DiLuarJamOperasionalException e) {
            pesanAkhir = e.getMessage();
        } catch (AturanDilanggarException e) {
            pesanAkhir = e.getMessage();
        }
        cek("TC-12", "booking di luar 07.00-21.00 ditolak",
                pesanAwal.contains("07.00-21.00") && pesanAkhir.contains("07.00-21.00"),
                pesanAwal + " | " + pesanAkhir);
    }

    // ------------------------------------------------------------------ TC-13
    private static void tc13(KonteksAplikasi k, LocalDate h) throws Exception {
        Mahasiswa m = mahasiswa(k, "uji_l");
        Ruangan r = k.getRepoBarang().cariRuangan("R-103");
        String pesan = "";
        try {
            k.getLayanan().ajukanBooking(m, r, h.plusDays(10), new SlotWaktu(13, 15), 45,
                    "Peserta berlebih", h);
        } catch (KapasitasTerlampauiException e) {
            pesan = e.getMessage();
        } catch (AturanDilanggarException e) {
            pesan = e.getMessage();
        }
        cek("TC-13", "booking 45 peserta pada ruangan berkapasitas 40 ditolak",
                pesan.toLowerCase().contains("kapasitas"), pesan);
    }

    // ------------------------------------------------------------------ TC-14
    private static void tc14(KonteksAplikasi k, LocalDate h) throws Exception {
        Mahasiswa m = mahasiswa(k, "uji_m");
        Ruangan r = k.getRepoBarang().cariRuangan("R-102");
        try {
            BookingRuangan b = k.getLayanan().ajukanBooking(m, r, h.plusDays(11),
                    new SlotWaktu(8, 10), 20, "Kegiatan batal", h);
            k.getLayanan().verifikasiBooking(b, true, "");
            double denda = k.getLayanan().batalkanBooking(b, h.plusDays(11));
            boolean tunggakan = b.adaTunggakan();
            cek("TC-14", "pembatalan pada hari pemakaian dikenai denda Rp50.000 dan menjadi tunggakan",
                    Math.abs(denda - 50000.0) < 0.01 && tunggakan,
                    "denda=" + denda + " tunggakan=" + tunggakan);
        } catch (Exception e) {
            cek("TC-14", "pembatalan pada hari pemakaian dikenai denda Rp50.000 dan menjadi tunggakan",
                    false, e.getMessage());
        }
    }

    // ------------------------------------------------------------------ TC-15
    private static void tc15(KonteksAplikasi k, LocalDate h) throws Exception {
        Mahasiswa a = mahasiswa(k, "uji_n");
        Mahasiswa b = mahasiswa(k, "uji_o");
        Ruangan r = k.getRepoBarang().cariRuangan("R-101");
        try {
            BookingRuangan b1 = k.getLayanan().ajukanBooking(a, r, h.plusDays(12),
                    new SlotWaktu(14, 16), 10, "Ditolak petugas", h);
            k.getLayanan().verifikasiBooking(b1, false, "Ruangan dipakai rapat pimpinan");
            boolean slotTerbuka = k.getLayananBooking().cariBentrok(r, h.plusDays(12),
                    new SlotWaktu(14, 16)) == null;
            BookingRuangan b2 = k.getLayanan().ajukanBooking(b, r, h.plusDays(12),
                    new SlotWaktu(14, 16), 10, "Menggantikan", h);
            cek("TC-15", "slot dilepas setelah booking ditolak sehingga dapat diajukan ulang",
                    slotTerbuka && b2.getStatus().name().equals("DIAJUKAN"),
                    "slotTerbuka=" + slotTerbuka + " bookingBaru=" + b2.getId());
        } catch (Exception e) {
            cek("TC-15", "slot dilepas setelah booking ditolak sehingga dapat diajukan ulang",
                    false, e.getMessage());
        }
    }

    // ------------------------------------------------------------------ TC-18
    private static void tc18(KonteksAplikasi k, LocalDate h, DosenPembina pembina, Mahasiswa mhs) throws Exception {
        Peminjaman biasa = null;
        try {
            biasa = k.getLayanan().ajukanBarang(mhs, detail(k.getRepoBarang().cari("KRS-01"), 1),
                    h.plusDays(13), h.plusDays(14), "Tanpa persetujuan pembina", h);
        } catch (AturanDilanggarException e) {
            cek("TC-18", "pembina tidak dapat menyetujui pengajuan yang tidak memerlukan persetujuan",
                    false, e.getMessage());
            return;
        }
        String pesan = "";
        try {
            k.getLayanan().setujuiPembina(biasa, pembina);
        } catch (AksesDitolakException e) {
            pesan = e.getMessage();
        }
        cek("TC-18", "pembina tidak dapat menyetujui pengajuan yang tidak memerlukan persetujuan",
                pesan.toLowerCase().contains("tidak memerlukan"), pesan);
    }

    // ------------------------------------------------------------------ konsep OOP
    private static void tc_konsep_oop(KonteksAplikasi k) throws Exception {
        List<String> jenis = new ArrayList<String>();
        double[] tarif = new double[3];
        int i = 0;
        for (Barang barang : k.getRepoBarang().daftarBarang()) {
            if (!jenis.contains(barang.getJenisBarang())) {
                jenis.add(barang.getJenisBarang());
                if (i < 3) {
                    tarif[i] = barang.tarifHarian();
                    i++;
                }
            }
        }
        boolean tarifBeda = tarif[0] != tarif[1] && tarif[1] != tarif[2];
        cek("OOP-1", "polymorphism tarifHarian berbeda per subclass tanpa percabangan",
                jenis.size() == 3 && tarifBeda, "jenis=" + jenis + " tarif=" + tarif[0] + ","
                + tarif[1] + "," + tarif[2]);

        boolean hierarki = (k.getRepoBarang().cari("R-101") instanceof Barang)
                && k.getRepoBarang().cari("R-101").dikelolaPerSlot()
                && !k.getRepoBarang().cari("PJK-01").dikelolaPerSlot();
        cek("OOP-2", "overriding dikelolaPerSlot membedakan ruangan dan barang", hierarki, "");

        SlotWaktu a = new SlotWaktu(9, 11);
        boolean bersebelahan = !a.bertumpangTindih(new SlotWaktu(11, 13));
        boolean tengah = a.bertumpangTindih(new SlotWaktu(10, 12));
        cek("OOP-3", "aturan tumpang tindih slot: bersebelahan bukan bentrok, beririsan bentrok",
                bersebelahan && tengah, "bersebelahan=" + bersebelahan + " beririsan=" + tengah);

        cek("OOP-4", "validator menjalankan seluruh aturan terdaftar",
                k.getValidator().getDaftarAturan().size() == 9,
                "jumlah aturan=" + k.getValidator().getDaftarAturan().size());
    }

    // ------------------------------------------------------------------ TC-16
    private static void tc16(KonteksAplikasi k, String folder) throws Exception {
        k.getPenyimpanan().simpan();
        int peminjamanLama = k.getRepoPeminjaman().semua().size();
        int bookingLama = k.getRepoBooking().semua().size();
        int penggunaLama = k.getRepoPengguna().semua().size();
        int barangLama = k.getRepoBarang().semua().size();
        String statusLama = k.getRepoPeminjaman().semua().get(0).getStatus().name();

        KonteksAplikasi muatUlang = new KonteksAplikasi(folder);
        boolean sama = muatUlang.getRepoPeminjaman().semua().size() == peminjamanLama
                && muatUlang.getRepoBooking().semua().size() == bookingLama
                && muatUlang.getRepoPengguna().semua().size() == penggunaLama
                && muatUlang.getRepoBarang().semua().size() == barangLama
                && muatUlang.getRepoPeminjaman().semua().get(0).getStatus().name().equals(statusLama);
        cek("TC-16", "data dan status tetap sama setelah simpan lalu muat ulang", sama,
                "peminjaman " + peminjamanLama + "->" + muatUlang.getRepoPeminjaman().semua().size()
                + ", booking " + bookingLama + "->" + muatUlang.getRepoBooking().semua().size()
                + ", detail " + muatUlang.getRepoPeminjaman().semua().get(0).getDetail().size()
                + " baris");
    }

    // ------------------------------------------------------------------ TC-17
    private static void tc17(String folder) throws IOException {
        Path asal = Paths.get(folder);
        Path rusak = Paths.get(folder + "-rusak");
        hapusFolder(rusak);
        Files.createDirectories(rusak);
        for (Path berkas : Files.newDirectoryStream(asal)) {
            Files.copy(berkas, rusak.resolve(berkas.getFileName().toString()),
                    java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        }
        Files.write(rusak.resolve("booking_ruangan.txt"),
                "\nbaris|rusak|tanpa|kolom\n".getBytes(StandardCharsets.UTF_8),
                StandardOpenOption.APPEND);

        KonteksAplikasi k = new KonteksAplikasi(folder + "-rusak");
        boolean tetapJalan = k.getRepoPengguna().semua().size() > 0
                && k.getRepoBarang().semua().size() > 0;
        cek("TC-17", "berkas dengan baris rusak dilewati, aplikasi tetap memuat data valid",
                tetapJalan, "pesan=" + k.getPenyimpanan().getPesanTerakhir().trim());
    }

    // ------------------------------------------------------------------ bantuan
    private static RincianDenda kembalikan(KonteksAplikasi k, Peminjaman peminjaman,
                                           LocalDate tanggalKembali, KondisiBarang kondisi,
                                           boolean lunas) throws AksesDitolakException {
        Map<DetailPeminjaman, KondisiBarang> peta = new LinkedHashMap<DetailPeminjaman, KondisiBarang>();
        for (DetailPeminjaman detail : peminjaman.getDetail()) {
            peta.put(detail, kondisi);
        }
        return k.getLayanan().catatPengembalian(peminjaman, peta, tanggalKembali, lunas);
    }

    private static List<DetailPeminjaman> detail(Barang barang, int jumlah) {
        List<DetailPeminjaman> daftar = new ArrayList<DetailPeminjaman>();
        daftar.add(new DetailPeminjaman(barang, jumlah, KondisiBarang.BAIK));
        return daftar;
    }

    private static DosenPembina pembina(KonteksAplikasi k) {
        return (DosenPembina) k.getRepoPengguna().cariUsername("pembina");
    }

    private static Mahasiswa mahasiswa(KonteksAplikasi k, String username) {
        Pengguna ada = k.getRepoPengguna().cariUsername(username);
        if (ada instanceof Mahasiswa) {
            return (Mahasiswa) ada;
        }
        nomorMahasiswa++;
        Mahasiswa mahasiswa = new Mahasiswa(k.getRepoPengguna().idBerikutnya(), "Uji " + username,
                username, "rahasia123", String.format("22041110%04d", nomorMahasiswa),
                "D3 Teknik Informatika", "081200000000", true);
        k.getRepoPengguna().tambah(mahasiswa);
        return mahasiswa;
    }

    private static void cek(String kode, String judul, boolean kondisi, String detail) {
        if (kondisi) {
            lulus++;
            System.out.println("[LULUS] " + kode + "  " + judul);
        } else {
            gagal++;
            System.out.println("[GAGAL] " + kode + "  " + judul);
            System.out.println("        detail: " + detail);
        }
    }

    private static void hapusFolder(Path folder) throws IOException {
        if (!Files.exists(folder)) {
            return;
        }
        List<Path> semua = new ArrayList<Path>();
        for (Path p : (Iterable<Path>) Files.walk(folder)::iterator) {
            semua.add(p);
        }
        java.util.Collections.sort(semua, java.util.Collections.reverseOrder());
        for (Path p : semua) {
            Files.deleteIfExists(p);
        }
    }
}
