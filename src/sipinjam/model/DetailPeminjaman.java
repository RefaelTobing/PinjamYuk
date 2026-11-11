package sipinjam.model;

/** Satu baris barang pada sebuah pengajuan peminjaman. */
public class DetailPeminjaman {
    private final Barang barang;
    private int jumlah;
    private KondisiBarang kondisiAwal;
    private KondisiBarang kondisiAkhir;
    private double subtotalDenda;

    public DetailPeminjaman(Barang barang, int jumlah, KondisiBarang kondisiAwal) {
        if (barang == null) {
            throw new IllegalArgumentException("Barang tidak boleh kosong");
        }
        if (jumlah <= 0) {
            throw new IllegalArgumentException("Jumlah minimal 1");
        }
        this.barang = barang;
        this.jumlah = jumlah;
        this.kondisiAwal = kondisiAwal == null ? KondisiBarang.BAIK : kondisiAwal;
        this.kondisiAkhir = null;
        this.subtotalDenda = 0.0;
    }

    public Barang getBarang() {
        return barang;
    }

    public int getJumlah() {
        return jumlah;
    }

    public void setJumlah(int jumlah) {
        if (jumlah <= 0) {
            throw new IllegalArgumentException("Jumlah minimal 1");
        }
        this.jumlah = jumlah;
    }

    public KondisiBarang getKondisiAwal() {
        return kondisiAwal;
    }

    public void setKondisiAwal(KondisiBarang kondisiAwal) {
        this.kondisiAwal = kondisiAwal;
    }

    public KondisiBarang getKondisiAkhir() {
        return kondisiAkhir;
    }

    public void setKondisiAkhir(KondisiBarang kondisiAkhir) {
        this.kondisiAkhir = kondisiAkhir;
    }

    public double getSubtotalDenda() {
        return subtotalDenda;
    }

    public void setSubtotalDenda(double subtotalDenda) {
        this.subtotalDenda = Math.max(0.0, subtotalDenda);
    }

    @Override
    public String toString() {
        return barang.getNama() + " x" + jumlah;
    }
}
