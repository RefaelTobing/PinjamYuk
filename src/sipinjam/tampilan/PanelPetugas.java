package sipinjam.tampilan;

import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.GridLayout;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JCheckBox;
import javax.swing.JComboBox;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JTabbedPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.table.DefaultTableModel;

import sipinjam.KonteksAplikasi;
import sipinjam.exception.AksesDitolakException;
import sipinjam.model.AlatLaboratorium;
import sipinjam.model.Barang;
import sipinjam.model.BarangElektronik;
import sipinjam.model.BarangFurnitur;
import sipinjam.model.BookingRuangan;
import sipinjam.model.DetailPeminjaman;
import sipinjam.model.KategoriBarang;
import sipinjam.model.KondisiBarang;
import sipinjam.model.Peminjaman;
import sipinjam.model.RincianDenda;
import sipinjam.model.Ruangan;
import sipinjam.model.StatusPeminjaman;

/** Panel petugas: verifikasi, sirkulasi, data inventaris, dan rekap. */
public class PanelPetugas extends JPanel {
    private final KonteksAplikasi konteks;

    private final DefaultTableModel modelPeminjaman = KomponenUI.model(
            "Id", "Pemohon", "Barang", "Mulai", "Selesai", "Status", "Pembina", "Catatan");
    private final JTable tabelPeminjaman = KomponenUI.tabel(modelPeminjaman);
    private final DefaultTableModel modelBooking = KomponenUI.model(
            "Id", "Ruangan", "Pemohon", "Tanggal", "Slot", "Peserta", "Status");
    private final JTable tabelBooking = KomponenUI.tabel(modelBooking);
    private final DefaultTableModel modelInventaris = KomponenUI.model(
            "Kode", "Nama", "Kategori", "Jenis", "Stok", "Harga", "Persetujuan");
    private final JTable tabelInventaris = KomponenUI.tabel(modelInventaris);
    private final DefaultTableModel modelKategori = KomponenUI.model("Kategori", "Unit Dipinjam");
    private final JTable tabelKategori = KomponenUI.tabel(modelKategori);
    private final DefaultTableModel modelJam = KomponenUI.model("Jam Mulai", "Jumlah Booking");
    private final JTable tabelJam = KomponenUI.tabel(modelJam);
    private final DefaultTableModel modelTempo = KomponenUI.model(
            "Id", "Pemohon", "Batas Kembali", "Status");
    private final JTable tabelTempo = KomponenUI.tabel(modelTempo);
    private final JLabel ringkasan = new JLabel(" ");

    public PanelPetugas(KonteksAplikasi konteks) {
        this.konteks = konteks;
        setLayout(new BorderLayout());
        setBorder(BorderFactory.createEmptyBorder(8, 8, 8, 8));
        JTabbedPane tab = new JTabbedPane();
        tab.addTab("Verifikasi peminjaman", tabPeminjaman());
        tab.addTab("Verifikasi booking", tabBooking());
        tab.addTab("Data inventaris", tabInventaris());
        tab.addTab("Rekap", tabRekap());
        add(tab, BorderLayout.CENTER);
        muatSemua();
    }

    // ------------------------------------------------------------------ peminjaman
    private JPanel tabPeminjaman() {
        JPanel panel = new JPanel(new BorderLayout(4, 4));
        panel.setBorder(BorderFactory.createEmptyBorder(8, 8, 8, 8));
        panel.add(KomponenUI.gulung(tabelPeminjaman), BorderLayout.CENTER);

        JPanel tombol = new JPanel(new FlowLayout(FlowLayout.LEFT, 6, 4));
        JButton setuju = new JButton("Setujui");
        setuju.addActionListener(e -> verifikasi(true));
        JButton tolak = new JButton("Tolak");
        tolak.addActionListener(e -> verifikasi(false));
        JButton serah = new JButton("Catat serah terima");
        serah.addActionListener(e -> serahTerima());
        JButton kembali = new JButton("Catat pengembalian");
        kembali.addActionListener(e -> pengembalian());
        JButton lunas = new JButton("Tandai denda lunas");
        lunas.addActionListener(e -> lunasiDenda());
        tombol.add(setuju);
        tombol.add(tolak);
        tombol.add(serah);
        tombol.add(kembali);
        tombol.add(lunas);
        panel.add(tombol, BorderLayout.SOUTH);
        return panel;
    }

