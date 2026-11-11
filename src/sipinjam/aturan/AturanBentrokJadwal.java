package sipinjam.aturan;

import sipinjam.exception.AturanDilanggarException;
import sipinjam.exception.BentrokJadwalException;
import sipinjam.model.BookingRuangan;

/** S3: menolak slot yang bertumpang tindih dengan booking aktif lain. */
public class AturanBentrokJadwal implements AturanPeminjaman {

    @Override
    public String getNamaAturan() {
        return "S3 Bentrok jadwal";
    }

    @Override
    public void periksa(KonteksPengajuan konteks) throws AturanDilanggarException {
        if (!konteks.isRuangan()) {
            return;
        }
        BookingRuangan bentrok = konteks.getRepoBooking().cariBentrok(
                konteks.getRuang(), konteks.getTanggalMulai(), konteks.getSlot());
        if (bentrok != null) {
            throw new BentrokJadwalException("Slot " + konteks.getSlot() + " pada "
                    + konteks.getRuang().getNama() + " bentrok dengan booking " + bentrok.getSlot()
                    + " milik " + bentrok.getPemohon().getNama()
                    + " (" + bentrok.getStatus().getLabel() + ")");
        }
    }
}
