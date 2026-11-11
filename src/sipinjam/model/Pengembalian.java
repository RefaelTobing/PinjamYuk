package sipinjam.model;

import java.time.LocalDate;

/** Catatan pengembalian barang beserta denda yang timbul. */
public class Pengembalian {
    private final LocalDate tanggalKembali;
    private double totalDenda;
    private boolean lunas;

    public Pengembalian(LocalDate tanggalKembali, double totalDenda, boolean lunas) {
        if (tanggalKembali == null) {
            throw new IllegalArgumentException("Tanggal kembali tidak boleh kosong");
        }
        this.tanggalKembali = tanggalKembali;
        this.totalDenda = Math.max(0.0, totalDenda);
        this.lunas = lunas;
    }

    public LocalDate getTanggalKembali() {
        return tanggalKembali;
    }

    public double getTotalDenda() {
        return totalDenda;
    }

    public void setTotalDenda(double totalDenda) {
        this.totalDenda = Math.max(0.0, totalDenda);
    }

    public boolean isLunas() {
        return lunas;
    }

    public void setLunas(boolean lunas) {
        this.lunas = lunas;
    }
}
