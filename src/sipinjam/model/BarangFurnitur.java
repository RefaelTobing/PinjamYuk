package sipinjam.model;

/** Furnitur: tarif harian Rp5.000. */
public class BarangFurnitur extends Barang {

    public BarangFurnitur(String kode, String nama, KategoriBarang kategori, int stok,
                          double hargaSatuan, boolean perluPersetujuan) {
        super(kode, nama, kategori, stok, hargaSatuan, perluPersetujuan);
    }

    @Override
    public String getJenisBarang() {
        return "FURNITUR";
    }

    @Override
    public double tarifHarian() {
        return 5000.0;
    }

    @Override
    public double biayaKondisi(KondisiBarang kondisi) {
        if (kondisi == KondisiBarang.RUSAK_RINGAN) {
            return 25000.0;
        }
        if (kondisi == KondisiBarang.RUSAK_BERAT) {
            return 0.30 * getHargaSatuan();
        }
        if (kondisi == KondisiBarang.HILANG) {
            return getHargaSatuan();
        }
        return 0.0;
    }
}
