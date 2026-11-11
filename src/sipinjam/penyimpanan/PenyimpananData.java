package sipinjam.penyimpanan;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import sipinjam.exception.FormatBerkasException;
import sipinjam.model.AlatLaboratorium;
import sipinjam.model.Barang;
import sipinjam.model.BarangElektronik;
import sipinjam.model.BarangFurnitur;
import sipinjam.model.BookingRuangan;
import sipinjam.model.DetailPeminjaman;
import sipinjam.model.DosenPembina;
import sipinjam.model.KategoriBarang;
import sipinjam.model.KondisiBarang;
import sipinjam.model.Mahasiswa;
import sipinjam.model.Peminjaman;
import sipinjam.model.Pengguna;
import sipinjam.model.Pengembalian;
import sipinjam.model.PetugasSarpras;
import sipinjam.model.Ruangan;
import sipinjam.model.SlotWaktu;
import sipinjam.model.StatusBooking;
import sipinjam.model.StatusPeminjaman;
import sipinjam.repositori.RepositoriBarang;
import sipinjam.repositori.RepositoriBooking;
import sipinjam.repositori.RepositoriPeminjaman;
import sipinjam.repositori.RepositoriPengguna;

/**
 * Membaca dan menyimpan seluruh data ke berkas teks berpemisah pipa.
 * Penulisan memakai berkas sementara lalu diganti nama agar data lama tidak rusak.
 */
public class PenyimpananData {
    private static final String BERKAS_PENGGUNA = "pengguna.txt";
    private static final String BERKAS_KATEGORI = "kategori.txt";
    private static final String BERKAS_BARANG = "barang.txt";
    private static final String BERKAS_PEMINJAMAN = "peminjaman.txt";
    private static final String BERKAS_DETAIL = "detail_peminjaman.txt";
    private static final String BERKAS_BOOKING = "booking_ruangan.txt";

    private final Path folder;
    private final RepositoriPengguna repoPengguna;
    private final RepositoriBarang repoBarang;
    private final RepositoriPeminjaman repoPeminjaman;
    private final RepositoriBooking repoBooking;
    private String pesanTerakhir = "";

    public PenyimpananData(String folder, RepositoriPengguna repoPengguna,
                           RepositoriBarang repoBarang, RepositoriPeminjaman repoPeminjaman,
                           RepositoriBooking repoBooking) {
        this.folder = Paths.get(folder);
        this.repoPengguna = repoPengguna;
        this.repoBarang = repoBarang;
        this.repoPeminjaman = repoPeminjaman;
        this.repoBooking = repoBooking;
    }

    /** Memuat seluruh berkas; bila belum ada, dibuat data contoh agar aplikasi siap dipakai. */
    public boolean muat() {
        try {
            Files.createDirectories(folder);
            if (!Files.exists(folder.resolve(BERKAS_PENGGUNA))) {
                isiDataContoh();
                return simpan();
            }
            Map<String, KategoriBarang> kategori = muatKategori();
            muatBarang(kategori);
            muatPengguna();
            muatPeminjaman();
            muatBooking();
            pesanTerakhir = "";
            return true;
        } catch (IOException e) {
            pesanTerakhir = "Gagal membaca berkas: " + e.getMessage();
            return false;
        }
    }

    public boolean simpan() {
        try {
            Files.createDirectories(folder);
            tulis(BERKAS_PENGGUNA, barisPengguna());
            tulis(BERKAS_KATEGORI, barisKategori());
            tulis(BERKAS_BARANG, barisBarang());
            tulis(BERKAS_PEMINJAMAN, barisPeminjaman());
            tulis(BERKAS_DETAIL, barisDetail());
            tulis(BERKAS_BOOKING, barisBooking());
            pesanTerakhir = "";
            return true;
        } catch (IOException e) {
            pesanTerakhir = "Gagal menyimpan berkas: " + e.getMessage();
            return false;
        }
    }

    private void tulis(String nama, List<String> baris) throws IOException {
        Path tujuan = folder.resolve(nama);
        Path sementara = folder.resolve(nama + ".tmp");
        Files.write(sementara, baris, StandardCharsets.UTF_8);
        try {
            Files.move(sementara, tujuan, StandardCopyOption.REPLACE_EXISTING,
                    StandardCopyOption.ATOMIC_MOVE);
        } catch (IOException e) {
            Files.move(sementara, tujuan, StandardCopyOption.REPLACE_EXISTING);
        }
    }

