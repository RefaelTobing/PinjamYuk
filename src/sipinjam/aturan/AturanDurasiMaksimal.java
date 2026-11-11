package sipinjam.aturan;

import sipinjam.exception.AturanDilanggarException;

/** R5: barang maksimal tujuh hari, ruangan minimal satu jam dan maksimal empat jam. */
public class AturanDurasiMaksimal implements AturanPeminjaman {
    private static final int MAKS_HARI = 7;
    private static final int MAKS_JAM = 4;
    private static final int MIN_JAM = 1;

    @Override
    public String getNamaAturan() {
        return "R5 Durasi maksimal";
    }

    @Override
    public void periksa(KonteksPengajuan konteks) throws AturanDilanggarException {
        if (konteks.isRuangan()) {
            int jam = konteks.getSlot().durasiJam();
            if (jam < MIN_JAM || jam > MAKS_JAM) {
                throw new AturanDilanggarException(getNamaAturan(),
                        "Durasi ruangan harus " + MIN_JAM + " sampai " + MAKS_JAM + " jam, bukan " + jam + " jam");
            }
        } else if (konteks.getDurasiHari() > MAKS_HARI) {
            throw new AturanDilanggarException(getNamaAturan(),
                    "Durasi peminjaman maksimal " + MAKS_HARI + " hari, bukan " + konteks.getDurasiHari() + " hari");
        }
    }
}
