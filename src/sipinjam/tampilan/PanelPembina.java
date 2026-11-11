package sipinjam.tampilan;

import java.awt.BorderLayout;
import java.awt.FlowLayout;
import java.util.List;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.JTable;
import javax.swing.table.DefaultTableModel;

import sipinjam.KonteksAplikasi;
import sipinjam.exception.AksesDitolakException;
import sipinjam.model.DetailPeminjaman;
import sipinjam.model.DosenPembina;
import sipinjam.model.Peminjaman;
import sipinjam.model.Pengguna;

/** Panel dosen pembina: antrean persetujuan pengajuan tertentu. */
public class PanelPembina extends JPanel {
    private final KonteksAplikasi konteks;
    private final DosenPembina pembina;
    private final DefaultTableModel model = KomponenUI.model(
            "Id", "Pemohon", "Barang", "Mulai", "Selesai", "Keperluan");
    private final JTable tabel = KomponenUI.tabel(model);
    private final JLabel ringkasan = new JLabel(" ");

    public PanelPembina(KonteksAplikasi konteks, Pengguna pengguna) {
        this.konteks = konteks;
        this.pembina = (DosenPembina) pengguna;
        setLayout(new BorderLayout(8, 8));
        setBorder(BorderFactory.createEmptyBorder(8, 8, 8, 8));
        bangun();
        muat();
    }

    private void bangun() {
        add(KomponenUI.judul("Pengajuan yang menunggu persetujuan pembina"), BorderLayout.NORTH);
        add(KomponenUI.gulung(tabel), BorderLayout.CENTER);

        JPanel bawah = new JPanel(new BorderLayout());
        JPanel tombol = new JPanel(new FlowLayout(FlowLayout.LEFT, 6, 4));
        JButton setuju = new JButton("Setujui");
        setuju.addActionListener(e -> putuskan(true));
        JButton tolak = new JButton("Tolak");
        tolak.addActionListener(e -> putuskan(false));
        JButton segarkan = new JButton("Segarkan");
        segarkan.addActionListener(e -> muat());
        tombol.add(setuju);
        tombol.add(tolak);
        tombol.add(segarkan);
        bawah.add(tombol, BorderLayout.NORTH);
        bawah.add(ringkasan, BorderLayout.SOUTH);
        add(bawah, BorderLayout.SOUTH);
    }

    public void muat() {
        model.setRowCount(0);
        List<Peminjaman> antrean = konteks.getLayanan().menungguPembina();
        for (Peminjaman peminjaman : antrean) {
            StringBuilder barang = new StringBuilder();
            for (DetailPeminjaman detail : peminjaman.getDetail()) {
                if (barang.length() > 0) {
                    barang.append(", ");
                }
                barang.append(detail.getBarang().getNama()).append(" x").append(detail.getJumlah());
            }
            model.addRow(new Object[]{peminjaman.getId(), peminjaman.getPemohon().getNama(),
                barang.toString(), KomponenUI.tanggal(peminjaman.getTanggalMulai()),
                KomponenUI.tanggal(peminjaman.getTanggalSelesai()), peminjaman.getKeperluan()});
        }
        ringkasan.setText("Menunggu persetujuan: " + antrean.size() + " pengajuan"
                + "   |   Total peminjaman tercatat: " + konteks.getRepoPeminjaman().semua().size());
    }

    private void putuskan(boolean setuju) {
        Object id = KomponenUI.terpilih(tabel);
        if (id == null) {
            KomponenUI.galat(this, "Pilih satu pengajuan terlebih dahulu");
            return;
        }
        for (Peminjaman peminjaman : konteks.getLayanan().menungguPembina()) {
            if (!peminjaman.getId().equals(String.valueOf(id))) {
                continue;
            }
            String catatan = "";
            if (!setuju) {
                catatan = KomponenUI.tanya(this, "Alasan penolakan " + peminjaman.getId());
                if (catatan == null) {
                    return;
                }
            }
            try {
                if (setuju) {
                    konteks.getLayanan().setujuiPembina(peminjaman, pembina);
                } else {
                    konteks.getLayanan().tolakPembina(peminjaman, pembina, catatan);
                }
                muat();
                KomponenUI.info(this, "Pengajuan " + peminjaman.getId() + " "
                        + (setuju ? "disetujui, menunggu verifikasi petugas" : "ditolak"));
            } catch (AksesDitolakException | IllegalStateException e) {
                KomponenUI.galat(this, e.getMessage());
            }
            return;
        }
    }
}