    private List<String> baca(String nama) throws IOException {
        Path berkas = folder.resolve(nama);
        if (!Files.exists(berkas)) {
            return new ArrayList<String>();
        }
        return Files.readAllLines(berkas, StandardCharsets.UTF_8);
    }

    // ------------------------------------------------------------------ pengguna
    private List<String> barisPengguna() {
        List<String> baris = new ArrayList<String>();
        for (Pengguna pengguna : repoPengguna.semua()) {
            String data1 = "";
            String data2 = "";
            String data3 = "";
            if (pengguna instanceof Mahasiswa) {
                Mahasiswa m = (Mahasiswa) pengguna;
                data1 = m.getNim();
                data2 = m.getProgramStudi();
                data3 = m.getNoTelepon();
            } else if (pengguna instanceof PetugasSarpras) {
                PetugasSarpras p = (PetugasSarpras) pengguna;
                data1 = p.getNip();
                data2 = p.getUnitKerja();
            } else if (pengguna instanceof DosenPembina) {
                DosenPembina d = (DosenPembina) pengguna;
                data1 = d.getNidn();
                data2 = d.getJabatan();
            }
            String aktif = pengguna instanceof Mahasiswa
                    ? String.valueOf(((Mahasiswa) pengguna).isAktif()) : "true";
            baris.add(PemisahBaris.gabung(pengguna.getId(), pengguna.getNama(),
                    pengguna.getUsername(), pengguna.getPassword(),
                    pengguna.getPeran().name(), data1, data2, data3, aktif));
        }
        return baris;
    }

    private void muatPengguna() throws IOException {
        int nomor = 0;
        for (String baris : baca(BERKAS_PENGGUNA)) {
            nomor++;
            if (baris.trim().isEmpty()) {
                continue;
            }
            try {
                String[] k = PemisahBaris.pecah(baris, 9);
                String peran = k[4].trim();
                Pengguna pengguna;
                if ("MAHASISWA".equals(peran)) {
                    pengguna = new Mahasiswa(k[0], k[1], k[2], k[3], k[5], k[6], k[7],
                            PemisahBaris.keBoolean(k[8]));
                } else if ("PETUGAS".equals(peran)) {
                    pengguna = new PetugasSarpras(k[0], k[1], k[2], k[3], k[5], k[6]);
                } else {
                    pengguna = new DosenPembina(k[0], k[1], k[2], k[3], k[5], k[6]);
                }
                repoPengguna.tambah(pengguna);
            } catch (FormatBerkasException | IllegalArgumentException e) {
                pesanTerakhir = pesanTerakhir + "Baris pengguna " + nomor + " dilewati. ";
            }
        }
    }

    // ------------------------------------------------------------------ kategori
    private List<String> barisKategori() {
        List<String> baris = new ArrayList<String>();
        Map<String, String> sudah = new HashMap<String, String>();
        for (Barang barang : repoBarang.semua()) {
            if (barang.getKategori() != null && !sudah.containsKey(barang.getKategori().getKode())) {
                sudah.put(barang.getKategori().getKode(), barang.getKategori().getNama());
            }
        }
        for (Map.Entry<String, String> entri : sudah.entrySet()) {
            baris.add(PemisahBaris.gabung(entri.getKey(), entri.getValue()));
        }
        return baris;
    }

    private Map<String, KategoriBarang> muatKategori() throws IOException {
        Map<String, KategoriBarang> hasil = new HashMap<String, KategoriBarang>();
        for (String baris : baca(BERKAS_KATEGORI)) {
            if (baris.trim().isEmpty()) {
                continue;
            }
            try {
                String[] k = PemisahBaris.pecah(baris, 2);
                hasil.put(k[0].trim(), new KategoriBarang(k[0], k[1]));
            } catch (FormatBerkasException e) {
                pesanTerakhir = pesanTerakhir + "Baris kategori dilewati. ";
            }
        }
        return hasil;
    }

