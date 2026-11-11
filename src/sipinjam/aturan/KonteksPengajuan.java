package sipinjam.aturan;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import sipinjam.model.DetailPeminjaman;
import sipinjam.model.Mahasiswa;
import sipinjam.model.Ruangan;
import sipinjam.model.SlotWaktu;
import sipinjam.repositori.RepositoriBooking;
import sipinjam.repositori.RepositoriPeminjaman;

/**
 * Data yang dibutuhkan seluruh aturan dalam satu pemeriksaan.
 * Dua pembuat objek (untuk barang dan untuk ruangan) memakai overloading.
 */
public class KonteksPengajuan {
    private final Mahasiswa pemohon;
    private final boolean ruangan;
    private final LocalDate tanggalMulai;
    private final LocalDate tanggalSelesai;
    private final int durasiHari;
    private final SlotWaktu slot;
    private final Ruangan ruang;
    private final int jumlahPeserta;
    private final List<DetailPeminjaman> detail;
    private final RepositoriPeminjaman repoPeminjaman;
    private final RepositoriBooking repoBooking;
    private final LocalDate hariIni;

    private KonteksPengajuan(Mahasiswa pemohon, boolean ruangan, LocalDate tanggalMulai,
                             LocalDate tanggalSelesai, int durasiHari, SlotWaktu slot,
                             Ruangan ruang, int jumlahPeserta,
                             List<DetailPeminjaman> detail, RepositoriPeminjaman repoPeminjaman,
                             RepositoriBooking repoBooking, LocalDate hariIni) {
        this.pemohon = pemohon;
        this.ruangan = ruangan;
        this.tanggalMulai = tanggalMulai;
        this.tanggalSelesai = tanggalSelesai;
        this.durasiHari = durasiHari;
        this.slot = slot;
        this.ruang = ruang;
        this.jumlahPeserta = jumlahPeserta;
        this.detail = detail;
        this.repoPeminjaman = repoPeminjaman;
        this.repoBooking = repoBooking;
        this.hariIni = hariIni;
    }

    public static KonteksPengajuan untukBarang(Mahasiswa pemohon, LocalDate mulai, LocalDate selesai,
                                               List<DetailPeminjaman> detail,
                                               RepositoriPeminjaman repoPeminjaman,
                                               RepositoriBooking repoBooking, LocalDate hariIni) {
        int durasi = (int) Math.max(1, java.time.temporal.ChronoUnit.DAYS.between(mulai, selesai));
        return new KonteksPengajuan(pemohon, false, mulai, selesai, durasi, null, null, 0, detail,
                repoPeminjaman, repoBooking, hariIni);
    }

    public static KonteksPengajuan untukRuangan(Mahasiswa pemohon, Ruangan ruang, LocalDate tanggal,
                                                SlotWaktu slot, int jumlahPeserta,
                                                RepositoriPeminjaman repoPeminjaman,
                                                RepositoriBooking repoBooking, LocalDate hariIni) {
        return new KonteksPengajuan(pemohon, true, tanggal, tanggal, 0, slot, ruang, jumlahPeserta,
                Collections.<DetailPeminjaman>emptyList(), repoPeminjaman, repoBooking, hariIni);
    }

    public Mahasiswa getPemohon() {
        return pemohon;
    }

    public boolean isRuangan() {
        return ruangan;
    }

    public LocalDate getTanggalMulai() {
        return tanggalMulai;
    }

    public LocalDate getTanggalSelesai() {
        return tanggalSelesai;
    }

    public int getDurasiHari() {
        return durasiHari;
    }

    public SlotWaktu getSlot() {
        return slot;
    }

    public Ruangan getRuang() {
        return ruang;
    }

    public int getJumlahPeserta() {
        return jumlahPeserta;
    }

    public List<DetailPeminjaman> getDetail() {
        return detail;
    }

    public RepositoriPeminjaman getRepoPeminjaman() {
        return repoPeminjaman;
    }

    public RepositoriBooking getRepoBooking() {
        return repoBooking;
    }

    public LocalDate getHariIni() {
        return hariIni;
    }
}
