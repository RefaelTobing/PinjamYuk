package sipinjam.model;

/** Rincian perhitungan denda agar dapat ditampilkan dan dipertanggungjawabkan. */
public class RincianDenda {
    private final long hariTerlambat;
    private final double dendaTerlambat;
    private final double dendaKondisi;
    private String keterangan;

    public RincianDenda(long hariTerlambat, double dendaTerlambat, double dendaKondisi) {
        this.hariTerlambat = Math.max(0, hariTerlambat);
        this.dendaTerlambat = Math.max(0.0, dendaTerlambat);
        this.dendaKondisi = Math.max(0.0, dendaKondisi);
        this.keterangan = "";
    }

    public long getHariTerlambat() {
        return hariTerlambat;
    }

    public double getDendaTerlambat() {
        return dendaTerlambat;
    }

    public double getDendaKondisi() {
        return dendaKondisi;
    }

    public double getTotal() {
        return dendaTerlambat + dendaKondisi;
    }

    public String getKeterangan() {
        return keterangan;
    }

    public void setKeterangan(String keterangan) {
        this.keterangan = keterangan;
    }
}
