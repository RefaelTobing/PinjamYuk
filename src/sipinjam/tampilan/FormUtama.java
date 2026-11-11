package sipinjam.tampilan;

import java.awt.BorderLayout;
import java.awt.Font;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

import javax.swing.BorderFactory;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JMenu;
import javax.swing.JMenuBar;
import javax.swing.JMenuItem;
import javax.swing.JPanel;
import javax.swing.JTabbedPane;

import sipinjam.KonteksAplikasi;
import sipinjam.model.Peran;
import sipinjam.model.Pengguna;

/** Jendela utama: memilih panel sesuai peran pengguna. */
public class FormUtama extends JFrame {
    private final KonteksAplikasi konteks;
    private final Pengguna pengguna;

    public FormUtama(KonteksAplikasi konteks, Pengguna pengguna) {
        super("SIPINJAM - " + pengguna.tampilkanProfil());
        this.konteks = konteks;
        this.pengguna = pengguna;
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1180, 740);
        setMinimumSize(new java.awt.Dimension(980, 640));
        setLocationRelativeTo(null);
        bangun();
    }

    private void bangun() {
        JPanel akar = new JPanel(new BorderLayout());

        JLabel kepala = new JLabel("  " + pengguna.tampilkanProfil());
        kepala.setFont(new Font("SansSerif", Font.BOLD, 14));
        kepala.setForeground(KomponenUI.BIRU);
        kepala.setBorder(BorderFactory.createEmptyBorder(8, 8, 8, 8));
        akar.add(kepala, BorderLayout.NORTH);

        JTabbedPane tab = new JTabbedPane();
        if (pengguna.getPeran() == Peran.MAHASISWA) {
            tab.addTab("Peminjaman Barang", new PanelMahasiswa(konteks, pengguna));
            tab.addTab("Booking Ruangan", new PanelBooking(konteks, pengguna));
            tab.addTab("Riwayat Saya", new PanelRiwayat(konteks, pengguna));
        } else if (pengguna.getPeran() == Peran.PETUGAS) {
            tab.addTab("Pengelolaan", new PanelPetugas(konteks));
        } else {
            tab.addTab("Persetujuan", new PanelPembina(konteks, pengguna));
        }
        akar.add(tab, BorderLayout.CENTER);

        JMenuBar menu = new JMenuBar();
        JMenu berkas = new JMenu("Berkas");
        JMenuItem simpan = new JMenuItem("Simpan data sekarang");
        simpan.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                konteks.getPenyimpanan().simpan();
                KomponenUI.info(FormUtama.this, "Data disimpan pada folder "
                        + konteks.getPenyimpanan().getFolder().toAbsolutePath());
            }
        });
        JMenuItem keluar = new JMenuItem("Keluar ke halaman masuk");
        keluar.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                dispose();
                new FormLogin(konteks).setVisible(true);
            }
        });
        berkas.add(simpan);
        berkas.addSeparator();
        berkas.add(keluar);
        menu.add(berkas);
        setJMenuBar(menu);

        setContentPane(akar);
    }
}
