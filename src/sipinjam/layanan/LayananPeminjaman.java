package sipinjam.layanan;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import sipinjam.aturan.KonteksPengajuan;
import sipinjam.aturan.ValidatorPeminjaman;
import sipinjam.exception.AturanDilanggarException;
import sipinjam.exception.AksesDitolakException;
import sipinjam.model.BookingRuangan;
import sipinjam.model.DetailPeminjaman;
import sipinjam.model.DosenPembina;
import sipinjam.model.KondisiBarang;
import sipinjam.model.Mahasiswa;
import sipinjam.model.Peminjaman;
import sipinjam.model.Pengembalian;
import sipinjam.model.RincianDenda;
import sipinjam.model.Ruangan;
import sipinjam.model.SlotWaktu;
import sipinjam.model.StatusBooking;
import sipinjam.model.StatusPeminjaman;
import sipinjam.penyimpanan.PenyimpananData;
import sipinjam.repositori.RepositoriBooking;
import sipinjam.repositori.RepositoriPeminjaman;

/** Fasade seluruh alur bisnis peminjaman barang dan booking ruangan. */
public class LayananPeminjaman {
    private final RepositoriPeminjaman repoPeminjaman;
    private final RepositoriBooking repoBooking;
    private final ValidatorPeminjaman validator;
    private final LayananBookingRuangan layananBooking;
    private final KalkulatorDenda kalkulatorDenda;
    private final PenyimpananData penyimpanan;

    public LayananPeminjaman(RepositoriPeminjaman repoPeminjaman, RepositoriBooking repoBooking,
                             ValidatorPeminjaman validator, LayananBookingRuangan layananBooking,
                             KalkulatorDenda kalkulatorDenda, PenyimpananData penyimpanan) {
        this.repoPeminjaman = repoPeminjaman;
        this.repoBooking = repoBooking;
        this.validator = validator;
        this.layananBooking = layananBooking;
        this.kalkulatorDenda = kalkulatorDenda;
        this.penyimpanan = penyimpanan;
    }

    public Peminjaman ajukanBarang(Mahasiswa pemohon, List<DetailPeminjaman> detail,
                                   LocalDate mulai, LocalDate selesai, String keperluan,
                                   LocalDate hariIni) throws AturanDilanggarException {
        validator.validasi(KonteksPengajuan.untukBarang(pemohon, mulai, selesai, detail,
                repoPeminjaman, repoBooking, hariIni));

        Peminjaman peminjaman = new Peminjaman(repoPeminjaman.idBerikutnya(), pemohon, hariIni,
                mulai, selesai, keperluan);
        for (DetailPeminjaman baris : detail) {
            peminjaman.tambahDetail(baris);
        }
        repoPeminjaman.tambah(peminjaman);
        simpan();
        return peminjaman;
    }

    public BookingRuangan ajukanBooking(Mahasiswa pemohon, Ruangan ruangan, LocalDate tanggal,
                                        SlotWaktu slot, int jumlahPeserta, String keperluan,
                                        LocalDate hariIni) throws AturanDilanggarException {
        validator.validasi(KonteksPengajuan.untukRuangan(pemohon, ruangan, tanggal, slot,
                jumlahPeserta, repoPeminjaman, repoBooking, hariIni));

        BookingRuangan booking = new BookingRuangan(repoBooking.idBerikutnya(), ruangan, pemohon,
                hariIni, tanggal, slot, jumlahPeserta, keperluan, StatusBooking.DIAJUKAN, "", 0.0, false);
        repoBooking.tambah(booking);
        simpan();
        return booking;
    }

    public void setujuiPembina(Peminjaman peminjaman, DosenPembina pembina)
            throws AksesDitolakException {
        if (peminjaman.getStatus() != StatusPeminjaman.DIAJUKAN) {
            throw new AksesDitolakException("Hanya pengajuan berstatus diajukan yang dapat disetujui");
        }
        if (!peminjaman.butuhPersetujuanPembina()) {
            throw new AksesDitolakException("Pengajuan ini tidak memerlukan persetujuan pembina");
        }
        peminjaman.setIdPembina(pembina.getNidn());
        peminjaman.setCatatanPetugas("Disetujui pembina " + pembina.getNama());
        simpan();
    }

    public void tolakPembina(Peminjaman peminjaman, DosenPembina pembina, String catatan)
            throws AksesDitolakException {
        if (peminjaman.getStatus() != StatusPeminjaman.DIAJUKAN) {
            throw new AksesDitolakException("Hanya pengajuan berstatus diajukan yang dapat ditolak");
        }
        peminjaman.setIdPembina(pembina.getNidn());
        peminjaman.setCatatanPetugas("Ditolak pembina: " + catatan);
        peminjaman.ubahStatus(StatusPeminjaman.DITOLAK);
        simpan();
    }

