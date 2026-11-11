package sipinjam.layanan;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import sipinjam.model.DetailPeminjaman;
import sipinjam.model.KondisiBarang;
import sipinjam.model.Peminjaman;
import sipinjam.model.RincianDenda;

/** Perhitungan denda keterlambatan, kondisi barang, dan pembatalan ruangan. */
public class KalkulatorDenda {
    public static final double DENDA_PEMBATALAN = 50000.0;

    public RincianDenda hitung(Peminjaman peminjaman, LocalDate tanggalKembali) {
        long hari = peminjaman.hariTerlambat(tanggalKembali);
        double dendaTerlambat = 0.0;
        double dendaKondisi = 0.0;
        StringBuilder catatan = new StringBuilder();

        for (DetailPeminjaman baris : peminjaman.getDetail()) {
            double tarif = baris.getBarang().tarifHarian() * hari * baris.getJumlah();
            KondisiBarang akhir = baris.getKondisiAkhir() == null
                    ? KondisiBarang.BAIK : baris.getKondisiAkhir();
            double kondisi = baris.getBarang().biayaKondisi(akhir) * baris.getJumlah();
            baris.setSubtotalDenda(tarif + kondisi);
            dendaTerlambat += tarif;
            dendaKondisi += kondisi;
            if (kondisi > 0) {
                catatan.append(baris.getBarang().getNama()).append(": ").append(akhir.getLabel())
                        .append("; ");
            }
        }

        RincianDenda rincian = new RincianDenda(hari, dendaTerlambat, dendaKondisi);
        rincian.setKeterangan(catatan.length() == 0
                ? (hari > 0 ? "Terlambat " + hari + " hari" : "Tanpa denda")
                : catatan.toString());
        return rincian;
    }

    /** Denda pembatalan hanya berlaku bila dibatalkan kurang dari satu hari sebelum pemakaian. */
    public double dendaPembatalan(LocalDate tanggalPakai, LocalDate hariIni) {
        long selisih = ChronoUnit.DAYS.between(hariIni, tanggalPakai);
        return selisih < 1 ? DENDA_PEMBATALAN : 0.0;
    }
}