    private Peminjaman peminjamanTerpilih() {
        Object id = KomponenUI.terpilih(tabelPeminjaman);
        if (id == null) {
            KomponenUI.galat(this, "Pilih satu baris peminjaman terlebih dahulu");
            return null;
        }
        return konteks.getRepoPeminjaman().cari(String.valueOf(id));
    }

    private void verifikasi(boolean setuju) {
        Peminjaman peminjaman = peminjamanTerpilih();
        if (peminjaman == null) {
            return;
        }
        String catatan = "";
        if (!setuju) {
            catatan = KomponenUI.tanya(this, "Alasan penolakan pengajuan " + peminjaman.getId());
            if (catatan == null) {
                return;
            }
        }
        try {
            konteks.getLayanan().verifikasiPetugas(peminjaman, setuju, catatan);
            muatSemua();
            KomponenUI.info(this, "Pengajuan " + peminjaman.getId() + " "
                    + (setuju ? "disetujui" : "ditolak"));
        } catch (AksesDitolakException | IllegalStateException e) {
            KomponenUI.galat(this, e.getMessage());
        }
    }

    private void serahTerima() {
        Peminjaman peminjaman = peminjamanTerpilih();
        if (peminjaman == null) {
            return;
        }
        try {
            konteks.getLayanan().serahTerima(peminjaman);
            muatSemua();
            KomponenUI.info(this, "Serah terima " + peminjaman.getId()
                    + " dicatat. Barang berstatus dipinjam.");
        } catch (AksesDitolakException | IllegalStateException e) {
            KomponenUI.galat(this, e.getMessage());
        }
    }

    private void pengembalian() {
        Peminjaman peminjaman = peminjamanTerpilih();
        if (peminjaman == null) {
            return;
        }
        List<JComboBox<KondisiBarang>> pilihan = new ArrayList<JComboBox<KondisiBarang>>();
        JPanel form = new JPanel(new GridLayout(0, 2, 6, 6));
        for (DetailPeminjaman detail : peminjaman.getDetail()) {
            form.add(KomponenUI.label(detail.getBarang().getNama() + " x" + detail.getJumlah()));
            JComboBox<KondisiBarang> combo = new JComboBox<KondisiBarang>(KondisiBarang.values());
            combo.setSelectedItem(KondisiBarang.BAIK);
            pilihan.add(combo);
            form.add(combo);
        }
        JTextField tanggalKembali = KomponenUI.field(10);
        tanggalKembali.setText(KomponenUI.tanggal(konteks.hariIni()));
        form.add(KomponenUI.label("Tanggal kembali"));
        form.add(tanggalKembali);
        JCheckBox lunas = new JCheckBox("Denda langsung dibayar");
        form.add(new JLabel());
        form.add(lunas);

        int jawab = JOptionPane.showConfirmDialog(this, form, "Pengembalian " + peminjaman.getId(),
                JOptionPane.OK_CANCEL_OPTION, JOptionPane.PLAIN_MESSAGE);
        if (jawab != JOptionPane.OK_OPTION) {
            return;
        }
        try {
            Map<DetailPeminjaman, KondisiBarang> kondisi = new LinkedHashMap<DetailPeminjaman, KondisiBarang>();
            for (int i = 0; i < pilihan.size(); i++) {
                kondisi.put(peminjaman.getDetail().get(i),
                        (KondisiBarang) pilihan.get(i).getSelectedItem());
            }
            LocalDate tanggal = KomponenUI.keTanggal(tanggalKembali.getText());
            RincianDenda rincian = konteks.getLayanan().catatPengembalian(peminjaman, kondisi,
                    tanggal, lunas.isSelected());
            muatSemua();
            KomponenUI.info(this, "Pengembalian dicatat." + System.lineSeparator()
                    + "Terlambat: " + rincian.getHariTerlambat() + " hari" + System.lineSeparator()
                    + "Denda keterlambatan: " + KomponenUI.rupiah(rincian.getDendaTerlambat())
                    + System.lineSeparator()
                    + "Denda kondisi: " + KomponenUI.rupiah(rincian.getDendaKondisi())
                    + System.lineSeparator()
                    + "Total denda: " + KomponenUI.rupiah(rincian.getTotal()));
        } catch (AksesDitolakException | IllegalArgumentException | IllegalStateException e) {
            KomponenUI.galat(this, e.getMessage());
        }
    }

