package sipinjam.aturan;

import sipinjam.exception.AturanDilanggarException;

/** R3: pengajuan ditolak bila masih ada denda yang belum dibayar. */
public class AturanTunggakanDenda implements AturanPeminjaman {

    @Override
    public String getNamaAturan() {
        return "R3 Tunggakan denda";
    }

    @Override
    public void periksa(KonteksPengajuan konteks) throws AturanDilanggarException {
        if (konteks.getRepoPeminjaman().adaTunggakan(konteks.getPemohon())
                || konteks.getRepoBooking().adaTunggakan(konteks.getPemohon())) {
            throw new AturanDilanggarException(getNamaAturan(),
                    "Masih ada denda yang belum dibayar, lunasi terlebih dahulu");
        }
    }
}
