package sipinjam.model;

import java.time.Duration;
import java.time.LocalTime;

/**
 * Interval jam pemakaian ruangan.
 * Dua constructor disediakan agar objek dapat dibuat dari LocalTime
 * maupun dari jam bulat (overloading constructor).
 */
public class SlotWaktu {
    private final LocalTime jamMulai;
    private final LocalTime jamSelesai;

    public SlotWaktu(LocalTime jamMulai, LocalTime jamSelesai) {
        if (jamMulai == null || jamSelesai == null) {
            throw new IllegalArgumentException("Jam mulai dan jam selesai wajib diisi");
        }
        if (!jamSelesai.isAfter(jamMulai)) {
            throw new IllegalArgumentException("Jam selesai harus setelah jam mulai");
        }
        this.jamMulai = jamMulai;
        this.jamSelesai = jamSelesai;
    }

    public SlotWaktu(int jamMulai, int jamSelesai) {
        this(LocalTime.of(jamMulai, 0), LocalTime.of(jamSelesai, 0));
    }

    public LocalTime getJamMulai() {
        return jamMulai;
    }

    public LocalTime getJamSelesai() {
        return jamSelesai;
    }

    /** Lama pemakaian dalam satuan jam. */
    public int durasiJam() {
        return (int) Duration.between(jamMulai, jamSelesai).toMinutes() / 60;
    }

    /**
     * Bentrok bila mulai1 < selesai2 dan mulai2 < selesai1.
     * Slot yang berakhir tepat saat slot lain mulai tidak dianggap bentrok.
     */
    public boolean bertumpangTindih(SlotWaktu lain) {
        if (lain == null) {
            return false;
        }
        return jamMulai.isBefore(lain.jamSelesai) && lain.jamMulai.isBefore(jamSelesai);
    }

    public boolean kelipatanJam() {
        return jamMulai.getMinute() == 0 && jamSelesai.getMinute() == 0;
    }

    public boolean diDalam(LocalTime buka, LocalTime tutup) {
        return !jamMulai.isBefore(buka) && !jamSelesai.isAfter(tutup);
    }

    @Override
    public String toString() {
        return String.format("%02d:%02d-%02d:%02d", jamMulai.getHour(), jamMulai.getMinute(),
                jamSelesai.getHour(), jamSelesai.getMinute());
    }
}