    private void lunasiDenda() {
        Peminjaman peminjaman = peminjamanTerpilih();
        if (peminjaman == null) {
            return;
        }
        konteks.getLayanan().lunasiDenda(peminjaman);
        muatSemua();
        KomponenUI.info(this, "Denda " + peminjaman.getId() + " ditandai lunas");
    }

    // ------------------------------------------------------------------ booking
    private JPanel tabBooking() {
        JPanel panel = new JPanel(new BorderLayout(4, 4));
        panel.setBorder(BorderFactory.createEmptyBorder(8, 8, 8, 8));
        panel.add(KomponenUI.gulung(tabelBooking), BorderLayout.CENTER);

        JPanel tombol = new JPanel(new FlowLayout(FlowLayout.LEFT, 6, 4));
        JButton setuju = new JButton("Setujui booking");
        setuju.addActionListener(e -> verifikasiBooking(true));
        JButton tolak = new JButton("Tolak booking");
        tolak.addActionListener(e -> verifikasiBooking(false));
        tombol.add(setuju);
        tombol.add(tolak);
        panel.add(tombol, BorderLayout.SOUTH);
        return panel;
    }

    private BookingRuangan bookingTerpilih() {
        Object id = KomponenUI.terpilih(tabelBooking);
        if (id == null) {
            KomponenUI.galat(this, "Pilih satu baris booking terlebih dahulu");
            return null;
        }
        for (BookingRuangan booking : konteks.getRepoBooking().semua()) {
            if (booking.getId().equals(String.valueOf(id))) {
                return booking;
            }
        }
        return null;
    }

    private void verifikasiBooking(boolean setuju) {
        BookingRuangan booking = bookingTerpilih();
        if (booking == null) {
            return;
        }
        String catatan = "";
        if (!setuju) {
            catatan = KomponenUI.tanya(this, "Alasan penolakan booking " + booking.getId());
            if (catatan == null) {
                return;
            }
        }
        try {
            konteks.getLayanan().verifikasiBooking(booking, setuju, catatan);
            muatSemua();
            KomponenUI.info(this, "Booking " + booking.getId() + " "
                    + (setuju ? "disetujui" : "ditolak"));
        } catch (AksesDitolakException | IllegalStateException e) {
            KomponenUI.galat(this, e.getMessage());
        }
    }

    // ------------------------------------------------------------------ inventaris
    private JPanel tabInventaris() {
        JPanel panel = new JPanel(new BorderLayout(4, 4));
        panel.setBorder(BorderFactory.createEmptyBorder(8, 8, 8, 8));
        panel.add(KomponenUI.gulung(tabelInventaris), BorderLayout.CENTER);

        JPanel tombol = new JPanel(new FlowLayout(FlowLayout.LEFT, 6, 4));
        JButton tambahBarang = new JButton("Tambah barang");
        tambahBarang.addActionListener(e -> tambahBarang());
        JButton tambahRuangan = new JButton("Tambah ruangan");
        tambahRuangan.addActionListener(e -> tambahRuangan());
        JButton ubahStok = new JButton("Ubah stok");
        ubahStok.addActionListener(e -> ubahStok());
        tombol.add(tambahBarang);
        tombol.add(tambahRuangan);
        tombol.add(ubahStok);
        panel.add(tombol, BorderLayout.SOUTH);
        return panel;
    }