    public void verifikasiPetugas(Peminjaman peminjaman, boolean setuju, String catatan)
            throws AksesDitolakException {
        if (peminjaman.getStatus() != StatusPeminjaman.DIAJUKAN) {
            throw new AksesDitolakException("Pengajuan ini sudah diproses sebelumnya");
        }
        if (setuju && peminjaman.butuhPersetujuanPembina() && peminjaman.getIdPembina().isEmpty()) {
            throw new AksesDitolakException("Pengajuan menunggu persetujuan dosen pembina");
        }
        if (setuju) {
            peminjaman.ubahStatus(StatusPeminjaman.DISETUJUI);
            peminjaman.setCatatanPetugas(catatan.isEmpty() ? "Disetujui petugas" : catatan);
        } else {
            peminjaman.ubahStatus(StatusPeminjaman.DITOLAK);
            peminjaman.setCatatanPetugas("Ditolak: " + catatan);
        }
        simpan();
    }

    public void serahTerima(Peminjaman peminjaman) throws AksesDitolakException {
        if (peminjaman.getStatus() != StatusPeminjaman.DISETUJUI) {
            throw new AksesDitolakException("Barang hanya dapat diserahkan setelah pengajuan disetujui");
        }
        peminjaman.ubahStatus(StatusPeminjaman.DIPINJAM);
        simpan();
    }

    public RincianDenda catatPengembalian(Peminjaman peminjaman,
                                          Map<DetailPeminjaman, KondisiBarang> kondisiAkhir,
                                          LocalDate tanggalKembali, boolean dendaLunas)
            throws AksesDitolakException {
        if (peminjaman.getStatus() != StatusPeminjaman.DIPINJAM) {
            throw new AksesDitolakException("Hanya peminjaman berstatus dipinjam yang dapat dikembalikan");
        }
        for (Map.Entry<DetailPeminjaman, KondisiBarang> entri : kondisiAkhir.entrySet()) {
            entri.getKey().setKondisiAkhir(entri.getValue());
        }
        RincianDenda rincian = kalkulatorDenda.hitung(peminjaman, tanggalKembali);
        peminjaman.setPengembalian(new Pengembalian(tanggalKembali, rincian.getTotal(), dendaLunas));
        peminjaman.ubahStatus(StatusPeminjaman.DIKEMBALIKAN);
        simpan();
        return rincian;
    }

    public void batalkanPeminjaman(Peminjaman peminjaman) throws AksesDitolakException {
        if (peminjaman.getStatus() != StatusPeminjaman.DIAJUKAN
                && peminjaman.getStatus() != StatusPeminjaman.DISETUJUI) {
            throw new AksesDitolakException("Pengajuan ini tidak dapat dibatalkan lagi");
        }
        peminjaman.ubahStatus(StatusPeminjaman.DIBATALKAN);
        simpan();
    }

    public void verifikasiBooking(BookingRuangan booking, boolean setuju, String catatan)
            throws AksesDitolakException {
        if (booking.getStatus() != StatusBooking.DIAJUKAN) {
            throw new AksesDitolakException("Booking ini sudah diproses sebelumnya");
        }
        booking.setCatatanPetugas(setuju ? (catatan.isEmpty() ? "Disetujui petugas" : catatan)
                : "Ditolak: " + catatan);
        booking.ubahStatus(setuju ? StatusBooking.DISETUJUI : StatusBooking.DITOLAK);
        simpan();
    }

    /** Mengembalikan nilai denda pembatalan yang dikenakan (0 bila masih H-1 atau lebih). */
    public double batalkanBooking(BookingRuangan booking, LocalDate hariIni)
            throws AksesDitolakException {
        if (booking.getStatus() != StatusBooking.DIAJUKAN
                && booking.getStatus() != StatusBooking.DISETUJUI) {
            throw new AksesDitolakException("Booking ini tidak dapat dibatalkan lagi");
        }
        double denda = kalkulatorDenda.dendaPembatalan(booking.getTanggal(), hariIni);
        booking.setDendaPembatalan(denda);
        booking.ubahStatus(StatusBooking.DIBATALKAN);
        simpan();
        return denda;
    }

    public void lunasiDenda(Peminjaman peminjaman) {
        if (peminjaman.getPengembalian() != null) {
            peminjaman.getPengembalian().setLunas(true);
        }
        simpan();
    }

    public void lunasiDenda(BookingRuangan booking) {
        booking.setDendaLunas(true);
        simpan();
    }

    public List<Peminjaman> menungguPembina() {
        return repoPeminjaman.menungguPembina();
    }

    public List<Peminjaman> jatuhTempo(LocalDate hariIni) {
        return repoPeminjaman.jatuhTempo(hariIni);
    }

    public List<Peminjaman> peminjamanAktif() {
        List<Peminjaman> hasil = new ArrayList<Peminjaman>();
        for (Peminjaman peminjaman : repoPeminjaman.semua()) {
            if (peminjaman.getStatus().aktif()) {
                hasil.add(peminjaman);
            }
        }
        return hasil;
    }

    public int perbaruiStatusBerjalan(LocalDate hariIni) {
        int berubah = layananBooking.perbaruiStatusBerjalan(hariIni, java.time.LocalTime.now());
        if (berubah > 0) {
            simpan();
        }
        return berubah;
    }

    public void simpan() {
        penyimpanan.simpan();
    }

    public RepositoriPeminjaman getRepoPeminjaman() {
        return repoPeminjaman;
    }

    public RepositoriBooking getRepoBooking() {
        return repoBooking;
    }
}
