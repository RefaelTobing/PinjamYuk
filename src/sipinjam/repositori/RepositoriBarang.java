package sipinjam.repositori;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import sipinjam.model.Barang;
import sipinjam.model.Ruangan;

/** Koleksi barang dan ruangan beserta pencariannya. */
public class RepositoriBarang {
    private final List<Barang> daftar = new ArrayList<Barang>();

    public void tambah(Barang barang) {
        if (barang == null) {
            throw new IllegalArgumentException("Barang tidak boleh kosong");
        }
        if (cari(barang.getKode()) != null) {
            throw new IllegalArgumentException("Kode " + barang.getKode() + " sudah dipakai");
        }
        daftar.add(barang);
    }

    public Barang cari(String kode) {
        for (Barang barang : daftar) {
            if (barang.getKode().equalsIgnoreCase(kode)) {
                return barang;
            }
        }
        return null;
    }

    public Ruangan cariRuangan(String kode) {
        Barang barang = cari(kode);
        return barang instanceof Ruangan ? (Ruangan) barang : null;
    }

    /** Hanya barang inventaris, tanpa ruangan. */
    public List<Barang> daftarBarang() {
        List<Barang> hasil = new ArrayList<Barang>();
        for (Barang barang : daftar) {
            if (!barang.dikelolaPerSlot()) {
                hasil.add(barang);
            }
        }
        return hasil;
    }

    public List<Ruangan> daftarRuangan() {
        List<Ruangan> hasil = new ArrayList<Ruangan>();
        for (Barang barang : daftar) {
            if (barang instanceof Ruangan) {
                hasil.add((Ruangan) barang);
            }
        }
        return hasil;
    }

    public List<Barang> semua() {
        return Collections.unmodifiableList(daftar);
    }

    public int jumlah() {
        return daftar.size();
    }
}
