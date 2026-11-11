package sipinjam.layanan;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import sipinjam.model.BookingRuangan;
import sipinjam.model.DetailPeminjaman;
import sipinjam.model.Peminjaman;

/** Rekap peminjaman, keterlambatan, dan utilisasi ruangan. */
public class RekapPeminjaman {

    public Map<String, Integer> perKategori(List<Peminjaman> daftar) {
        Map<String, Integer> hasil = new LinkedHashMap<String, Integer>();
        for (Peminjaman peminjaman : daftar) {
            for (DetailPeminjaman baris : peminjaman.getDetail()) {
                String kategori = baris.getBarang().getKategori() == null
                        ? "Lainnya" : baris.getBarang().getKategori().getNama();
                Integer lama = hasil.get(kategori);
                hasil.put(kategori, (lama == null ? 0 : lama) + baris.getJumlah());
            }
        }
        return hasil;
    }

    public double tingkatKeterlambatan(List<Peminjaman> daftar) {
        int kembali = 0;
        int terlambat = 0;
        for (Peminjaman peminjaman : daftar) {
            if (peminjaman.getPengembalian() == null) {
                continue;
            }
            kembali++;
            if (peminjaman.hariTerlambat(peminjaman.getPengembalian().getTanggalKembali()) > 0) {
                terlambat++;
            }
        }
        return kembali == 0 ? 0.0 : (terlambat * 100.0 / kembali);
    }

    public Map<String, Integer> utilisasiPerJam(List<BookingRuangan> daftar) {
        Map<String, Integer> hasil = new LinkedHashMap<String, Integer>();
        for (BookingRuangan booking : daftar) {
            String jam = String.format("%02d:00", booking.getSlot().getJamMulai().getHour());
            Integer lama = hasil.get(jam);
            hasil.put(jam, (lama == null ? 0 : lama) + 1);
        }
        return hasil;
    }

    public int jamTerpakai(List<BookingRuangan> daftar) {
        int total = 0;
        for (BookingRuangan booking : daftar) {
            total += booking.getSlot().durasiJam();
        }
        return total;
    }

    public double totalDenda(List<Peminjaman> daftar) {
        double total = 0.0;
        for (Peminjaman peminjaman : daftar) {
            if (peminjaman.getPengembalian() != null) {
                total += peminjaman.getPengembalian().getTotalDenda();
            }
        }
        return total;
    }
}
