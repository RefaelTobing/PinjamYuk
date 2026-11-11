package sipinjam.tampilan;

import java.awt.Color;
import java.awt.Component;
import java.awt.Font;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

import javax.swing.BorderFactory;
import javax.swing.JLabel;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JScrollPane;
import javax.swing.JTable;
import javax.swing.JTextField;
import javax.swing.UIManager;
import javax.swing.table.DefaultTableModel;

/** Kumpulan pembantu tampilan agar kode antarmuka tidak berulang. */
public final class KomponenUI {
    public static final DateTimeFormatter FORMAT_TANGGAL = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    public static final Color BIRU = new Color(31, 56, 100);
    public static final Color HIJAU = new Color(22, 101, 52);
    public static final Color MERAH = new Color(153, 27, 27);

    private KomponenUI() {
    }

    public static void pasangTema() {
        Font dasar = new Font("SansSerif", Font.PLAIN, 13);
        String[] kunci = {"Label.font", "Button.font", "TextField.font", "ComboBox.font",
                "Table.font", "TableHeader.font", "TabbedPane.font", "CheckBox.font",
                "Spinner.font", "RadioButton.font", "OptionPane.messageFont"};
        for (String k : kunci) {
            UIManager.put(k, dasar);
        }
        UIManager.put("Table.rowHeight", 24);
    }

    public static JLabel judul(String teks) {
        JLabel label = new JLabel(teks);
        label.setFont(new Font("SansSerif", Font.BOLD, 15));
        label.setForeground(BIRU);
        return label;
    }

    public static JLabel label(String teks) {
        JLabel label = new JLabel(teks);
        label.setFont(new Font("SansSerif", Font.PLAIN, 13));
        return label;
    }

    public static JPanel panel(String judul) {
        JPanel panel = new JPanel();
        panel.setBorder(BorderFactory.createTitledBorder(judul));
        return panel;
    }

    public static JTextField field(int kolom) {
        JTextField field = new JTextField(kolom);
        field.setFont(new Font("SansSerif", Font.PLAIN, 13));
        return field;
    }

    public static DefaultTableModel model(String... kolom) {
        return new DefaultTableModel(kolom, 0) {
            @Override
            public boolean isCellEditable(int baris, int kolomTabel) {
                return false;
            }
        };
    }

    public static JTable tabel(DefaultTableModel model) {
        JTable tabel = new JTable(model);
        tabel.setAutoCreateRowSorter(true);
        tabel.setFillsViewportHeight(true);
        return tabel;
    }

    public static JScrollPane gulung(Component isi) {
        JScrollPane pane = new JScrollPane(isi);
        pane.setBorder(BorderFactory.createLineBorder(new Color(200, 205, 215)));
        return pane;
    }

    public static String rupiah(double nilai) {
        return String.format("Rp%,.0f", nilai).replace(',', '.');
    }

    public static String tanggal(LocalDate nilai) {
        return nilai == null ? "-" : nilai.format(FORMAT_TANGGAL);
    }

    public static LocalDate keTanggal(String teks) {
        if (teks == null || teks.trim().isEmpty()) {
            throw new IllegalArgumentException("Tanggal wajib diisi dengan format dd-MM-yyyy");
        }
        try {
            return LocalDate.parse(teks.trim(), FORMAT_TANGGAL);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Format tanggal harus dd-MM-yyyy, contoh 20-11-2026");
        }
    }

    public static void info(Component induk, String pesan) {
        JOptionPane.showMessageDialog(induk, pesan, "Informasi", JOptionPane.INFORMATION_MESSAGE);
    }

    public static void galat(Component induk, String pesan) {
        JOptionPane.showMessageDialog(induk, pesan, "Gagal", JOptionPane.ERROR_MESSAGE);
    }

    public static String tanya(Component induk, String pesan) {
        return JOptionPane.showInputDialog(induk, pesan);
    }

    public static boolean konfirmasi(Component induk, String pesan) {
        return JOptionPane.showConfirmDialog(induk, pesan, "Konfirmasi",
                JOptionPane.YES_NO_OPTION) == JOptionPane.YES_OPTION;
    }

    public static Object terpilih(JTable tabel) {
        int baris = tabel.getSelectedRow();
        if (baris < 0) {
            return null;
        }
        return tabel.getValueAt(tabel.convertRowIndexToModel(baris), 0);
    }
}
