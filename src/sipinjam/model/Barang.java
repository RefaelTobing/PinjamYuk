package sipinjam.model;

/**
 * Induk seluruh sumber daya yang dapat dipinjam: barang inventaris dan ruangan.
 * Tarif denda ditentukan oleh masing-masing subclass (polymorphism).
 */
public abstract class Barang {
    private final String kode;
    private String nama;
    private KategoriBarang kategori;
    private int stok;
    private double hargaSatuan;
    private boolean perluPersetujuan;

    protected Barang(String kode, String nama, KategoriBarang kategori, int stok,
                     double hargaSatuan, boolean perluPersetujuan) {
        if (kode == null || kode.trim().isEmpty()) {
            throw new IllegalArgumentException("Kode barang tidak boleh kosong");
        }
        if (stok < 0) {
            throw new IllegalArgumentException("Stok tidak boleh negatif");
        }
        this.kode = kode.trim();
        this.nama = nama;
        this.kategori = kategori;
        this.stok = stok;
        this.hargaSatuan = hargaSatuan;
        this.perluPersetujuan = perluPersetujuan;
    }

    /** Nama jenis untuk ditampilkan dan disimpan pada berkas. */
    public abstract String getJenisBarang();

    /** Tarif denda keterlambatan per hari. */
    public abstract double tarifHarian();

    /** Biaya kerusakan atau kehilangan sesuai jenis barang. */
    public abstract double biayaKondisi(KondisiBarang kondisi);

    /**
     * Perhitungan denda yang sama untuk seluruh jenis barang,
     * memakai tarif yang berbeda dari subclass.
     */
    public double hitungDenda(long hariTerlambat, KondisiBarang kondisi) {
        long hari = Math.max(0, hariTerlambat);
        return (tarifHarian() * hari) + biayaKondisi(kondisi);
    }

    /** Ruangan tidak dipinjam per tanggal, melainkan per slot jam. */
    public boolean dikelolaPerSlot() {
        return false;
    }

    public String getKode() {
        return kode;
    }

    public String getNama() {
        return nama;
    }

    public void setNama(String nama) {
        if (nama == null || nama.trim().isEmpty()) {
            throw new IllegalArgumentException("Nama barang tidak boleh kosong");
        }
        this.nama = nama.trim();
    }

    public KategoriBarang getKategori() {
        return kategori;
    }

    public void setKategori(KategoriBarang kategori) {
        this.kategori = kategori;
    }

    public int getStok() {
        return stok;
    }

    public void setStok(int stok) {
        if (stok < 0) {
            throw new IllegalArgumentException("Stok tidak boleh negatif");
        }
        this.stok = stok;
    }

    public double getHargaSatuan() {
        return hargaSatuan;
    }

    public void setHargaSatuan(double hargaSatuan) {
        this.hargaSatuan = hargaSatuan;
    }

    public boolean isPerluPersetujuan() {
        return perluPersetujuan;
    }

    public void setPerluPersetujuan(boolean perluPersetujuan) {
        this.perluPersetujuan = perluPersetujuan;
    }

    @Override
    public String toString() {
        return nama + " [" + kode + "]";
    }
}
