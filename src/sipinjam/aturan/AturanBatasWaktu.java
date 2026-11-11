package sipinjam.aturan;

import java.time.temporal.ChronoUnit;

import sipinjam.exception.AturanDilanggarException;

/** R4: barang paling lambat H-1, ruangan paling lambat H-3. */
public class AturanBatasWaktu implements AturanPeminjaman {
    private static final int MINIMAL_BARANG = 1;
    private static final int MINIMAL_RUANGAN = 3;

    @Override
    public String getNamaAturan() {
        return "R4 Batas waktu pengajuan";
    }

    @Override
    public void periksa(KonteksPengajuan konteks) throws AturanDilanggarException {
        long selisih = ChronoUnit.DAYS.between(konteks.getHariIni(), konteks.getTanggalMulai());
        int minimal = konteks.isRuangan() ? MINIMAL_RUANGAN : MINIMAL_BARANG;
        if (selisih < minimal) {
            throw new AturanDilanggarException(getNamaAturan(),
                    "Pengajuan paling lambat H-" + minimal + ", sedangkan jarak saat ini H-" + selisih);
        }
    }
}
