package sipinjam.aturan;

import sipinjam.exception.AturanDilanggarException;
import sipinjam.exception.KapasitasTerlampauiException;

/** S4: jumlah peserta tidak boleh melebihi kapasitas ruangan. */
public class AturanKapasitasRuang implements AturanPeminjaman {

    @Override
    public String getNamaAturan() {
        return "S4 Kapasitas ruangan";
    }

    @Override
    public void periksa(KonteksPengajuan konteks) throws AturanDilanggarException {
        if (!konteks.isRuangan()) {
            return;
        }
        if (konteks.getJumlahPeserta() <= 0) {
            throw new KapasitasTerlampauiException("Jumlah peserta harus lebih dari nol");
        }
        if (konteks.getJumlahPeserta() > konteks.getRuang().getKapasitas()) {
            throw new KapasitasTerlampauiException("Peserta " + konteks.getJumlahPeserta()
                    + " orang melebihi kapasitas " + konteks.getRuang().getNama()
                    + " (" + konteks.getRuang().getKapasitas() + " orang)");
        }
    }
}