    // ------------------------------------------------------------------ barang
    private List<String> barisBarang() {
        List<String> baris = new ArrayList<String>();
        for (Barang barang : repoBarang.semua()) {
            String data1 = "";
            String data2 = "";
            if (barang instanceof Ruangan) {
                Ruangan ruangan = (Ruangan) barang;
                data1 = String.valueOf(ruangan.getKapasitas());
                data2 = ruangan.getFasilitas();
            }
            baris.add(PemisahBaris.gabung(barang.getKode(), barang.getNama(),
                    barang.getKategori() == null ? "" : barang.getKategori().getKode(),
                    barang.getJenisBarang(), String.valueOf(barang.getStok()),
                    String.valueOf(barang.getHargaSatuan()),
                    String.valueOf(barang.isPerluPersetujuan()), data1, data2));
        }
        return baris;
    }

    private void muatBarang(Map<String, KategoriBarang> kategori) throws IOException {
        for (String baris : baca(BERKAS_BARANG)) {
            if (baris.trim().isEmpty()) {
                continue;
            }
            try {
                String[] k = PemisahBaris.pecah(baris, 9);
                KategoriBarang kat = kategori.get(k[2].trim());
                String jenis = k[3].trim();
                int stok = PemisahBaris.keInt(k[4], 0);
                double harga = PemisahBaris.keDouble(k[5], 0.0);
                boolean perlu = PemisahBaris.keBoolean(k[6]);
                Barang barang;
                if ("RUANGAN".equals(jenis)) {
                    barang = new Ruangan(k[0], k[1], kat, Math.max(1, PemisahBaris.keInt(k[7], 1)), k[8]);
                } else if ("ALAT_LAB".equals(jenis)) {
                    barang = new AlatLaboratorium(k[0], k[1], kat, stok, harga, perlu);
                } else if ("FURNITUR".equals(jenis)) {
                    barang = new BarangFurnitur(k[0], k[1], kat, stok, harga, perlu);
                } else {
                    barang = new BarangElektronik(k[0], k[1], kat, stok, harga, perlu);
                }
                repoBarang.tambah(barang);
            } catch (FormatBerkasException | IllegalArgumentException e) {
                pesanTerakhir = pesanTerakhir + "Baris barang " + baris + " dilewati. ";
            }
        }
    }

    // ------------------------------------------------------------------ peminjaman
    private List<String> barisPeminjaman() {
        List<String> baris = new ArrayList<String>();
        for (Peminjaman p : repoPeminjaman.semua()) {
            String tanggalKembali = "";
            String lunas = "false";
            if (p.getPengembalian() != null) {
                tanggalKembali = PemisahBaris.tanggal(p.getPengembalian().getTanggalKembali());
                lunas = String.valueOf(p.getPengembalian().isLunas());
            }
            baris.add(PemisahBaris.gabung(p.getId(), p.getPemohon().getUsername(), p.getKeperluan(),
                    PemisahBaris.tanggal(p.getTanggalPengajuan()),
                    PemisahBaris.tanggal(p.getTanggalMulai()),
                    PemisahBaris.tanggal(p.getTanggalSelesai()),
                    p.getStatus().name(), p.getIdPembina(), p.getCatatanPetugas(),
                    tanggalKembali, lunas));
        }
        return baris;
    }

    private List<String> barisDetail() {
        List<String> baris = new ArrayList<String>();
        for (Peminjaman p : repoPeminjaman.semua()) {
            for (DetailPeminjaman d : p.getDetail()) {
                baris.add(PemisahBaris.gabung(p.getId(), d.getBarang().getKode(),
                        String.valueOf(d.getJumlah()),
                        d.getKondisiAwal() == null ? "" : d.getKondisiAwal().name(),
                        d.getKondisiAkhir() == null ? "" : d.getKondisiAkhir().name(),
                        String.valueOf(d.getSubtotalDenda())));
            }
        }
        return baris;
    }

