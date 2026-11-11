package sipinjam.exception;

/** Jumlah peserta melebihi kapasitas ruangan. */
public class KapasitasTerlampauiException extends AturanDilanggarException {

    public KapasitasTerlampauiException(String pesan) {
        super("Kapasitas ruangan", pesan);
    }
}
