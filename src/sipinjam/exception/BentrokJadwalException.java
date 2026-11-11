package sipinjam.exception;

/** Slot ruangan sudah dipakai pengajuan lain yang bertumpang tindih. */
public class BentrokJadwalException extends AturanDilanggarException {

    public BentrokJadwalException(String pesan) {
        super("Bentrok jadwal", pesan);
    }
}
