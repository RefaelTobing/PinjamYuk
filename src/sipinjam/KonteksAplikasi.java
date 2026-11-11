package sipinjam;

import java.time.LocalDate;

import sipinjam.aturan.ValidatorPeminjaman;
import sipinjam.layanan.KalkulatorDenda;
import sipinjam.layanan.LayananBookingRuangan;
import sipinjam.layanan.LayananKetersediaan;
import sipinjam.layanan.LayananPeminjaman;
import sipinjam.layanan.RekapPeminjaman;
import sipinjam.penyimpanan.PenyimpananData;
import sipinjam.repositori.RepositoriBarang;
import sipinjam.repositori.RepositoriBooking;
import sipinjam.repositori.RepositoriPeminjaman;
import sipinjam.repositori.RepositoriPengguna;

/** Perakitan seluruh objek aplikasi: repositori, layanan, dan penyimpanan. */
public class KonteksAplikasi {
    private final RepositoriPengguna repoPengguna = new RepositoriPengguna();
    private final RepositoriBarang repoBarang = new RepositoriBarang();
    private final RepositoriPeminjaman repoPeminjaman = new RepositoriPeminjaman();
    private final RepositoriBooking repoBooking = new RepositoriBooking();

    private final PenyimpananData penyimpanan;
    private final ValidatorPeminjaman validator;
    private final LayananKetersediaan ketersediaan;
    private final LayananBookingRuangan layananBooking;
    private final KalkulatorDenda kalkulatorDenda;
    private final RekapPeminjaman rekap;
    private final LayananPeminjaman layanan;

    public KonteksAplikasi(String folderData) {
        this.penyimpanan = new PenyimpananData(folderData, repoPengguna, repoBarang,
                repoPeminjaman, repoBooking);
        this.validator = new ValidatorPeminjaman();
        this.ketersediaan = new LayananKetersediaan(repoPeminjaman);
        this.layananBooking = new LayananBookingRuangan(repoBooking);
        this.kalkulatorDenda = new KalkulatorDenda();
        this.rekap = new RekapPeminjaman();
        this.layanan = new LayananPeminjaman(repoPeminjaman, repoBooking, validator,
                layananBooking, kalkulatorDenda, penyimpanan);
        this.penyimpanan.muat();
        this.layanan.perbaruiStatusBerjalan(hariIni());
    }

    public LocalDate hariIni() {
        return LocalDate.now();
    }

    public RepositoriPengguna getRepoPengguna() {
        return repoPengguna;
    }

    public RepositoriBarang getRepoBarang() {
        return repoBarang;
    }

    public RepositoriPeminjaman getRepoPeminjaman() {
        return repoPeminjaman;
    }

    public RepositoriBooking getRepoBooking() {
        return repoBooking;
    }

    public PenyimpananData getPenyimpanan() {
        return penyimpanan;
    }

    public ValidatorPeminjaman getValidator() {
        return validator;
    }

    public LayananKetersediaan getKetersediaan() {
        return ketersediaan;
    }

    public LayananBookingRuangan getLayananBooking() {
        return layananBooking;
    }

    public KalkulatorDenda getKalkulatorDenda() {
        return kalkulatorDenda;
    }

    public RekapPeminjaman getRekap() {
        return rekap;
    }

    public LayananPeminjaman getLayanan() {
        return layanan;
    }
}