    private void tambahBarang() {
        JTextField kode = KomponenUI.field(12);
        JTextField nama = KomponenUI.field(18);
        JComboBox<String> jenis = new JComboBox<String>(
                new String[]{"ELEKTRONIK", "ALAT_LAB", "FURNITUR"});
        JTextField stok = KomponenUI.field(6);
        stok.setText("1");
        JTextField harga = KomponenUI.field(12);
        harga.setText("0");
        JCheckBox perlu = new JCheckBox("Perlu persetujuan pembina");

        JPanel form = new JPanel(new GridLayout(0, 2, 6, 6));
        form.add(KomponenUI.label("Kode"));
        form.add(kode);
        form.add(KomponenUI.label("Nama"));
        form.add(nama);
        form.add(KomponenUI.label("Jenis"));
        form.add(jenis);
        form.add(KomponenUI.label("Stok"));
        form.add(stok);
        form.add(KomponenUI.label("Harga satuan"));
        form.add(harga);
        form.add(new JLabel());
        form.add(perlu);

        if (JOptionPane.showConfirmDialog(this, form, "Tambah barang",
                JOptionPane.OK_CANCEL_OPTION, JOptionPane.PLAIN_MESSAGE) != JOptionPane.OK_OPTION) {
            return;
        }
        try {
            String jenisTeks = String.valueOf(jenis.getSelectedItem());
            KategoriBarang kategori = kategoriUntuk(jenisTeks);
            int jumlahStok = Integer.parseInt(stok.getText().trim());
            double hargaSatuan = Double.parseDouble(harga.getText().trim());
            Barang barang;
            if ("ALAT_LAB".equals(jenisTeks)) {
                barang = new AlatLaboratorium(kode.getText().trim(), nama.getText().trim(), kategori,
                        jumlahStok, hargaSatuan, perlu.isSelected());
            } else if ("FURNITUR".equals(jenisTeks)) {
                barang = new BarangFurnitur(kode.getText().trim(), nama.getText().trim(), kategori,
                        jumlahStok, hargaSatuan, perlu.isSelected());
            } else {
                barang = new BarangElektronik(kode.getText().trim(), nama.getText().trim(), kategori,
                        jumlahStok, hargaSatuan, perlu.isSelected());
            }
            konteks.getRepoBarang().tambah(barang);
            konteks.getPenyimpanan().simpan();
            muatSemua();
            KomponenUI.info(this, "Barang " + barang.getNama() + " ditambahkan");
        } catch (IllegalArgumentException e) {
            KomponenUI.galat(this, e.getMessage());
        }
    }

    private KategoriBarang kategoriUntuk(String jenis) {
        String kode = "ELEKTRONIK".equals(jenis) ? "ELK" : ("ALAT_LAB".equals(jenis) ? "LAB" : "FUR");
        String nama = "ELEKTRONIK".equals(jenis) ? "Elektronik"
                : ("ALAT_LAB".equals(jenis) ? "Alat Laboratorium" : "Furnitur");
        for (Barang barang : konteks.getRepoBarang().semua()) {
            if (barang.getKategori() != null && barang.getKategori().getKode().equals(kode)) {
                return barang.getKategori();
            }
        }
        return new KategoriBarang(kode, nama);
    }

