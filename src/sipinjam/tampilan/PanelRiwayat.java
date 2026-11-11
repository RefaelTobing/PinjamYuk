package sipinjam.tampilan;

import java.awt.BorderLayout;
import java.awt.FlowLayout;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JPanel;
import javax.swing.JSplitPane;
import javax.swing.JTable;
import javax.swing.table.DefaultTableModel;

import sipinjam.KonteksAplikasi;
import sipinjam.exception.AksesDitolakException;
import sipinjam.model.BookingRuangan;
import sipinjam.model.DetailPeminjaman;
import sipinjam.model.Mahasiswa;
import sipinjam.model.Peminjaman;
import sipinjam.model.Pengguna;

/** Riwayat pengajuan milik mahasiswa beserta pembatalannya. */
public class PanelRiwayat extends JPanel {
    private final KonteksAplikasi konteks;
    private final Mahasiswa pemohon;
    private final DefaultTableModel modelPeminjaman = KomponenUI.model(
            "Id", "Barang", "Mulai", "Selesai", "Status", "Denda");
    private final JTable tabelPeminjaman = KomponenUI.tabel(modelPeminjaman);
    private final DefaultTableModel modelBooking = KomponenUI.model(
            "Id", "Ruangan", "Tanggal", "Slot", "Status", "Denda");
    private final JTable tabelBooking = KomponenUI.tabel(modelBooking);

    public PanelRiwayat(KonteksAplikasi konteks, Pengguna pengguna) {
        this.konteks = konteks;
        this.pemohon = (Mahasiswa) pengguna;
        setLayout(new BorderLayout(8, 8));
        setBorder(BorderFactory.createEmptyBorder(8, 8, 8, 8));
        bangun();
        muat();
    }

    private void bangun() {
        JPanel atas = new JPanel(new BorderLayout(4, 4));
        atas.add(KomponenUI.judul("Riwayat peminjaman barang"), BorderLayout.NORTH);
        atas.add(KomponenUI.gulung(tabelPeminjaman), BorderLayout.CENTER);
        JPanel bawah = new JPanel(new BorderLayout(4, 4));
        bawah.add(KomponenUI.judul("Riwayat booking ruangan"), BorderLayout.NORTH);
        bawah.add(KomponenUI.gulung(tabelBooking), BorderLayout.CENTER);
        JSplitPane pisah = new JSplitPane(JSplitPane.VERTICAL_SPLIT, atas, bawah);
        pisah.setResizeWeight(0.5);
        add(pisah, BorderLayout.CENTER);

        JPanel tombol = new JPanel(new FlowLayout(FlowLayout.LEFT, 8, 4));
        JButton batalPinjam = new JButton("Batalkan peminjaman");
        batalPinjam.addActionListener(e -> batalkanPeminjaman());
        JButton batalBooking = new JButton("Batalkan booking");
        batalBooking.addActionListener(e -> batalkanBooking());
        JButton segarkan = new JButton("Segarkan");
        segarkan.addActionListener(e -> muat());
        tombol.add(batalPinjam);
        tombol.add(batalBooking);
        tombol.add(segarkan);
        add(tombol, BorderLayout.SOUTH);
    }

    public void muat() {
        modelPeminjaman.setRowCount(0);
        for (Peminjaman peminjaman : konteks.getRepoPeminjaman().daftarUntuk(pemohon)) {
            StringBuilder barang = new StringBuilder();
            for (DetailPeminjaman detail : peminjaman.getDetail()) {
                if (barang.length() > 0) {
                    barang.append(", ");
                }
                barang.append(detail.getBarang().getNama()).append(" x").append(detail.getJumlah());
            }
            String denda = peminjaman.getPengembalian() == null ? "-"
                    : KomponenUI.rupiah(peminjaman.getPengembalian().getTotalDenda())
                      + (peminjaman.getPengembalian().isLunas() ? " (lunas)" : " (belum lunas)");
            modelPeminjaman.addRow(new Object[]{peminjaman.getId(), barang.toString(),
                KomponenUI.tanggal(peminjaman.getTanggalMulai()),
                KomponenUI.tanggal(peminjaman.getTanggalSelesai()),
                peminjaman.getStatus().getLabel(), denda});
        }

        modelBooking.setRowCount(0);
        for (BookingRuangan booking : konteks.getRepoBooking().daftarUntuk(pemohon)) {
            String denda = booking.getDendaPembatalan() <= 0 ? "-"
                    : KomponenUI.rupiah(booking.getDendaPembatalan())
                      + (booking.isDendaLunas() ? " (lunas)" : " (belum lunas)");
            modelBooking.addRow(new Object[]{booking.getId(), booking.getRuangan().getNama(),
                KomponenUI.tanggal(booking.getTanggal()), booking.getSlot().toString(),
                booking.getStatus().getLabel(), denda});
        }
    }

    private void batalkanPeminjaman() {
        Object id = KomponenUI.terpilih(tabelPeminjaman);
        if (id == null) {
            KomponenUI.galat(this, "Pilih baris peminjaman terlebih dahulu");
            return;
        }
        for (Peminjaman peminjaman : konteks.getRepoPeminjaman().daftarUntuk(pemohon)) {
            if (peminjaman.getId().equals(String.valueOf(id))) {
                try {
                    konteks.getLayanan().batalkanPeminjaman(peminjaman);
                    muat();
                    KomponenUI.info(this, "Peminjaman " + peminjaman.getId() + " dibatalkan");
                } catch (AksesDitolakException e) {
                    KomponenUI.galat(this, e.getMessage());
                }
                return;
            }
        }
    }

    private void batalkanBooking() {
        Object id = KomponenUI.terpilih(tabelBooking);
        if (id == null) {
            KomponenUI.galat(this, "Pilih baris booking terlebih dahulu");
            return;
        }
        for (BookingRuangan booking : konteks.getRepoBooking().daftarUntuk(pemohon)) {
            if (booking.getId().equals(String.valueOf(id))) {
                try {
                    double denda = konteks.getLayanan().batalkanBooking(booking, konteks.hariIni());
                    muat();
                    KomponenUI.info(this, denda > 0
                            ? "Booking dibatalkan dengan denda " + KomponenUI.rupiah(denda)
                            : "Booking dibatalkan tanpa denda");
                } catch (AksesDitolakException e) {
                    KomponenUI.galat(this, e.getMessage());
                }
                return;
            }
        }
    }
}
