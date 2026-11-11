package sipinjam.tampilan;

import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.awt.Font;
import java.awt.GridLayout;
import java.time.LocalDate;
import java.util.List;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JComboBox;
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
import sipinjam.model.BookingRuangan;
import sipinjam.model.JadwalRuangan;
import sipinjam.model.Mahasiswa;
import sipinjam.model.Pengguna;
import sipinjam.model.Ruangan;
import sipinjam.model.SlotWaktu;
import sipinjam.model.StatusBooking;

/** Panel booking ruangan berbasis slot jam. */
public class PanelBooking extends JPanel {
    private final KonteksAplikasi konteks;
    private final Mahasiswa pemohon;

    private final JComboBox<String> pilihanRuangan = new JComboBox<String>();
    private final JTextField tanggal = KomponenUI.field(10);
    private final DefaultTableModel modelSlot = KomponenUI.model("Jam", "Status", "Keterangan");
    private final JTable tabelSlot = KomponenUI.tabel(modelSlot);
    private final JComboBox<Integer> jamMulai = new JComboBox<Integer>();
    private final JComboBox<Integer> jamSelesai = new JComboBox<Integer>();
    private final JSpinner peserta = new JSpinner(new SpinnerNumberModel(1, 1, 500, 1));
    private final JTextField keperluan = KomponenUI.field(20);
    private final DefaultTableModel modelBooking = KomponenUI.model(
            "Id", "Ruangan", "Tanggal", "Slot", "Status", "Denda");
    private final JTable tabelBooking = KomponenUI.tabel(modelBooking);
    private final JLabel status = new JLabel(" ");

    public PanelBooking(KonteksAplikasi konteks, Pengguna pengguna) {
        this.konteks = konteks;
        this.pemohon = (Mahasiswa) pengguna;
        setLayout(new BorderLayout(8, 8));
        setBorder(BorderFactory.createEmptyBorder(8, 8, 8, 8));
        bangun();
        muatRuangan();
        muatJadwal();
        muatBookingSaya();
    }

    private void bangun() {
        for (Ruangan ruangan : konteks.getRepoBarang().daftarRuangan()) {
            pilihanRuangan.addItem(ruangan.getKode() + " - " + ruangan.getNama()
                    + " (kapasitas " + ruangan.getKapasitas() + ")");
        }
        tanggal.setText(KomponenUI.tanggal(konteks.hariIni().plusDays(3)));
        for (int jam = 7; jam <= 20; jam++) {
            jamMulai.addItem(jam);
        }
        for (int jam = 8; jam <= 21; jam++) {
            jamSelesai.addItem(jam);
        }
        jamMulai.setSelectedItem(9);
        jamSelesai.setSelectedItem(11);

        JPanel atas = new JPanel(new FlowLayout(FlowLayout.LEFT, 8, 4));
        atas.add(KomponenUI.label("Ruangan"));
        atas.add(pilihanRuangan);
        atas.add(KomponenUI.label("Tanggal"));
        atas.add(tanggal);
        JButton lihat = new JButton("Tampilkan jadwal");
        lihat.addActionListener(e -> muatJadwal());
        atas.add(lihat);
        add(atas, BorderLayout.NORTH);

        JPanel kiri = new JPanel(new BorderLayout(4, 4));
        kiri.add(KomponenUI.judul("Jadwal slot 07.00 - 21.00"), BorderLayout.NORTH);
        kiri.add(KomponenUI.gulung(tabelSlot), BorderLayout.CENTER);

        JPanel form = new JPanel(new GridLayout(0, 2, 6, 6));
        form.setBorder(BorderFactory.createTitledBorder("Ajukan booking"));
        form.add(KomponenUI.label("Jam mulai"));
        form.add(jamMulai);
        form.add(KomponenUI.label("Jam selesai"));
        form.add(jamSelesai);
        form.add(KomponenUI.label("Jumlah peserta"));
        form.add(peserta);
        form.add(KomponenUI.label("Keperluan"));
        form.add(keperluan);
        JButton ajukan = new JButton("Ajukan booking");
        ajukan.setFont(new Font("SansSerif", Font.BOLD, 13));
        ajukan.addActionListener(e -> ajukan());
        form.add(new JLabel());
        form.add(ajukan);
        JPanel kanan = new JPanel(new BorderLayout(4, 4));
        kanan.add(form, BorderLayout.NORTH);
        kanan.add(KomponenUI.judul("Booking saya"), BorderLayout.CENTER);
        kanan.add(KomponenUI.gulung(tabelBooking), BorderLayout.SOUTH);
        kanan.setPreferredSize(new java.awt.Dimension(430, 400));

        JSplitPane pisah = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT, kiri, kanan);
        pisah.setResizeWeight(0.5);
        add(pisah, BorderLayout.CENTER);

