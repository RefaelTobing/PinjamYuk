package sipinjam.tampilan;

import java.awt.BorderLayout;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.Insets;

import javax.swing.BorderFactory;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JPasswordField;
import javax.swing.JTextField;

import sipinjam.KonteksAplikasi;
import sipinjam.model.Mahasiswa;
import sipinjam.model.Pengguna;

/** Form masuk dan pendaftaran akun mahasiswa. */
public class FormLogin extends JFrame {
    private final KonteksAplikasi konteks;
    private final JTextField username = KomponenUI.field(20);
    private final JPasswordField password = new JPasswordField(20);

    public FormLogin(KonteksAplikasi konteks) {
        super("SIPINJAM - Masuk");
        this.konteks = konteks;
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setMinimumSize(new Dimension(460, 360));
        setLocationRelativeTo(null);
        bangun();
        pack();
    }

    private void bangun() {
        JPanel akar = new JPanel(new BorderLayout(0, 12));
        akar.setBorder(BorderFactory.createEmptyBorder(20, 24, 20, 24));
        akar.setBackground(new java.awt.Color(245, 247, 250));

        JLabel judul = new JLabel("SIPINJAM");
        judul.setFont(new Font("SansSerif", Font.BOLD, 26));
        judul.setForeground(KomponenUI.BIRU);
        JLabel sub = new JLabel("Sistem Peminjaman Inventaris, Sarana Prasarana, dan Ruangan Kampus");
        sub.setFont(new Font("SansSerif", Font.PLAIN, 12));
        JPanel kepala = new JPanel(new BorderLayout());
        kepala.setOpaque(false);
        kepala.add(judul, BorderLayout.NORTH);
        kepala.add(sub, BorderLayout.SOUTH);
        akar.add(kepala, BorderLayout.NORTH);

        JPanel form = new JPanel(new GridBagLayout());
        form.setOpaque(false);
        GridBagConstraints g = new GridBagConstraints();
        g.insets = new Insets(6, 6, 6, 6);
        g.anchor = GridBagConstraints.WEST;
        g.gridx = 0;
        g.gridy = 0;
        form.add(KomponenUI.label("Username"), g);
        g.gridx = 1;
        form.add(username, g);
        g.gridx = 0;
        g.gridy = 1;
        form.add(KomponenUI.label("Kata sandi"), g);
        g.gridx = 1;
        form.add(password, g);
        akar.add(form, BorderLayout.CENTER);

        JButton masuk = new JButton("Masuk");
        masuk.setFont(new Font("SansSerif", Font.BOLD, 13));
        JButton daftar = new JButton("Daftar sebagai Mahasiswa");
        JPanel tombol = new JPanel();
        tombol.setOpaque(false);
        tombol.add(masuk);
        tombol.add(daftar);
        akar.add(tombol, BorderLayout.SOUTH);

        masuk.addActionListener(e -> masuk());
        daftar.addActionListener(e -> daftar());
        password.addActionListener(e -> masuk());

        setContentPane(akar);
        getRootPane().setDefaultButton(masuk);
    }

    private void masuk() {
        Pengguna pengguna = konteks.getRepoPengguna().login(username.getText().trim(),
                new String(password.getPassword()));
        if (pengguna == null) {
            KomponenUI.galat(this, "Username atau kata sandi salah. Akun contoh: petugas/petugas123, "
                    + "pembina/pembina123, mahasiswa/mahasiswa123.");
            return;
        }
        konteks.getLayanan().perbaruiStatusBerjalan(konteks.hariIni());
        new FormUtama(konteks, pengguna).setVisible(true);
        dispose();
    }

    private void daftar() {
        JTextField nama = KomponenUI.field(18);
        JTextField user = KomponenUI.field(18);
        JTextField sandi = KomponenUI.field(18);
        JTextField nim = KomponenUI.field(18);
        JTextField prodi = KomponenUI.field(18);
        prodi.setText("D3 Teknik Informatika");
        JTextField telepon = KomponenUI.field(18);

        JPanel panel = new JPanel(new java.awt.GridLayout(0, 2, 8, 6));
        panel.add(KomponenUI.label("Nama lengkap"));
        panel.add(nama);
        panel.add(KomponenUI.label("Username"));
        panel.add(user);
        panel.add(KomponenUI.label("Kata sandi (min. 6)"));
        panel.add(sandi);
        panel.add(KomponenUI.label("NIM"));
        panel.add(nim);
        panel.add(KomponenUI.label("Program studi"));
        panel.add(prodi);
        panel.add(KomponenUI.label("Nomor telepon"));
        panel.add(telepon);

        int jawab = JOptionPane.showConfirmDialog(this, panel, "Pendaftaran Mahasiswa",
                JOptionPane.OK_CANCEL_OPTION, JOptionPane.PLAIN_MESSAGE);
        if (jawab != JOptionPane.OK_OPTION) {
            return;
        }
        try {
            String namaTeks = nama.getText().trim();
            String userTeks = user.getText().trim();
            String sandiTeks = sandi.getText().trim();
            if (namaTeks.isEmpty() || userTeks.isEmpty()) {
                KomponenUI.galat(this, "Nama dan username wajib diisi");
                return;
            }
            if (sandiTeks.length() < 6) {
                KomponenUI.galat(this, "Kata sandi minimal 6 karakter");
                return;
            }
            if (nim.getText().trim().isEmpty()) {
                KomponenUI.galat(this, "NIM wajib diisi");
                return;
            }
            if (konteks.getRepoPengguna().cariUsername(userTeks) != null) {
                KomponenUI.galat(this, "Username " + userTeks + " sudah dipakai");
                return;
            }
            Mahasiswa mahasiswa = new Mahasiswa(konteks.getRepoPengguna().idBerikutnya(), namaTeks,
                    userTeks, sandiTeks, nim.getText().trim(), prodi.getText().trim(),
                    telepon.getText().trim(), true);
            konteks.getRepoPengguna().tambah(mahasiswa);
            konteks.getPenyimpanan().simpan();
            KomponenUI.info(this, "Akun " + userTeks + " berhasil dibuat. Silakan masuk.");
            username.setText(userTeks);
            password.setText("");
        } catch (IllegalArgumentException e) {
            KomponenUI.galat(this, e.getMessage());
        }
    }
}
