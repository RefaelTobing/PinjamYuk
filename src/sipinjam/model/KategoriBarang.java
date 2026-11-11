package sipinjam.model;

/** Data induk kategori barang. */
public class KategoriBarang {
    private final String kode;
    private String nama;

    public KategoriBarang(String kode, String nama) {
        if (kode == null || kode.trim().isEmpty()) {
            throw new IllegalArgumentException("Kode kategori tidak boleh kosong");
        }
        this.kode = kode.trim();
        this.nama = nama;
    }

    public String getKode() {
        return kode;
    }

    public String getNama() {
        return nama;
    }

    public void setNama(String nama) {
        this.nama = nama;
    }

    @Override
    public String toString() {
        return nama;
    }
}
