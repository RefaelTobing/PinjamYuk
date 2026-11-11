package sipinjam.model;

/**
 * Induk seluruh pengguna aplikasi.
 * Seluruh atribut dilindungi (private) dan hanya diakses melalui method.
 */
public abstract class Pengguna {
    private final String id;
    private String nama;
    private final String username;
    private String password;

    protected Pengguna(String id, String nama, String username, String password) {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("Id pengguna tidak boleh kosong");
        }
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username tidak boleh kosong");
        }
        this.id = id.trim();
        this.nama = nama;
        this.username = username.trim();
        this.password = password;
    }

    /** Peran ditentukan oleh subclass, bukan oleh atribut yang bisa diubah. */
    public abstract Peran getPeran();

    public String tampilkanProfil() {
        return getPeran().getLabel() + " - " + nama;
    }

    public boolean cekPassword(String masukan) {
        return password != null && password.equals(masukan);
    }

    public String getId() {
        return id;
    }

    public String getNama() {
        return nama;
    }

    public void setNama(String nama) {
        if (nama == null || nama.trim().isEmpty()) {
            throw new IllegalArgumentException("Nama tidak boleh kosong");
        }
        this.nama = nama.trim();
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        if (password == null || password.trim().length() < 6) {
            throw new IllegalArgumentException("Kata sandi minimal 6 karakter");
        }
        this.password = password;
    }
}
