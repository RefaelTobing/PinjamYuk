package sipinjam.exception;

/** Dilempar ketika salah satu aturan pengajuan tidak terpenuhi. */
public class AturanDilanggarException extends Exception {
    private final String namaAturan;

    public AturanDilanggarException(String namaAturan, String pesan) {
        super(pesan);
        this.namaAturan = namaAturan;
    }

    public String getNamaAturan() {
        return namaAturan;
    }
}
