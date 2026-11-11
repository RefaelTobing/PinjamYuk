package sipinjam.layanan;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import sipinjam.model.BookingRuangan;
import sipinjam.model.JadwalRuangan;
import sipinjam.model.Ruangan;
import sipinjam.model.SlotWaktu;
import sipinjam.model.StatusBooking;
import sipinjam.repositori.RepositoriBooking;

/** Pengelolaan jadwal slot ruangan. */
public class LayananBookingRuangan {
    private static final LocalTime BUKA = LocalTime.of(7, 0);
    private static final LocalTime TUTUP = LocalTime.of(21, 0);

    private final RepositoriBooking repoBooking;

    public LayananBookingRuangan(RepositoriBooking repoBooking) {
        this.repoBooking = repoBooking;
    }

    /** Slot acuan satu jam mulai pukul 07.00 sampai 21.00. */
    public List<SlotWaktu> templateSlot() {
        List<SlotWaktu> hasil = new ArrayList<SlotWaktu>();
        for (int jam = BUKA.getHour(); jam < TUTUP.getHour(); jam++) {
            hasil.add(new SlotWaktu(jam, jam + 1));
        }
        return hasil;
    }

    public JadwalRuangan jadwal(Ruangan ruangan, LocalDate tanggal) {
        JadwalRuangan jadwal = new JadwalRuangan(ruangan, tanggal);
        for (BookingRuangan booking : repoBooking.padaTanggal(ruangan, tanggal)) {
            jadwal.tambah(booking);
        }
        return jadwal;
    }

    public List<SlotWaktu> slotKosong(Ruangan ruangan, LocalDate tanggal) {
        return jadwal(ruangan, tanggal).slotKosong(templateSlot());
    }

    public BookingRuangan cariBentrok(Ruangan ruangan, LocalDate tanggal, SlotWaktu slot) {
        return repoBooking.cariBentrok(ruangan, tanggal, slot);
    }

    /**
     * Memperbarui status booking mengikuti waktu berjalan:
     * disetujui menjadi terpakai saat slot dimulai, terpakai menjadi selesai saat slot berakhir.
     */
    public int perbaruiStatusBerjalan(LocalDate hariIni, LocalTime sekarang) {
        int berubah = 0;
        for (BookingRuangan booking : repoBooking.semua()) {
            if (booking.getStatus() == StatusBooking.DISETUJUI
                    && booking.getTanggal().equals(hariIni)
                    && !sekarang.isBefore(booking.getSlot().getJamMulai())
                    && sekarang.isBefore(booking.getSlot().getJamSelesai())) {
                booking.ubahStatus(StatusBooking.TERPAKAI);
                berubah++;
            } else if (booking.getStatus() == StatusBooking.TERPAKAI
                    && (booking.getTanggal().isBefore(hariIni)
                        || (booking.getTanggal().equals(hariIni)
                            && !sekarang.isBefore(booking.getSlot().getJamSelesai())))) {
                booking.ubahStatus(StatusBooking.SELESAI);
                berubah++;
            }
        }
        return berubah;
    }
}
