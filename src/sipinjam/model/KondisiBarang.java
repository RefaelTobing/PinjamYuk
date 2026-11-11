package sipinjam.model;

/** Kondisi barang saat diserahkan atau dikembalikan. */
public enum KondisiBarang {
    BAIK("Baik"),
    RUSAK_RINGAN("Rusak Ringan"),
    RUSAK_BERAT("Rusak Berat"),
    HILANG("Hilang");

    private final String label;

    KondisiBarang(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