    private void muatPeminjaman() throws IOException {
        Map<String, Peminjaman> peta = new HashMap<String, Peminjaman>();
        for (String baris : baca(BERKAS_PEMINJAMAN)) {
            if (baris.trim().isEmpty()) {
                continue;
            }
            try {
                String[] k = PemisahBaris.pecah(baris, 11);
                Pengguna pengguna = repoPengguna.cariUsername(k[1].trim());
                if (!(pengguna instanceof Mahasiswa)) {
                    continue;
                }
                Peminjaman p = new Peminjaman(k[0], (Mahasiswa) pengguna,
                        PemisahBaris.keTanggal(k[3]), PemisahBaris.keTanggal(k[4]),
                        PemisahBaris.keTanggal(k[5]), k[2]);
                p.setIdPembina(k[7]);
                p.setCatatanPetugas(k[8]);
                StatusPeminjaman status = StatusPeminjaman.valueOf(k[6].trim());
                if (status != StatusPeminjaman.DIAJUKAN) {
                    p.ubahStatus(StatusPeminjaman.DISETUJUI);
                }
                while (p.getStatus() != status) {
                    if (p.getStatus() == StatusPeminjaman.DISETUJUI
                            && (status == StatusPeminjaman.DITOLAK
                                || status == StatusPeminjaman.DIBATALKAN)) {
                        p.ubahStatus(status);
                    } else if (p.getStatus() == StatusPeminjaman.DISETUJUI) {
                        p.ubahStatus(StatusPeminjaman.DIPINJAM);
                    } else if (p.getStatus() == StatusPeminjaman.DIPINJAM) {
                        p.ubahStatus(StatusPeminjaman.DIKEMBALIKAN);
                    } else {
                        break;
                    }
                }
                if (!k[9].trim().isEmpty()) {
                    p.setPengembalian(new Pengembalian(PemisahBaris.keTanggal(k[9]), 0.0,
                            PemisahBaris.keBoolean(k[10])));
                }
                repoPeminjaman.tambah(p);
                peta.put(p.getId(), p);
            } catch (FormatBerkasException | IllegalArgumentException | IllegalStateException e) {
                pesanTerakhir = pesanTerakhir + "Baris peminjaman dilewati. ";
            }
        }

        for (String baris : baca(BERKAS_DETAIL)) {
            if (baris.trim().isEmpty()) {
                continue;
            }
            try {
                String[] k = PemisahBaris.pecah(baris, 6);
                Peminjaman p = peta.get(k[0].trim());
                Barang barang = repoBarang.cari(k[1].trim());
                if (p == null || barang == null) {
                    continue;
                }
                KondisiBarang awal = k[3].trim().isEmpty()
                        ? KondisiBarang.BAIK : KondisiBarang.valueOf(k[3].trim());
                DetailPeminjaman detail = new DetailPeminjaman(barang,
                        Math.max(1, PemisahBaris.keInt(k[2], 1)), awal);
                if (!k[4].trim().isEmpty()) {
                    detail.setKondisiAkhir(KondisiBarang.valueOf(k[4].trim()));
                }
                detail.setSubtotalDenda(PemisahBaris.keDouble(k[5], 0.0));
                p.tambahDetail(detail);
            } catch (FormatBerkasException | IllegalArgumentException e) {
                pesanTerakhir = pesanTerakhir + "Baris detail dilewati. ";
            }
        }
    }

    // ------------------------------------------------------------------ booking
    private List<String> barisBooking() {
        List<String> baris = new ArrayList<String>();
        for (BookingRuangan b : repoBooking.semua()) {
            baris.add(PemisahBaris.gabung(b.getId(), b.getRuangan().getKode(),
                    b.getPemohon().getUsername(), PemisahBaris.tanggal(b.getTanggalPengajuan()),
                    PemisahBaris.tanggal(b.getTanggal()),
                    b.getSlot().getJamMulai().toString(), b.getSlot().getJamSelesai().toString(),
                    String.valueOf(b.getJumlahPeserta()), b.getKeperluan(), b.getStatus().name(),
                    b.getCatatanPetugas(), String.valueOf(b.getDendaPembatalan()),
                    String.valueOf(b.isDendaLunas())));
        }
        return baris;
    }

