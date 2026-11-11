package sipinjam.model;

/** Pengguna yang menyetujui pengajuan tertentu. */
public class DosenPembina extends Pengguna {
    private String nidn;
    private String jabatan;

    public DosenPembina(String id, String nama, String username, String password,
                        String nidn, String jabatan) {
        super(id, nama, username, password);
        this.nidn = nidn;
        this.jabatan = jabatan;
    }

    @Override
    public Peran getPeran() {
        return Peran.PEMBINA;
    }

    @Override
    public String tampilkanProfil() {
        return super.tampilkanProfil() + " (" + nidn + " - " + jabatan + ")";
    }

    public String getNidn() {
        return nidn;
    }

    public void setNidn(String nidn) {
        this.nidn = nidn;
    }

    public String getJabatan() {
        return jabatan;
    }

    public void setJabatan(String jabatan) {
        this.jabatan = jabatan;
    }
}
