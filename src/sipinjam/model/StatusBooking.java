package sipinjam.model;

/** Status siklus booking ruangan. */
public enum StatusBooking {
    DIAJUKAN("Diajukan"),
    DISETUJUI("Disetujui"),
    TERPAKAI("Terpakai"),
    SELESAI("Selesai"),
    DITOLAK("Ditolak"),
    DIBATALKAN("Dibatalkan");

    private final String label;

    StatusBooking(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public boolean bolehKe(StatusBooking tujuan) {
        switch (this) {
            case DIAJUKAN:
                return tujuan == DISETUJUI || tujuan == DITOLAK || tujuan == DIBATALKAN;
            case DISETUJUI:
                return tujuan == TERPAKAI || tujuan == DIBATALKAN || tujuan == DITOLAK;
            case TERPAKAI:
                return tujuan == SELESAI;
            default:
                return false;
        }
    }

    /** Status yang mengunci slot sehingga tidak dapat diajukan orang lain. */
    public boolean mengunciSlot() {
        return this == DIAJUKAN || this == DISETUJUI || this == TERPAKAI;
    }

    public boolean aktif() {
        return mengunciSlot();
    }
}