    private void tambahRuangan() {
        JTextField kode = KomponenUI.field(12);
        JTextField nama = KomponenUI.field(18);
        JTextField kapasitas = KomponenUI.field(6);
        kapasitas.setText("30");
        JTextField fasilitas = KomponenUI.field(20);

        JPanel form = new JPanel(new GridLayout(0, 2, 6, 6));
        form.add(KomponenUI.label("Kode"));
        form.add(kode);
        form.add(KomponenUI.label("Nama"));
        form.add(nama);
        form.add(KomponenUI.label("Kapasitas"));
        form.add(kapasitas);
        form.add(KomponenUI.label("Fasilitas"));
        form.add(fasilitas);

        if (JOptionPane.showConfirmDialog(this, form, "Tambah ruangan",
                JOptionPane.OK_CANCEL_OPTION, JOptionPane.PLAIN_MESSAGE) != JOptionPane.OK_OPTION) {
            return;
        }
        try {
            KategoriBarang kategori = new KategoriBarang("RNG", "Ruangan");
            for (Barang barang : konteks.getRepoBarang().semua()) {
                if (barang.getKategori() != null && "RNG".equals(barang.getKategori().getKode())) {
                    kategori = barang.getKategori();
                }
            }
            Ruangan ruangan = new Ruangan(kode.getText().trim(), nama.getText().trim(), kategori,
                    Integer.parseInt(kapasitas.getText().trim()), fasilitas.getText().trim());
            konteks.getRepoBarang().tambah(ruangan);
            konteks.getPenyimpanan().simpan();
            muatSemua();
            KomponenUI.info(this, "Ruangan " + ruangan.getNama() + " ditambahkan");
        } catch (IllegalArgumentException e) {
            KomponenUI.galat(this, e.getMessage());
        }
    }

    private void ubahStok() {
        Object kode = KomponenUI.terpilih(tabelInventaris);
        if (kode == null) {
            KomponenUI.galat(this, "Pilih satu baris inventaris terlebih dahulu");
            return;
        }
        Barang barang = konteks.getRepoBarang().cari(String.valueOf(kode));
        if (barang instanceof Ruangan) {
            KomponenUI.galat(this, "Ruangan tidak memiliki stok");
            return;
        }
        String masukan = KomponenUI.tanya(this, "Stok baru untuk " + barang.getNama()
                + " (sekarang " + barang.getStok() + ")");
        if (masukan == null) {
            return;
        }
        try {
            barang.setStok(Integer.parseInt(masukan.trim()));
            konteks.getPenyimpanan().simpan();
            muatSemua();
        } catch (IllegalArgumentException e) {
            KomponenUI.galat(this, "Stok harus berupa angka nol atau lebih");
        }
    }

    // ------------------------------------------------------------------ rekap
    private JPanel tabRekap() {
        JPanel panel = new JPanel(new BorderLayout(4, 8));
        panel.setBorder(BorderFactory.createEmptyBorder(8, 8, 8, 8));
        ringkasan.setFont(new Font("SansSerif", Font.BOLD, 13));
        panel.add(ringkasan, BorderLayout.NORTH);

        JPanel isi = new JPanel(new GridLayout(1, 3, 8, 8));
        JPanel kiri = new JPanel(new BorderLayout(4, 4));
        kiri.add(KomponenUI.judul("Unit dipinjam per kategori"), BorderLayout.NORTH);
        kiri.add(KomponenUI.gulung(tabelKategori), BorderLayout.CENTER);
        JPanel tengah = new JPanel(new BorderLayout(4, 4));
        tengah.add(KomponenUI.judul("Utilisasi ruangan per jam"), BorderLayout.NORTH);
        tengah.add(KomponenUI.gulung(tabelJam), BorderLayout.CENTER);
        JPanel kanan = new JPanel(new BorderLayout(4, 4));
        kanan.add(KomponenUI.judul("Peminjaman lewat tenggat"), BorderLayout.NORTH);
        kanan.add(KomponenUI.gulung(tabelTempo), BorderLayout.CENTER);
        isi.add(kiri);
        isi.add(tengah);
        isi.add(kanan);
        panel.add(isi, BorderLayout.CENTER);

        JButton segarkan = new JButton("Hitung ulang rekap");
        segarkan.addActionListener(e -> muatRekap());
        JPanel bawah = new JPanel(new FlowLayout(FlowLayout.LEFT, 6, 4));
        bawah.add(segarkan);
        panel.add(bawah, BorderLayout.SOUTH);
        return panel;
    }

