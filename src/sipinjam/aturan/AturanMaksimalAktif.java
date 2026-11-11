package sipinjam.aturan;

import sipinjam.exception.AturanDilanggarException;

/** R2: maksimal dua pengajuan aktif (peminjaman dan booking) dalam satu waktu. */
public class AturanMaksimalAktif implements AturanPeminjaman {
    private static final int BATAS = 2;

    @Override
    public String getNamaAturan() {
        return "R2 Batas pengajuan aktif";
    }

    @Override
    public void periksa(KonteksPengajuan konteks) throws AturanDilanggarException {
        int aktif = konteks.getRepoPeminjaman().hitungAktif(konteks.getPemohon())
                + konteks.getRepoBooking().hitungAktif(konteks.getPemohon());
        if (aktif >= BATAS) {
            throw new AturanDilanggarException(getNamaAturan(),
                    "Sudah ada " + aktif + " pengajuan aktif, batas maksimal " + BATAS);
        }
    }
}
