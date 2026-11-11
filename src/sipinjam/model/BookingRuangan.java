package sipinjam.model;

import java.time.LocalDate;

/** Pengajuan pemakaian ruangan pada satu slot jam. */
public class BookingRuangan {
    private final String id;
    private final Ruangan ruangan;
    private final Mahasiswa pemohon;
    private final LocalDate tanggalPengajuan;
    private LocalDate tanggal;
    private SlotWaktu slot;
    private int jumlahPeserta;
    private String keperluan;
    private StatusBooking status;
    private String catatanPetugas;
    private double dendaPembatalan;
    private boolean dendaLunas;

    public BookingRuangan(String id, Ruangan ruangan, Mahasiswa pemohon, LocalDate tanggalPengajuan,
                          LocalDate tanggal, SlotWaktu slot, int jumlahPeserta, String keperluan,
                          StatusBooking status, String catatanPetugas,
                          double dendaPembatalan, boolean dendaLunas) {
        if (ruangan == null || pemohon == null || tanggal == null || slot == null) {
            throw new IllegalArgumentException("Ruangan, pemohon, tanggal, dan slot wajib diisi");
        }
        this.id = id;
        this.ruangan = ruangan;
        this.pemohon = pemohon;
        this.tanggalPengajuan = tanggalPengajuan;
        this.tanggal = tanggal;
        this.slot = slot;
        this.jumlahPeserta = jumlahPeserta;
        this.keperluan = keperluan;
        this.status = status == null ? StatusBooking.DIAJUKAN : status;
        this.catatanPetugas = catatanPetugas == null ? "" : catatanPetugas;
        this.dendaPembatalan = dendaPembatalan;
        this.dendaLunas = dendaLunas;
    }

    public void ubahStatus(StatusBooking tujuan) {
        if (tujuan == null) {
            throw new IllegalArgumentException("Status tujuan tidak boleh kosong");
        }
        if (!status.bolehKe(tujuan)) {
            throw new IllegalStateException("Status " + status.getLabel()
                    + " tidak dapat berpindah ke " + tujuan.getLabel());
        }
        this.status = tujuan;
    }

    public boolean adaTunggakan() {
        return dendaPembatalan > 0 && !dendaLunas;
    }

    public String getId() {
        return id;
    }

    public Ruangan getRuangan() {
        return ruangan;
    }

    public Mahasiswa getPemohon() {
        return pemohon;
    }

    public LocalDate getTanggalPengajuan() {
        return tanggalPengajuan;
    }

    public LocalDate getTanggal() {
        return tanggal;
    }

    public void setTanggal(LocalDate tanggal) {
        this.tanggal = tanggal;
    }

    public SlotWaktu getSlot() {
        return slot;
    }

    public void setSlot(SlotWaktu slot) {
        this.slot = slot;
    }

    public int getJumlahPeserta() {
        return jumlahPeserta;
    }

    public void setJumlahPeserta(int jumlahPeserta) {
        this.jumlahPeserta = jumlahPeserta;
    }

    public String getKeperluan() {
        return keperluan;
    }

    public void setKeperluan(String keperluan) {
        this.keperluan = keperluan;
    }

    public StatusBooking getStatus() {
        return status;
    }

    public String getCatatanPetugas() {
        return catatanPetugas;
    }

    public void setCatatanPetugas(String catatanPetugas) {
        this.catatanPetugas = catatanPetugas == null ? "" : catatanPetugas;
    }

    public double getDendaPembatalan() {
        return dendaPembatalan;
    }

    public void setDendaPembatalan(double dendaPembatalan) {
        this.dendaPembatalan = Math.max(0.0, dendaPembatalan);
    }

    public boolean isDendaLunas() {
        return dendaLunas;
    }

    public void setDendaLunas(boolean dendaLunas) {
        this.dendaLunas = dendaLunas;
    }

    @Override
    public String toString() {
        return ruangan.getNama() + " " + tanggal + " " + slot;
    }
}
