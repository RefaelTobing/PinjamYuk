package sipinjam.repositori;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import sipinjam.model.Mahasiswa;
import sipinjam.model.Pengguna;

/** Koleksi pengguna dan autentikasi. */
public class RepositoriPengguna {
    private final List<Pengguna> daftar = new ArrayList<Pengguna>();

    public void tambah(Pengguna pengguna) {
        if (pengguna == null) {
            throw new IllegalArgumentException("Pengguna tidak boleh kosong");
        }
        if (cariUsername(pengguna.getUsername()) != null) {
            throw new IllegalArgumentException("Username " + pengguna.getUsername() + " sudah dipakai");
        }
        daftar.add(pengguna);
    }

    public Pengguna cariUsername(String username) {
        for (Pengguna pengguna : daftar) {
            if (pengguna.getUsername().equalsIgnoreCase(username)) {
                return pengguna;
            }
        }
        return null;
    }

    /** Mengembalikan null bila username tidak ada atau kata sandi salah. */
    public Pengguna login(String username, String password) {
        Pengguna pengguna = cariUsername(username);
        if (pengguna != null && pengguna.cekPassword(password)) {
            return pengguna;
        }
        return null;
    }

    public List<Mahasiswa> daftarMahasiswa() {
        List<Mahasiswa> hasil = new ArrayList<Mahasiswa>();
        for (Pengguna pengguna : daftar) {
            if (pengguna instanceof Mahasiswa) {
                hasil.add((Mahasiswa) pengguna);
            }
        }
        return hasil;
    }

    public List<Pengguna> semua() {
        return Collections.unmodifiableList(daftar);
    }

    public String idBerikutnya() {
        return String.format("U%03d", daftar.size() + 1);
    }
}
