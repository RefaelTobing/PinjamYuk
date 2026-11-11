package sipinjam.model;

/** Pengguna yang mengajukan peminjaman dan booking. */
public class Mahasiswa extends Pengguna {
    private final String nim;
    private String programStudi;
    private String noTelepon;
    private boolean aktif;

    public Mahasiswa(String id, String nama, String username, String password,
                     String nim, String programStudi, String noTelepon, boolean aktif) {
        super(id, nama, username, password);
        if (nim == null || nim.trim().isEmpty()) {
            throw new IllegalArgumentException("NIM tidak boleh kosong");
        }
        this.nim = nim.trim();
        this.programStudi = programStudi;
        this.noTelepon = noTelepon;
        this.aktif = aktif;
    }

    @Override
    public Peran getPeran() {
        return Peran.MAHASISWA;
    }

    @Override
    public String tampilkanProfil() {
        return super.tampilkanProfil() + " (" + nim + " - " + programStudi + ")";
    }

    public String getNim() {
        return nim;
    }

    public String getProgramStudi() {
        return programStudi;
    }

    public void setProgramStudi(String programStudi) {
        this.programStudi = programStudi;
    }

    public String getNoTelepon() {
        return noTelepon;
    }

    public void setNoTelepon(String noTelepon) {
        this.noTelepon = noTelepon;
    }

    public boolean isAktif() {
        return aktif;
    }

    public void setAktif(boolean aktif) {
        this.aktif = aktif;
    }
}
