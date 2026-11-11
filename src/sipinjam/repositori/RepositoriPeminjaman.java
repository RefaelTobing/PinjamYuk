package sipinjam.repositori;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import sipinjam.model.Barang;
import sipinjam.model.DetailPeminjaman;
import sipinjam.model.Mahasiswa;
import sipinjam.model.Peminjaman;

/** Koleksi peminjaman barang beserta perhitungan pemakaian stok. */
public class RepositoriPeminjaman {
    private final List<Peminjaman> daftar = new ArrayList<Peminjaman>();

    public void tambah(Peminjaman peminjaman) {
        daftar.add(peminjaman);
    }

    public Peminjaman cari(String id) {
        for (Peminjaman peminjaman : daftar) {
            if (peminjaman.getId().equalsIgnoreCase(id)) {
                return peminjaman;
            }
        }
        return null;
    }

    /**
     * Jumlah unit barang yang sudah menahan stok pada rentang tanggal tertentu.
     * Hanya peminjaman berstatus DISETUJUI atau DIPINJAM yang dihitung.
     */
    public int terpakai(Barang barang, LocalDate mulai, LocalDate selesai) {
        int total = 0;
        for (Peminjaman peminjaman : daftar) {
            if (!peminjaman.getStatus().menahanStok()) {
                continue;
            }
            if (!peminjaman.bertumpangTindih(mulai, selesai)) {
                continue;
            }
            for (DetailPeminjaman baris : peminjaman.getDetail()) {
                if (baris.getBarang().getKode().equals(barang.getKode())) {
                    total += baris.getJumlah();
                }
            }
        }
        return total;
    }

    public int hitungAktif(Mahasiswa mahasiswa) {
        int aktif = 0;
        for (Peminjaman peminjaman : daftar) {
            if (peminjaman.getPemohon().getUsername().equals(mahasiswa.getUsername())
                    && peminjaman.getStatus().aktif()) {
                aktif++;
            }
        }
        return aktif;
    }

    public boolean adaTunggakan(Mahasiswa mahasiswa) {
        for (Peminjaman peminjaman : daftar) {
            if (peminjaman.getPemohon().getUsername().equals(mahasiswa.getUsername())
                    && peminjaman.adaTunggakan()) {
                return true;
            }
        }
        return false;
    }

    public List<Peminjaman> daftarUntuk(Mahasiswa mahasiswa) {
        List<Peminjaman> hasil = new ArrayList<Peminjaman>();
        for (Peminjaman peminjaman : daftar) {
            if (peminjaman.getPemohon().getUsername().equals(mahasiswa.getUsername())) {
                hasil.add(peminjaman);
            }
        }
        return hasil;
    }

    public List<Peminjaman> denganStatus(sipinjam.model.StatusPeminjaman status) {
        List<Peminjaman> hasil = new ArrayList<Peminjaman>();
        for (Peminjaman peminjaman : daftar) {
            if (peminjaman.getStatus() == status) {
                hasil.add(peminjaman);
            }
        }
        return hasil;
    }

    /** Peminjaman yang menunggu persetujuan pembina. */
    public List<Peminjaman> menungguPembina() {
        List<Peminjaman> hasil = new ArrayList<Peminjaman>();
        for (Peminjaman peminjaman : daftar) {
            if (peminjaman.getStatus() == sipinjam.model.StatusPeminjaman.DIAJUKAN
                    && peminjaman.butuhPersetujuanPembina()
                    && peminjaman.getIdPembina().isEmpty()) {
                hasil.add(peminjaman);
            }
        }
        return hasil;
    }

    public List<Peminjaman> jatuhTempo(LocalDate hariIni) {
        List<Peminjaman> hasil = new ArrayList<Peminjaman>();
        for (Peminjaman peminjaman : daftar) {
            if (peminjaman.getStatus() == sipinjam.model.StatusPeminjaman.DIPINJAM
                    && peminjaman.getTanggalSelesai().isBefore(hariIni)) {
                hasil.add(peminjaman);
            }
        }
        return hasil;
    }

    public List<Peminjaman> semua() {
        return Collections.unmodifiableList(daftar);
    }

    public String idBerikutnya() {
        return String.format("P%04d", daftar.size() + 1);
    }

    /** Dipakai saat memuat data dari berkas. */
    public void kosongkan() {
        daftar.clear();
    }
}
