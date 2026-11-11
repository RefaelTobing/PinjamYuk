package sipinjam.aturan;

import sipinjam.exception.AturanDilanggarException;

/** R1: hanya mahasiswa berstatus aktif yang boleh mengajukan. */
public class AturanStatusMahasiswa implements AturanPeminjaman {

    @Override
    public String getNamaAturan() {
        return "R1 Status mahasiswa";
    }

    @Override
    public void periksa(KonteksPengajuan konteks) throws AturanDilanggarException {
        if (!konteks.getPemohon().isAktif()) {
            throw new AturanDilanggarException(getNamaAturan(),
                    "Akun mahasiswa berstatus tidak aktif sehingga tidak dapat mengajukan");
        }
    }
}
