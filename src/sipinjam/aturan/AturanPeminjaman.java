package sipinjam.aturan;

import sipinjam.exception.AturanDilanggarException;

/**
 * Kontrak satu aturan pengajuan. Setiap aturan berdiri sendiri sebagai kelas,
 * sehingga penambahan aturan tidak mengubah kode pemanggil.
 */
public interface AturanPeminjaman {

    String getNamaAturan();

    void periksa(KonteksPengajuan konteks) throws AturanDilanggarException;
}
