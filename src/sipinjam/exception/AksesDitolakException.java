package sipinjam.exception;

/** Pengguna tidak berhak melakukan operasi yang diminta. */
public class AksesDitolakException extends Exception {

    public AksesDitolakException(String pesan) {
        super(pesan);
    }
}
