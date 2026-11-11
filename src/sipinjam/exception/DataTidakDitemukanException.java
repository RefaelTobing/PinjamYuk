package sipinjam.exception;

/** Data yang dicari tidak ada pada koleksi. */
public class DataTidakDitemukanException extends Exception {

    public DataTidakDitemukanException(String pesan) {
        super(pesan);
    }
}
