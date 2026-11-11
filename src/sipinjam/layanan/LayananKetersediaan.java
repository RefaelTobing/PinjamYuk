package sipinjam.layanan;

import java.time.LocalDate;

import sipinjam.model.Barang;
import sipinjam.repositori.RepositoriPeminjaman;

/** Menghitung sisa stok barang pada rentang tanggal tertentu. */
public class LayananKetersediaan {
    private final RepositoriPeminjaman repoPeminjaman;

    public LayananKetersediaan(RepositoriPeminjaman repoPeminjaman) {
        this.repoPeminjaman = repoPeminjaman;
    }

    public int terpakai(Barang barang, LocalDate mulai, LocalDate selesai) {
        return repoPeminjaman.terpakai(barang, mulai, selesai);
    }

    public int sisaStok(Barang barang, LocalDate mulai, LocalDate selesai) {
        return Math.max(0, barang.getStok() - terpakai(barang, mulai, selesai));
    }

    public boolean tersedia(Barang barang, int jumlah, LocalDate mulai, LocalDate selesai) {
        return sisaStok(barang, mulai, selesai) >= jumlah;
    }
}
