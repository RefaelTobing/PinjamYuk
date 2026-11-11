package sipinjam.exception;

/** Baris data pada berkas tidak sesuai format yang diharapkan. */
public class FormatBerkasException extends Exception {
    private final int nomorBaris;

    public FormatBerkasException(int nomorBaris, String pesan) {
        super(pesan);
        this.nomorBaris = nomorBaris;
    }

    public int getNomorBaris() {
        return nomorBaris;
    }
}
