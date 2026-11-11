package sipinjam.exception;

/** Stok barang tidak mencukupi pada rentang tanggal yang diminta. */
public class StokTidakCukupException extends AturanDilanggarException {

    public StokTidakCukupException(String pesan) {
        super("Ketersediaan stok", pesan);
    }
}
