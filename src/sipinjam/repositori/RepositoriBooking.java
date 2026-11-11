package sipinjam.repositori;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import sipinjam.model.BookingRuangan;
import sipinjam.model.Mahasiswa;
import sipinjam.model.Ruangan;
import sipinjam.model.SlotWaktu;

/** Koleksi booking ruangan dan pemeriksaan bentrok slot. */
public class RepositoriBooking {
    private final List<BookingRuangan> daftar = new ArrayList<BookingRuangan>();

    public void tambah(BookingRuangan booking) {
        daftar.add(booking);
    }

    public List<BookingRuangan> padaTanggal(Ruangan ruangan, LocalDate tanggal) {
        List<BookingRuangan> hasil = new ArrayList<BookingRuangan>();
        for (BookingRuangan booking : daftar) {
            if (booking.getRuangan().getKode().equals(ruangan.getKode())
                    && booking.getTanggal().equals(tanggal)) {
                hasil.add(booking);
            }
        }
        return hasil;
    }

    /** Booking aktif pertama yang slotnya bertumpang tindih, atau null. */
    public BookingRuangan cariBentrok(Ruangan ruangan, LocalDate tanggal, SlotWaktu slot) {
        for (BookingRuangan booking : padaTanggal(ruangan, tanggal)) {
            if (booking.getStatus().mengunciSlot() && booking.getSlot().bertumpangTindih(slot)) {
                return booking;
            }
        }
        return null;
    }

    public int hitungAktif(Mahasiswa mahasiswa) {
        int aktif = 0;
        for (BookingRuangan booking : daftar) {
            if (booking.getPemohon().getUsername().equals(mahasiswa.getUsername())
                    && booking.getStatus().aktif()) {
                aktif++;
            }
        }
        return aktif;
    }

    public boolean adaTunggakan(Mahasiswa mahasiswa) {
        for (BookingRuangan booking : daftar) {
            if (booking.getPemohon().getUsername().equals(mahasiswa.getUsername())
                    && booking.adaTunggakan()) {
                return true;
            }
        }
        return false;
    }

    public List<BookingRuangan> daftarUntuk(Mahasiswa mahasiswa) {
        List<BookingRuangan> hasil = new ArrayList<BookingRuangan>();
        for (BookingRuangan booking : daftar) {
            if (booking.getPemohon().getUsername().equals(mahasiswa.getUsername())) {
                hasil.add(booking);
            }
        }
        return hasil;
    }

    public List<BookingRuangan> denganStatus(sipinjam.model.StatusBooking status) {
        List<BookingRuangan> hasil = new ArrayList<BookingRuangan>();
        for (BookingRuangan booking : daftar) {
            if (booking.getStatus() == status) {
                hasil.add(booking);
            }
        }
        return hasil;
    }

    public List<BookingRuangan> semua() {
        return Collections.unmodifiableList(daftar);
    }

    public String idBerikutnya() {
        return String.format("B%04d", daftar.size() + 1);
    }

    public void kosongkan() {
        daftar.clear();
    }
}
