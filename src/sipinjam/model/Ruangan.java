package sipinjam.model;

/**
 * Ruangan: sumber daya yang dipesan per slot jam.
 * Tidak memiliki denda harian maupun denda kondisi; yang berlaku adalah denda pembatalan.
 */
public class Ruangan extends Barang {
    private int kapasitas;
    private String fasilitas;

    public Ruangan(String kode, String nama, KategoriBarang kategori, int kapasitas, String fasilitas) {
        super(kode, nama, kategori, 0, 0.0, false);
        if (kapasitas <= 0) {
            throw new IllegalArgumentException("Kapasitas ruangan harus lebih dari nol");
        }
        this.kapasitas = kapasitas;
        this.fasilitas = fasilitas;
    }

    @Override
    public String getJenisBarang() {
        return "RUANGAN";
    }

    @Override
    public double tarifHarian() {
        return 0.0;
    }

    @Override
    public double biayaKondisi(KondisiBarang kondisi) {
        return 0.0;
    }

    @Override
    public boolean dikelolaPerSlot() {
        return true;
    }

    public int getKapasitas() {
        return kapasitas;
    }

    public void setKapasitas(int kapasitas) {
        if (kapasitas <= 0) {
            throw new IllegalArgumentException("Kapasitas ruangan harus lebih dari nol");
        }
        this.kapasitas = kapasitas;
    }

    public String getFasilitas() {
        return fasilitas;
    }

    public void setFasilitas(String fasilitas) {
        this.fasilitas = fasilitas;
    }
}
