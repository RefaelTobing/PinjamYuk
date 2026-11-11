package sipinjam.tampilan;

import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.GridLayout;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JSpinner;
import javax.swing.JSplitPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.SpinnerNumberModel;
import javax.swing.table.DefaultTableModel;

import sipinjam.KonteksAplikasi;
import sipinjam.exception.AturanDilanggarException;
import sipinjam.model.Barang;
import sipinjam.model.DetailPeminjaman;
import sipinjam.model.KondisiBarang;
import sipinjam.model.Mahasiswa;
import sipinjam.model.Peminjaman;
import sipinjam.model.Pengguna;

/** Panel peminjaman barang: katalog, keranjang, dan pengajuan. */
public class PanelMahasiswa extends JPanel {
    private final KonteksAplikasi konteks;
    private final Mahasiswa pemohon;

    private final JTextField mulai = KomponenUI.field(10);
    private final JTextField selesai = KomponenUI.field(10);
    private final DefaultTableModel modelKatalog = KomponenUI.model(
            "Kode", "Nama", "Jenis", "Stok", "Sisa pada tanggal");
    private final JTable tabelKatalog = KomponenUI.tabel(modelKatalog);
    private final DefaultTableModel modelKeranjang = KomponenUI.model(
            "Kode", "Nama", "Jumlah", "Sisa");
    private final JTable tabelKeranjang = KomponenUI.tabel(modelKeranjang);
    private final JSpinner jumlah = new JSpinner(new SpinnerNumberModel(1, 1, 100, 1));
    private final JTextField keperluan = KomponenUI.field(22);
    private final JLabel status = new JLabel(" ");
    private final List<DetailPeminjaman> isiKeranjang = new ArrayList<DetailPeminjaman>();

    public PanelMahasiswa(KonteksAplikasi konteks, Pengguna pengguna) {
        this.konteks = konteks;
        this.pemohon = (Mahasiswa) pengguna;
        setLayout(new BorderLayout(8, 8));
        setBorder(BorderFactory.createEmptyBorder(8, 8, 8, 8));
        bangun();
        muatKatalog();
    }

    private void bangun() {
        LocalDate hariIni = konteks.hariIni();
        mulai.setText(KomponenUI.tanggal(hariIni.plusDays(1)));
        selesai.setText(KomponenUI.tanggal(hariIni.plusDays(3)));

        JPanel filter = new JPanel(new FlowLayout(FlowLayout.LEFT, 8, 4));
        filter.add(KomponenUI.label("Tanggal mulai"));
        filter.add(mulai);
        filter.add(KomponenUI.label("Tanggal selesai"));
        filter.add(selesai);
        JButton muat = new JButton("Tampilkan ketersediaan");
        muat.addActionListener(e -> muatKatalog());
        filter.add(muat);
        add(filter, BorderLayout.NORTH);

        JPanel kiri = new JPanel(new BorderLayout(4, 4));
        kiri.add(KomponenUI.judul("Katalog barang"), BorderLayout.NORTH);
        kiri.add(KomponenUI.gulung(tabelKatalog), BorderLayout.CENTER);

        JPanel kanan = new JPanel(new BorderLayout(4, 8));
        JPanel atasKanan = new JPanel(new BorderLayout(4, 4));
        atasKanan.add(KomponenUI.judul("Keranjang pengajuan"), BorderLayout.NORTH);
        atasKanan.add(KomponenUI.gulung(tabelKeranjang), BorderLayout.CENTER);
        kanan.add(atasKanan, BorderLayout.CENTER);

        JPanel form = new JPanel(new GridLayout(0, 2, 6, 6));
        form.setBorder(BorderFactory.createTitledBorder("Tambah barang"));
        form.add(KomponenUI.label("Jumlah unit"));
        form.add(jumlah);
        JButton tambah = new JButton("Tambah ke keranjang");
        tambah.addActionListener(e -> tambahKeranjang());
        form.add(new JLabel());
        form.add(tambah);
        form.add(KomponenUI.label("Keperluan kegiatan"));
        form.add(keperluan);
        JButton hapus = new JButton("Hapus baris terpilih");
        hapus.addActionListener(e -> hapusBaris());
        form.add(new JLabel());
        form.add(hapus);
        kanan.add(form, BorderLayout.SOUTH);

        JSplitPane pisah = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT, kiri, kanan);
        pisah.setResizeWeight(0.55);
        add(pisah, BorderLayout.CENTER);

