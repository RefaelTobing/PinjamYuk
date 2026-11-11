package sipinjam.exception;

/** Slot berada di luar jam operasional atau bukan kelipatan jam. */
public class DiLuarJamOperasionalException extends AturanDilanggarException {

    public DiLuarJamOperasionalException(String pesan) {
        super("Jam operasional", pesan);
    }
}
