package sipinjam.model;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/** Pengajuan peminjaman barang beserta detail dan siklus statusnya. */
public class Peminjaman {
    private final String id;
    private final Mahasiswa pemohon;
    private final LocalDate tanggalPengajuan;
    private LocalDate tanggalMulai;
    private LocalDate tanggalSelesai;
    private String keperluan;
    private final List<DetailPeminjaman> detail;
    private StatusPeminjaman status;
    private String catatanPetugas;
    private String idPembina;
    private Pengembalian pengembalian;

    public Peminjaman(String id, Mahasiswa pemohon, LocalDate tanggalPengajuan,
                      LocalDate tanggalMulai, LocalDate tanggalSelesai, String keperluan) {
        if (pemohon == null) {
            throw new IllegalArgumentException("Pemohon wajib diisi");
        }
        if (tanggalMulai == null || tanggalSelesai == null) {
            throw new IllegalArgumentException("Tanggal peminjaman wajib diisi");
        }
        if (tanggalSelesai.isBefore(tanggalMulai)) {
            throw new IllegalArgumentException("Tanggal selesai tidak boleh sebelum tanggal mulai");
        }
        this.id = id;
        this.pemohon = pemohon;
        this.tanggalPengajuan = tanggalPengajuan;
        this.tanggalMulai = tanggalMulai;
        this.tanggalSelesai = tanggalSelesai;
        this.keperluan = keperluan;
        this.detail = new ArrayList<DetailPeminjaman>();
        this.status = StatusPeminjaman.DIAJUKAN;
        this.catatanPetugas = "";
        this.idPembina = "";
        this.pengembalian = null;
    }

    public void tambahDetail(DetailPeminjaman baris) {
        if (baris == null) {
            throw new IllegalArgumentException("Detail peminjaman tidak boleh kosong");
        }
        for (DetailPeminjaman ada : detail) {
            if (ada.getBarang().getKode().equals(baris.getBarang().getKode())) {
                throw new IllegalArgumentException("Barang " + baris.getBarang().getNama()
                        + " sudah ada pada pengajuan ini");
            }
        }
        detail.add(baris);
    }

    public void ubahStatus(StatusPeminjaman tujuan) {
        if (tujuan == null) {
            throw new IllegalArgumentException("Status tujuan tidak boleh kosong");
        }
        if (!status.bolehKe(tujuan)) {
            throw new IllegalStateException("Status " + status.getLabel()
                    + " tidak dapat berpindah ke " + tujuan.getLabel());
        }
        this.status = tujuan;
    }

    /** Lama peminjaman dalam hari, minimal satu hari. */
    public int durasiHari() {
        long hari = ChronoUnit.DAYS.between(tanggalMulai, tanggalSelesai);
        return (int) Math.max(1, hari);
    }

    /** Rentang tanggal bertumpang tindih dengan peminjaman lain. */
    public boolean bertumpangTindih(LocalDate mulai, LocalDate selesai) {
        return !tanggalMulai.isAfter(selesai) && !mulai.isAfter(tanggalSelesai);
    }

    public long hariTerlambat(LocalDate tanggalKembali) {
        if (tanggalKembali == null || !tanggalKembali.isAfter(tanggalSelesai)) {
            return 0;
        }
        return ChronoUnit.DAYS.between(tanggalSelesai, tanggalKembali);
    }

    public boolean butuhPersetujuanPembina() {
        for (DetailPeminjaman baris : detail) {
            if (baris.getBarang().isPerluPersetujuan()) {
                return true;
            }
        }
        return false;
    }

    public int totalUnit() {
        int total = 0;
        for (DetailPeminjaman baris : detail) {
            total += baris.getJumlah();
        }
        return total;
    }

    public boolean adaTunggakan() {
        return pengembalian != null && pengembalian.getTotalDenda() > 0 && !pengembalian.isLunas();
    }

    public String getId() {
        return id;
    }

    public Mahasiswa getPemohon() {
        return pemohon;
    }

    public LocalDate getTanggalPengajuan() {
        return tanggalPengajuan;
    }

    public LocalDate getTanggalMulai() {
        return tanggalMulai;
    }

    public void setTanggalMulai(LocalDate tanggalMulai) {
        this.tanggalMulai = tanggalMulai;
    }

    public LocalDate getTanggalSelesai() {
        return tanggalSelesai;
    }

    public void setTanggalSelesai(LocalDate tanggalSelesai) {
        this.tanggalSelesai = tanggalSelesai;
    }

    public String getKeperluan() {
        return keperluan;
    }

    public void setKeperluan(String keperluan) {
        this.keperluan = keperluan;
    }

    public List<DetailPeminjaman> getDetail() {
        return Collections.unmodifiableList(detail);
    }

    public StatusPeminjaman getStatus() {
        return status;
    }

    public String getCatatanPetugas() {
        return catatanPetugas;
    }

    public void setCatatanPetugas(String catatanPetugas) {
        this.catatanPetugas = catatanPetugas == null ? "" : catatanPetugas;
    }

    public String getIdPembina() {
        return idPembina;
    }

    public void setIdPembina(String idPembina) {
        this.idPembina = idPembina == null ? "" : idPembina;
    }

    public Pengembalian getPengembalian() {
        return pengembalian;
    }

    public void setPengembalian(Pengembalian pengembalian) {
        this.pengembalian = pengembalian;
    }

    @Override
    public String toString() {
        return id + " - " + pemohon.getNama() + " - " + status.getLabel();
    }
}