        JPanel bawah = new JPanel(new FlowLayout(FlowLayout.LEFT, 8, 4));
        JButton ajukan = new JButton("Ajukan peminjaman");
        ajukan.setFont(new Font("SansSerif", Font.BOLD, 13));
        ajukan.addActionListener(e -> ajukan());
        bawah.add(ajukan);
        status.setForeground(KomponenUI.BIRU);
        bawah.add(status);
        add(bawah, BorderLayout.SOUTH);
    }

    private void muatKatalog() {
        try {
            LocalDate tanggalMulai = KomponenUI.keTanggal(mulai.getText());
            LocalDate tanggalSelesai = KomponenUI.keTanggal(selesai.getText());
            if (tanggalSelesai.isBefore(tanggalMulai)) {
                KomponenUI.galat(this, "Tanggal selesai tidak boleh sebelum tanggal mulai");
                return;
            }
            modelKatalog.setRowCount(0);
            for (Barang barang : konteks.getRepoBarang().daftarBarang()) {
                int sisa = konteks.getKetersediaan().sisaStok(barang, tanggalMulai, tanggalSelesai);
                modelKatalog.addRow(new Object[]{barang.getKode(), barang.getNama(),
                    barang.getJenisBarang(), barang.getStok(), sisa});
            }
            status.setText("Ketersediaan dihitung untuk " + KomponenUI.tanggal(tanggalMulai)
                    + " sampai " + KomponenUI.tanggal(tanggalSelesai));
        } catch (IllegalArgumentException e) {
            KomponenUI.galat(this, e.getMessage());
        }
    }

    private void tambahKeranjang() {
        try {
            Object kode = KomponenUI.terpilih(tabelKatalog);
            if (kode == null) {
                KomponenUI.galat(this, "Pilih satu barang pada katalog terlebih dahulu");
                return;
            }
            Barang barang = konteks.getRepoBarang().cari(String.valueOf(kode));
            int diminta = (Integer) jumlah.getValue();
            LocalDate tanggalMulai = KomponenUI.keTanggal(mulai.getText());
            LocalDate tanggalSelesai = KomponenUI.keTanggal(selesai.getText());

            int sudahDiKeranjang = 0;
            for (DetailPeminjaman baris : isiKeranjang) {
                if (baris.getBarang().getKode().equals(barang.getKode())) {
                    sudahDiKeranjang += baris.getJumlah();
                }
            }
            int sisa = konteks.getKetersediaan().sisaStok(barang, tanggalMulai, tanggalSelesai);
            if (diminta + sudahDiKeranjang > sisa) {
                KomponenUI.galat(this, "Sisa stok " + barang.getNama() + " hanya " + sisa + " unit");
                return;
            }
            isiKeranjang.add(new DetailPeminjaman(barang, diminta, KondisiBarang.BAIK));
            segarkanKeranjang();
        } catch (IllegalArgumentException e) {
            KomponenUI.galat(this, e.getMessage());
        }
    }

    private void hapusBaris() {
        int baris = tabelKeranjang.getSelectedRow();
        if (baris < 0) {
            KomponenUI.galat(this, "Pilih baris keranjang yang ingin dihapus");
            return;
        }
        isiKeranjang.remove(tabelKeranjang.convertRowIndexToModel(baris));
        segarkanKeranjang();
    }

    private void segarkanKeranjang() {
        modelKeranjang.setRowCount(0);
        for (DetailPeminjaman baris : isiKeranjang) {
            modelKeranjang.addRow(new Object[]{baris.getBarang().getKode(),
                baris.getBarang().getNama(), baris.getJumlah(), baris.getBarang().getStok()});
        }
    }

    private void ajukan() {
        if (isiKeranjang.isEmpty()) {
            KomponenUI.galat(this, "Keranjang masih kosong");
            return;
        }
        if (keperluan.getText().trim().isEmpty()) {
            KomponenUI.galat(this, "Keperluan kegiatan wajib diisi");
            return;
        }
        try {
            LocalDate tanggalMulai = KomponenUI.keTanggal(mulai.getText());
            LocalDate tanggalSelesai = KomponenUI.keTanggal(selesai.getText());
            Peminjaman peminjaman = konteks.getLayanan().ajukanBarang(pemohon,
                    new ArrayList<DetailPeminjaman>(isiKeranjang), tanggalMulai, tanggalSelesai,
                    keperluan.getText().trim(), konteks.hariIni());
            isiKeranjang.clear();
            segarkanKeranjang();
            keperluan.setText("");
            muatKatalog();
            String lanjut = peminjaman.butuhPersetujuanPembina()
                    ? "Menunggu persetujuan dosen pembina." : "Menunggu verifikasi petugas.";
            KomponenUI.info(this, "Pengajuan " + peminjaman.getId() + " dibuat. " + lanjut);
        } catch (AturanDilanggarException e) {
            KomponenUI.galat(this, e.getMessage());
        } catch (IllegalArgumentException e) {
            KomponenUI.galat(this, e.getMessage());
        }
    }
}
