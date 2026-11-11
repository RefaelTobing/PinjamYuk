package sipinjam.aturan;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import sipinjam.exception.AturanDilanggarException;

/**
 * Menjalankan seluruh aturan yang terdaftar pada satu koleksi.
 * Penambahan aturan baru cukup dengan menambah objek pada daftar.
 */
public class ValidatorPeminjaman {
    private final List<AturanPeminjaman> daftarAturan;

    public ValidatorPeminjaman(List<AturanPeminjaman> daftarAturan) {
        this.daftarAturan = new ArrayList<AturanPeminjaman>(daftarAturan);
    }

    public ValidatorPeminjaman() {
        this(Arrays.<AturanPeminjaman>asList(
                new AturanStatusMahasiswa(),
                new AturanMaksimalAktif(),
                new AturanTunggakanDenda(),
                new AturanBatasWaktu(),
                new AturanDurasiMaksimal(),
                new AturanKetersediaanStok(),
                new AturanBentrokJadwal(),
                new AturanJamOperasional(),
                new AturanKapasitasRuang()));
    }

    public void tambahAturan(AturanPeminjaman aturan) {
        daftarAturan.add(aturan);
    }

    /**
     * Seluruh pelanggaran dikumpulkan lebih dahulu agar pengguna
     * dapat memperbaiki banyak hal dalam satu kali perbaikan.
     */
    public void validasi(KonteksPengajuan konteks) throws AturanDilanggarException {
        List<String> pesan = new ArrayList<String>();
        for (AturanPeminjaman aturan : daftarAturan) {
            try {
                aturan.periksa(konteks);
            } catch (AturanDilanggarException e) {
                pesan.add(e.getMessage());
            }
        }
        if (!pesan.isEmpty()) {
            StringBuilder gabung = new StringBuilder();
            for (int i = 0; i < pesan.size(); i++) {
                if (i > 0) {
                    gabung.append("; ");
                }
                gabung.append(pesan.get(i));
            }
            throw new AturanDilanggarException("Validasi pengajuan", gabung.toString());
        }
    }

    public List<AturanPeminjaman> getDaftarAturan() {
        return Collections.unmodifiableList(daftarAturan);
    }
}
