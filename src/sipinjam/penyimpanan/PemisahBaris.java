package sipinjam.penyimpanan;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import sipinjam.exception.FormatBerkasException;

/** Pembacaan dan penulisan baris berpemisah pipa. */
public final class PemisahBaris {
    public static final String PEMISAH = "|";
    private static final DateTimeFormatter TANGGAL = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private PemisahBaris() {
    }

    public static String gabung(String... kolom) {
        StringBuilder hasil = new StringBuilder();
        for (int i = 0; i < kolom.length; i++) {
            if (i > 0) {
                hasil.append(PEMISAH);
            }
            hasil.append(bersihkan(kolom[i]));
        }
        return hasil.toString();
    }

    public static String[] pecah(String baris, int jumlahKolom) throws FormatBerkasException {
        String[] bagian = baris.split("\\" + PEMISAH, -1);
        if (bagian.length < jumlahKolom) {
            throw new FormatBerkasException(0, "Jumlah kolom " + bagian.length
                    + ", seharusnya " + jumlahKolom);
        }
        return bagian;
    }

    /** Pemisah dan baris baru diganti spasi agar format berkas tidak rusak. */
    public static String bersihkan(String teks) {
        if (teks == null) {
            return "";
        }
        return teks.replace(PEMISAH, "/").replace("\n", " ").replace("\r", " ").trim();
    }

    public static String tanggal(LocalDate nilai) {
        return nilai == null ? "" : nilai.format(TANGGAL);
    }

    public static LocalDate keTanggal(String nilai) throws FormatBerkasException {
        if (nilai == null || nilai.trim().isEmpty()) {
            return null;
        }
        try {
            return LocalDate.parse(nilai.trim(), TANGGAL);
        } catch (RuntimeException e) {
            throw new FormatBerkasException(0, "Tanggal tidak valid: " + nilai);
        }
    }

    public static int keInt(String nilai, int bawaan) {
        try {
            return Integer.parseInt(nilai.trim());
        } catch (RuntimeException e) {
            return bawaan;
        }
    }

    public static double keDouble(String nilai, double bawaan) {
        try {
            return Double.parseDouble(nilai.trim());
        } catch (RuntimeException e) {
            return bawaan;
        }
    }

    public static boolean keBoolean(String nilai) {
        return "true".equalsIgnoreCase(nilai == null ? "" : nilai.trim())
                || "1".equals(nilai == null ? "" : nilai.trim());
    }
}
