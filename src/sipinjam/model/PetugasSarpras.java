package sipinjam.model;

/** Pengguna yang mengelola inventaris dan memverifikasi pengajuan. */
public class PetugasSarpras extends Pengguna {
    private String nip;
    private String unitKerja;

    public PetugasSarpras(String id, String nama, String username, String password,
                           String nip, String unitKerja) {
        super(id, nama, username, password);
        this.nip = nip;
        this.unitKerja = unitKerja;
    }

    @Override
    public Peran getPeran() {
        return Peran.PETUGAS;
    }

    @Override
    public String tampilkanProfil() {
        return super.tampilkanProfil() + " (" + nip + " - " + unitKerja + ")";
    }

    public String getNip() {
        return nip;
    }

    public void setNip(String nip) {
        this.nip = nip;
    }

    public String getUnitKerja() {
        return unitKerja;
    }

    public void setUnitKerja(String unitKerja) {
        this.unitKerja = unitKerja;
    }
}