    private void muatBooking() throws IOException {
        for (String baris : baca(BERKAS_BOOKING)) {
            if (baris.trim().isEmpty()) {
                continue;
            }
            try {
                String[] k = PemisahBaris.pecah(baris, 13);
                Ruangan ruangan = repoBarang.cariRuangan(k[1].trim());
                Pengguna pengguna = repoPengguna.cariUsername(k[2].trim());
                if (ruangan == null || !(pengguna instanceof Mahasiswa)) {
                    continue;
                }
                SlotWaktu slot = new SlotWaktu(java.time.LocalTime.parse(k[5].trim()),
                        java.time.LocalTime.parse(k[6].trim()));
                BookingRuangan booking = new BookingRuangan(k[0], ruangan, (Mahasiswa) pengguna,
                        PemisahBaris.keTanggal(k[3]), PemisahBaris.keTanggal(k[4]), slot,
                        PemisahBaris.keInt(k[7], 1), k[8], StatusBooking.DIAJUKAN, k[10],
                        PemisahBaris.keDouble(k[11], 0.0), PemisahBaris.keBoolean(k[12]));
                StatusBooking status = StatusBooking.valueOf(k[9].trim());
                if (status != StatusBooking.DIAJUKAN) {
                    booking.ubahStatus(StatusBooking.DISETUJUI);
                }
                if (status == StatusBooking.TERPAKAI || status == StatusBooking.SELESAI) {
                    booking.ubahStatus(StatusBooking.TERPAKAI);
                }
                if (status == StatusBooking.SELESAI) {
                    booking.ubahStatus(StatusBooking.SELESAI);
                } else if (status == StatusBooking.DITOLAK || status == StatusBooking.DIBATALKAN) {
                    booking.ubahStatus(status);
                }
                repoBooking.tambah(booking);
            } catch (FormatBerkasException | IllegalArgumentException | IllegalStateException e) {
                pesanTerakhir = pesanTerakhir + "Baris booking dilewati. ";
            }
        }
    }

    // ------------------------------------------------------------------ data contoh
    private void isiDataContoh() {
        KategoriBarang elektronik = new KategoriBarang("ELK", "Elektronik");
        KategoriBarang alatLab = new KategoriBarang("LAB", "Alat Laboratorium");
        KategoriBarang furnitur = new KategoriBarang("FUR", "Furnitur");
        KategoriBarang ruang = new KategoriBarang("RNG", "Ruangan");

        repoPengguna.tambah(new PetugasSarpras("U001", "Bagian Sarana Prasarana", "petugas",
                "petugas123", "198501012010011001", "Unit Sarana dan Prasarana"));
        repoPengguna.tambah(new DosenPembina("U002", "Koordinator Praktikum", "pembina",
                "pembina123", "0712345678", "Dosen Pembina Kemahasiswaan"));
        repoPengguna.tambah(new Mahasiswa("U003", "Mahasiswa Contoh", "mahasiswa", "mahasiswa123",
                "220411100001", "D3 Teknik Informatika", "081234567890", true));
        repoPengguna.tambah(new Mahasiswa("U004", "Rekan Satu Tim", "mahasiswa2", "mahasiswa123",
                "220411100002", "D3 Teknik Informatika", "081234567891", true));

        repoBarang.tambah(new BarangElektronik("PJK-01", "Proyektor Epson", elektronik, 3, 6500000, true));
        repoBarang.tambah(new BarangElektronik("SND-01", "Pengeras Suara", elektronik, 2, 2500000, true));
        repoBarang.tambah(new BarangFurnitur("KRS-01", "Kursi Lipat", furnitur, 40, 150000, false));
        repoBarang.tambah(new BarangFurnitur("MEJ-01", "Meja Lipat", furnitur, 10, 350000, false));
        repoBarang.tambah(new AlatLaboratorium("JAS-01", "Jas Laboratorium", alatLab, 15, 120000, false));
        repoBarang.tambah(new AlatLaboratorium("MIK-01", "Mikroskop", alatLab, 4, 4500000, true));

        repoBarang.tambah(new Ruangan("R-101", "Ruang Rapat", ruang, 20, "AC, proyektor, whiteboard"));
        repoBarang.tambah(new Ruangan("R-102", "Aula Kampus", ruang, 100, "AC, sound system, panggung"));
        repoBarang.tambah(new Ruangan("R-103", "Ruang Kelas 3A", ruang, 40, "AC, proyektor"));
    }

    public String getPesanTerakhir() {
        return pesanTerakhir;
    }

    public Path getFolder() {
        return folder;
    }
}
