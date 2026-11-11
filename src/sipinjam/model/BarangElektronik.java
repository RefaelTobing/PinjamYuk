package sipinjam.model;

/** Barang elektronik: tarif harian Rp10.000. */
public class BarangElektronik extends Barang {

    public BarangElektronik(String kode, String nama, KategoriBarang kategori, int stok,
                            double hargaSatuan, boolean perluPersetujuan) {
        super(kode, nama, kategori, stok, hargaSatuan, perluPersetujuan);
    }

    @Override
    public String getJenisBarang() {
        return "ELEKTRONIK";
    }

    @Override
    public double tarifHarian() {
        return 10000.0;
    }

    @Override
    public double biayaKondisi(KondisiBarang kondisi) {
        if (kondisi == KondisiBarang.RUSAK_RINGAN) {
            return 100000.0;
        }
        if (kondisi == KondisiBarang.RUSAK_BERAT) {
            return 0.40 * getHargaSatuan();
        }
        if (kondisi == KondisiBarang.HILANG) {
            return getHargaSatuan();
        }
        return 0.0;
    }
}
