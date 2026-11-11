package sipinjam.model;

/** Peran pengguna aplikasi. */
public enum Peran {
    MAHASISWA("Mahasiswa"),
    PETUGAS("Petugas Sarana dan Prasarana"),
    PEMBINA("Dosen Pembina");

    private final String label;

    Peran(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
