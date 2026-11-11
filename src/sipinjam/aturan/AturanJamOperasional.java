package sipinjam.aturan;

import java.time.LocalTime;

import sipinjam.exception.AturanDilanggarException;
import sipinjam.exception.DiLuarJamOperasionalException;

/** S1 dan S2: slot berada di antara 07.00-21.00 dan kelipatan satu jam. */
public class AturanJamOperasional implements AturanPeminjaman {
    private static final LocalTime BUKA = LocalTime.of(7, 0);
    private static final LocalTime TUTUP = LocalTime.of(21, 0);

    @Override
    public String getNamaAturan() {
        return "S1 Jam operasional";
    }

    @Override
    public void periksa(KonteksPengajuan konteks) throws AturanDilanggarException {
        if (!konteks.isRuangan()) {
            return;
        }
        if (!konteks.getSlot().diDalam(BUKA, TUTUP)) {
            throw new DiLuarJamOperasionalException("Slot " + konteks.getSlot()
                    + " berada di luar jam operasional 07.00-21.00");
        }
        if (!konteks.getSlot().kelipatanJam()) {
            throw new DiLuarJamOperasionalException("Slot " + konteks.getSlot()
                    + " bukan kelipatan satu jam");
        }
    }
}
