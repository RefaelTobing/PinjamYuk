package sipinjam.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/** Kumpulan booking pada satu ruangan untuk satu tanggal. */
public class JadwalRuangan {
    private final Ruangan ruangan;
    private final LocalDate tanggal;
    private final List<BookingRuangan> daftar;

    public JadwalRuangan(Ruangan ruangan, LocalDate tanggal) {
        this.ruangan = ruangan;
        this.tanggal = tanggal;
        this.daftar = new ArrayList<BookingRuangan>();
    }

    public void tambah(BookingRuangan booking) {
        if (booking != null && booking.getTanggal().equals(tanggal)
                && booking.getRuangan().getKode().equals(ruangan.getKode())) {
            daftar.add(booking);
        }
    }

    /** Booking aktif yang bertumpang tindih dengan slot yang diminta. */
    public BookingRuangan cariBentrok(SlotWaktu slot) {
        for (BookingRuangan booking : daftar) {
            if (booking.getStatus().mengunciSlot() && booking.getSlot().bertumpangTindih(slot)) {
                return booking;
            }
        }
        return null;
    }

    /** Slot dari daftar acuan yang belum dipakai booking aktif. */
    public List<SlotWaktu> slotKosong(List<SlotWaktu> acuan) {
        List<SlotWaktu> hasil = new ArrayList<SlotWaktu>();
        for (SlotWaktu slot : acuan) {
            if (cariBentrok(slot) == null) {
                hasil.add(slot);
            }
        }
        return hasil;
    }

    public List<BookingRuangan> getDaftar() {
        return Collections.unmodifiableList(daftar);
    }

    public Ruangan getRuangan() {
        return ruangan;
    }

    public LocalDate getTanggal() {
        return tanggal;
    }
}
