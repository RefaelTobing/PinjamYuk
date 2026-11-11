package sipinjam.model;

/** Status siklus peminjaman barang beserta aturan perpindahannya. */
public enum StatusPeminjaman {
    DIAJUKAN("Diajukan"),
    DISETUJUI("Disetujui"),
    DIPINJAM("Dipinjam"),
    DIKEMBALIKAN("Dikembalikan"),
    DITOLAK("Ditolak"),
    DIBATALKAN("Dibatalkan");

    private final String label;

    StatusPeminjaman(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public boolean bolehKe(StatusPeminjaman tujuan) {
        switch (this) {
            case DIAJUKAN:
                return tujuan == DISETUJUI || tujuan == DITOLAK || tujuan == DIBATALKAN;
            case DISETUJUI:
                // penolakan masih mungkin terjadi setelah persetujuan pembina,
                // misalnya ketika stok ternyata tidak tersedia saat serah terima
                return tujuan == DIPINJAM || tujuan == DIBATALKAN || tujuan == DITOLAK;
            case DIPINJAM:
                return tujuan == DIKEMBALIKAN;
            default:
                return false;
        }
    }

    /** Status yang masih menahan stok barang. */
    public boolean menahanStok() {
        return this == DISETUJUI || this == DIPINJAM;
    }

    /** Status yang dihitung sebagai pengajuan aktif milik mahasiswa. */
    public boolean aktif() {
        return this == DIAJUKAN || this == DISETUJUI || this == DIPINJAM;
    }
}