    private void muatRekap() {
        List<Peminjaman> semua = konteks.getRepoPeminjaman().semua();
        modelKategori.setRowCount(0);
        for (Map.Entry<String, Integer> entri : konteks.getRekap().perKategori(semua).entrySet()) {
            modelKategori.addRow(new Object[]{entri.getKey(), entri.getValue()});
        }
        modelJam.setRowCount(0);
        for (Map.Entry<String, Integer> entri
                : konteks.getRekap().utilisasiPerJam(konteks.getRepoBooking().semua()).entrySet()) {
            modelJam.addRow(new Object[]{entri.getKey(), entri.getValue()});
        }
        modelTempo.setRowCount(0);
        for (Peminjaman peminjaman : konteks.getLayanan().jatuhTempo(konteks.hariIni())) {
            modelTempo.addRow(new Object[]{peminjaman.getId(), peminjaman.getPemohon().getNama(),
                KomponenUI.tanggal(peminjaman.getTanggalSelesai()),
                peminjaman.getStatus().getLabel()});
        }
        ringkasan.setText("Peminjaman: " + semua.size()
                + "   |   Booking: " + konteks.getRepoBooking().semua().size()
                + "   |   Tingkat keterlambatan: "
                + String.format("%.1f", konteks.getRekap().tingkatKeterlambatan(semua)) + "%"
                + "   |   Total denda: " + KomponenUI.rupiah(konteks.getRekap().totalDenda(semua))
                + "   |   Jam ruangan terpakai: "
                + konteks.getRekap().jamTerpakai(konteks.getRepoBooking().semua()) + " jam");
    }

    // ------------------------------------------------------------------ muat ulang
    public void muatSemua() {
        modelPeminjaman.setRowCount(0);
        for (Peminjaman peminjaman : konteks.getRepoPeminjaman().semua()) {
            StringBuilder barang = new StringBuilder();
            for (DetailPeminjaman detail : peminjaman.getDetail()) {
                if (barang.length() > 0) {
                    barang.append(", ");
                }
                barang.append(detail.getBarang().getNama()).append(" x").append(detail.getJumlah());
            }
            modelPeminjaman.addRow(new Object[]{peminjaman.getId(),
                peminjaman.getPemohon().getNama(), barang.toString(),
                KomponenUI.tanggal(peminjaman.getTanggalMulai()),
                KomponenUI.tanggal(peminjaman.getTanggalSelesai()),
                peminjaman.getStatus().getLabel(),
                peminjaman.getIdPembina().isEmpty() ? "-" : peminjaman.getIdPembina(),
                peminjaman.getCatatanPetugas()});
        }

        modelBooking.setRowCount(0);
        for (BookingRuangan booking : konteks.getRepoBooking().semua()) {
            modelBooking.addRow(new Object[]{booking.getId(), booking.getRuangan().getNama(),
                booking.getPemohon().getNama(), KomponenUI.tanggal(booking.getTanggal()),
                booking.getSlot().toString(), booking.getJumlahPeserta(),
                booking.getStatus().getLabel()});
        }

        modelInventaris.setRowCount(0);
        for (Barang barang : konteks.getRepoBarang().semua()) {
            modelInventaris.addRow(new Object[]{barang.getKode(), barang.getNama(),
                barang.getKategori() == null ? "-" : barang.getKategori().getNama(),
                barang.getJenisBarang(), barang.dikelolaPerSlot() ? "-" : String.valueOf(barang.getStok()),
                KomponenUI.rupiah(barang.getHargaSatuan()),
                barang.isPerluPersetujuan() ? "Ya" : "Tidak"});
        }

        muatRekap();
        konteks.getLayanan().perbaruiStatusBerjalan(konteks.hariIni());
    }
}