        JPanel bawah = new JPanel(new FlowLayout(FlowLayout.LEFT, 8, 4));
        JButton batal = new JButton("Batalkan booking terpilih");
        batal.addActionListener(e -> batalkan());
        bawah.add(batal);
        status.setForeground(KomponenUI.BIRU);
        bawah.add(status);
        add(bawah, BorderLayout.SOUTH);
    }

    private void muatRuangan() {
        pilihanRuangan.addActionListener(e -> {
            Ruangan ruangan = ruanganTerpilih();
            if (ruangan != null) {
                peserta.setModel(new SpinnerNumberModel(1, 1,
                        Math.max(1, ruangan.getKapasitas()), 1));
            }
        });
    }

    private Ruangan ruanganTerpilih() {
        Object item = pilihanRuangan.getSelectedItem();
        if (item == null) {
            return null;
        }
        String kode = item.toString().split(" - ")[0].trim();
        return konteks.getRepoBarang().cariRuangan(kode);
    }

    private void muatJadwal() {
        Ruangan ruangan = ruanganTerpilih();
        if (ruangan == null) {
            return;
        }
        try {
            LocalDate hari = KomponenUI.keTanggal(tanggal.getText());
            JadwalRuangan jadwal = konteks.getLayananBooking().jadwal(ruangan, hari);
            modelSlot.setRowCount(0);
            for (SlotWaktu slot : konteks.getLayananBooking().templateSlot()) {
                String statusSlot = "Kosong";
                String keterangan = "-";
                for (BookingRuangan booking : jadwal.getDaftar()) {
                    if (booking.getSlot().bertumpangTindih(slot)
                            && booking.getStatus().mengunciSlot()) {
                        statusSlot = booking.getStatus().getLabel();
                        keterangan = booking.getPemohon().getNama() + " - " + booking.getKeperluan();
                        break;
                    }
                }
                modelSlot.addRow(new Object[]{slot.toString(), statusSlot, keterangan});
            }
            int kosong = konteks.getLayananBooking().slotKosong(ruangan, hari).size();
            status.setText("Slot kosong " + kosong + " dari 14 pada " + ruangan.getNama()
                    + ", " + KomponenUI.tanggal(hari));
        } catch (IllegalArgumentException e) {
            KomponenUI.galat(this, e.getMessage());
        }
    }

    private void muatBookingSaya() {
        modelBooking.setRowCount(0);
        for (BookingRuangan booking : konteks.getRepoBooking().daftarUntuk(pemohon)) {
            modelBooking.addRow(new Object[]{booking.getId(), booking.getRuangan().getNama(),
                KomponenUI.tanggal(booking.getTanggal()), booking.getSlot().toString(),
                booking.getStatus().getLabel(),
                KomponenUI.rupiah(booking.getDendaPembatalan())
                        + (booking.isDendaLunas() ? " (lunas)" : "")});
        }
    }

    private void ajukan() {
        Ruangan ruangan = ruanganTerpilih();
        if (ruangan == null) {
            KomponenUI.galat(this, "Ruangan belum dipilih");
            return;
        }
        try {
            LocalDate hari = KomponenUI.keTanggal(tanggal.getText());
            int mulaiJam = (Integer) jamMulai.getSelectedItem();
            int selesaiJam = (Integer) jamSelesai.getSelectedItem();
            SlotWaktu slot = new SlotWaktu(mulaiJam, selesaiJam);
            BookingRuangan booking = konteks.getLayanan().ajukanBooking(pemohon, ruangan, hari,
                    slot, (Integer) peserta.getValue(), keperluan.getText().trim(), konteks.hariIni());
            keperluan.setText("");
            muatJadwal();
            muatBookingSaya();
            KomponenUI.info(this, "Booking " + booking.getId() + " diajukan untuk "
                    + ruangan.getNama() + " " + KomponenUI.tanggal(hari) + " " + slot
                    + ". Menunggu verifikasi petugas.");
        } catch (AturanDilanggarException e) {
            KomponenUI.galat(this, e.getMessage());
        } catch (IllegalArgumentException e) {
            KomponenUI.galat(this, e.getMessage());
        }
    }

    public void batalkan() {
        Object id = KomponenUI.terpilih(tabelBooking);
        if (id == null) {
            KomponenUI.galat(this, "Pilih booking yang ingin dibatalkan");
            return;
        }
        for (BookingRuangan booking : konteks.getRepoBooking().daftarUntuk(pemohon)) {
            if (booking.getId().equals(String.valueOf(id))) {
                if (!KomponenUI.konfirmasi(this, "Batalkan booking " + booking.getId() + "?")) {
                    return;
                }
                try {
                    double denda = konteks.getLayanan().batalkanBooking(booking, konteks.hariIni());
                    muatJadwal();
                    muatBookingSaya();
                    KomponenUI.info(this, denda > 0
                            ? "Booking dibatalkan. Denda pembatalan " + KomponenUI.rupiah(denda)
                              + " dicatat sebagai tunggakan."
                            : "Booking dibatalkan tanpa denda.");
                } catch (sipinjam.exception.AksesDitolakException e) {
                    KomponenUI.galat(this, e.getMessage());
                }
                return;
            }
        }
    }
}
