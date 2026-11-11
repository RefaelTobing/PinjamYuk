package sipinjam.model;

/** Alat laboratorium: tarif harian Rp15.000. */
public class AlatLaboratorium extends Barang {

    public AlatLaboratorium(String kode, String nama, KategoriBarang kategori, int stok,
                            double hargaSatuan, boolean perluPersetujuan) {
        super(kode, nama, kategori, stok, hargaSatuan, perluPersetujuan);
    }

    @Override
    public String getJenisBarang() {
        return "ALAT_LAB";
    }

    @Override
    public double tarifHarian() {
        return 15000.0;
    }

    @Override
    public double biayaKondisi(KondisiBarang kondisi) {
        if (kondisi == KondisiBarang.RUSAK_RINGAN) {
            return 75000.0;
        }
        if (kondisi == KondisiBarang.RUSAK_BERAT) {
            return 0.50 * getHargaSatuan();
        }
        if (kondisi == KondisiBarang.HILANG) {
            return getHargaSatuan();
        }
        return 0.0;
    }
}
