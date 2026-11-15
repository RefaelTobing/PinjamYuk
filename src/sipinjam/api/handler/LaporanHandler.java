package sipinjam.api.handler;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import sipinjam.KonteksAplikasi;
import sipinjam.api.HttpHelper;
import sipinjam.layanan.RekapPeminjaman;
import sipinjam.model.BookingRuangan;
import sipinjam.model.DetailPeminjaman;
import sipinjam.model.Peminjaman;

import java.io.IOException;
import java.util.*;

/**
 * Handler endpoint analitik, rekapitulasi inventaris, dan peringatan jatuh tempo.
 */
public class LaporanHandler implements HttpHandler {
    private final KonteksAplikasi konteks;

    public LaporanHandler(KonteksAplikasi konteks) {
        this.konteks = konteks;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (HttpHelper.tanganiPreflight(exchange)) {
            return;
        }

        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod().toUpperCase();

        if (!"GET".equals(method)) {
            HttpHelper.kirimError(exchange, 405, "Method tidak diizinkan", "METHOD_NOT_ALLOWED");
            return;
        }

        try {
            if ("/api/laporan/ringkasan".equals(path)) {
                laporanRingkasan(exchange);
            } else if ("/api/laporan/kategori".equals(path)) {
                laporanKategori(exchange);
            } else if ("/api/laporan/utilisasi-ruangan".equals(path)) {
                laporanUtilisasi(exchange);
            } else if ("/api/laporan/jatuh-tempo".equals(path)) {
                laporanJatuhTempo(exchange);
            } else {
                HttpHelper.kirimError(exchange, 404, "Endpoint laporan tidak ditemukan", "NOT_FOUND");
            }
        } catch (Exception e) {
            HttpHelper.kirimError(exchange, 500, "Kesalahan server: " + e.getMessage(), "INTERNAL_ERROR");
        }
    }

    private void laporanRingkasan(HttpExchange exchange) throws IOException {
        List<Peminjaman> peminjamanList = konteks.getRepoPeminjaman().semua();
        List<BookingRuangan> bookingList = konteks.getRepoBooking().semua();
        RekapPeminjaman rekap = konteks.getRekap();

        int peminjamanAktif = konteks.getLayanan().peminjamanAktif().size();
        int bookingAktif = konteks.getRepoBooking().cariAktif().size();
        int kasusJatuhTempo = konteks.getLayanan().jatuhTempo(konteks.hariIni()).size();
        double dendaPeminjaman = rekap.totalDenda(peminjamanList);
        double tingkatTelat = rekap.tingkatKeterlambatan(peminjamanList);

        Map<String, Object> data = new LinkedHashMap<String, Object>();
        data.put("totalPeminjamanAktif", peminjamanAktif);
        data.put("totalBookingAktif", bookingAktif);
        data.put("kasusJatuhTempo", kasusJatuhTempo);
        data.put("totalDenda", dendaPeminjaman);
        data.put("tingkatKeterlambatanPersen", tingkatTelat);
        data.put("totalBarang", konteks.getRepoBarang().daftarBarang().size());
        data.put("totalRuangan", konteks.getRepoBarang().daftarRuangan().size());

        HttpHelper.kirimSukses(exchange, 200, "Ringkasan metrik dashboard", data);
    }

    private void laporanKategori(HttpExchange exchange) throws IOException {
        Map<String, Integer> perKat = konteks.getRekap().perKategori(konteks.getRepoPeminjaman().semua());
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        int total = 0;
        for (int v : perKat.values()) total += v;

        for (Map.Entry<String, Integer> e : perKat.entrySet()) {
            Map<String, Object> it = new LinkedHashMap<String, Object>();
            it.put("kategori", e.getKey());
            it.put("jumlahPeminjaman", e.getValue());
            it.put("persentase", total == 0 ? 0 : Math.round((e.getValue() * 100.0 / total) * 10.0) / 10.0);
            list.add(it);
        }

        HttpHelper.kirimSukses(exchange, 200, "Rekapitulasi peminjaman per kategori", list);
    }

    private void laporanUtilisasi(HttpExchange exchange) throws IOException {
        Map<String, Integer> utilisasi = konteks.getRekap().utilisasiPerJam(konteks.getRepoBooking().semua());
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        for (int jam = 7; jam < 21; jam++) {
            String jamKey = String.format("%02d:00", jam);
            int count = utilisasi.containsKey(jamKey) ? utilisasi.get(jamKey) : 0;
            Map<String, Object> it = new LinkedHashMap<String, Object>();
            it.put("slotJam", jamKey);
            it.put("jumlahBooking", count);
            list.add(it);
        }
        HttpHelper.kirimSukses(exchange, 200, "Utilisasi ruangan per jam operasional", list);
    }

    private void laporanJatuhTempo(HttpExchange exchange) throws IOException {
        List<Peminjaman> list = konteks.getLayanan().jatuhTempo(konteks.hariIni());
        List<Map<String, Object>> hasil = new ArrayList<Map<String, Object>>();
        for (Peminjaman p : list) {
            Map<String, Object> it = PeminjamanHandler.petakanPeminjaman(p);
            long telat = p.hariTerlambat(konteks.hariIni());
            it.put("hariTerlambat", telat);
            hasil.add(it);
        }
        HttpHelper.kirimSukses(exchange, 200, "Daftar peminjaman mendekati/melewati batas jatuh tempo", hasil);
    }
}
