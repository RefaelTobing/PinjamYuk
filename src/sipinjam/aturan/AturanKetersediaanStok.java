package sipinjam.aturan;

import sipinjam.exception.AturanDilanggarException;
import sipinjam.exception.StokTidakCukupException;
import sipinjam.model.DetailPeminjaman;

/** Pemeriksaan stok barang pada rentang tanggal yang diminta. */
public class AturanKetersediaanStok implements AturanPeminjaman {

    @Override
    public String getNamaAturan() {
        return "Ketersediaan stok";
    }

    @Override
    public void periksa(KonteksPengajuan konteks) throws AturanDilanggarException {
        if (konteks.isRuangan()) {
            return;
        }
        for (DetailPeminjaman baris : konteks.getDetail()) {
            int terpakai = konteks.getRepoPeminjaman().terpakai(baris.getBarang(),
                    konteks.getTanggalMulai(), konteks.getTanggalSelesai());
            int sisa = baris.getBarang().getStok() - terpakai;
            if (baris.getJumlah() > sisa) {
                throw new StokTidakCukupException("Stok " + baris.getBarang().getNama()
                        + " tersisa " + Math.max(0, sisa) + " unit, diminta " + baris.getJumlah() + " unit");
            }
        }
    }
}
