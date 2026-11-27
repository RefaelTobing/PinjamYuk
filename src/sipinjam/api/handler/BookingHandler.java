package sipinjam.api.handler;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import sipinjam.KonteksAplikasi;
import sipinjam.api.HttpHelper;
import sipinjam.api.json.Json;
import sipinjam.exception.AksesDitolakException;
import sipinjam.exception.AturanDilanggarException;
import sipinjam.model.*;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

/**
 * Handler endpoint pemesanan (booking) ruangan kampus dan jadwal slot waktu 07.00 - 21.00.
 */
public class BookingHandler implements HttpHandler {
    private final KonteksAplikasi konteks;

    public BookingHandler(KonteksAplikasi konteks) {
        this.konteks = konteks;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (HttpHelper.tanganiPreflight(exchange)) {
            return;
        }

        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod().toUpperCase();

        try {
            if ("/api/booking/jadwal".equals(path) && "GET".equals(method)) {
                ambilJadwalRuangan(exchange);
            } else if ("/api/booking".equals(path)) {
                if ("GET".equals(method)) {
                    ambilDaftar(exchange);
                } else if ("POST".equals(method)) {
                    ajukanBooking(exchange);
                } else {
                    HttpHelper.kirimError(exchange, 405, "Method tidak diizinkan", "METHOD_NOT_ALLOWED");
                }
            } else if (path.startsWith("/api/booking/") && "POST".equals(method)) {
                prosesAksi(exchange, path);
            } else {
                HttpHelper.kirimError(exchange, 404, "Endpoint booking tidak ditemukan", "NOT_FOUND");
            }
        } catch (AturanDilanggarException e) {
            HttpHelper.kirimError(exchange, 400, "Pengajuan booking ditolak aturan: " + e.getMessage(), "ATURAN_DILANGGAR");
        } catch (AksesDitolakException e) {
            HttpHelper.kirimError(exchange, 403, "Akses booking ditolak: " + e.getMessage(), "AKSES_DITOLAK");
        } catch (Exception e) {
            HttpHelper.kirimError(exchange, 500, "Kesalahan server: " + e.getMessage(), "INTERNAL_ERROR");
        }
    }

    private void ambilJadwalRuangan(HttpExchange exchange) throws IOException {
        Map<String, String> q = HttpHelper.ambilQueryParams(exchange);
        String kodeRuangan = q.get("kodeRuangan");
        String tglStr = q.get("tanggal");

        if (kodeRuangan == null || tglStr == null) {
            HttpHelper.kirimError(exchange, 400, "Parameter kodeRuangan dan tanggal diperlukan", "BAD_REQUEST");
            return;
        }

        Ruangan ruangan = konteks.getRepoBarang().cariRuangan(kodeRuangan);
        if (ruangan == null) {
            HttpHelper.kirimError(exchange, 404, "Ruangan dengan kode " + kodeRuangan + " tidak ditemukan", "NOT_FOUND");
            return;
        }

        LocalDate tanggal = LocalDate.parse(tglStr);
        List<BookingRuangan> aktif = konteks.getRepoBooking().padaTanggal(ruangan, tanggal);

        // Generate 14 slot: 07:00-08:00 s.d 20:00-21:00
        List<Map<String, Object>> slots = new ArrayList<Map<String, Object>>();
        for (int jam = 7; jam < 21; jam++) {
            LocalTime mulai = LocalTime.of(jam, 0);
            LocalTime selesai = LocalTime.of(jam + 1, 0);
            SlotWaktu slotJam = new SlotWaktu(mulai, selesai);

            boolean terisi = false;
            String bookingId = null;
            String keperluan = null;
            String statusBooking = null;

            for (BookingRuangan b : aktif) {
                if (b.getSlot().bertumpangTindih(slotJam)) {
                    terisi = true;
                    bookingId = b.getId();
                    keperluan = b.getKeperluan();
                    statusBooking = b.getStatus().name();
                    break;
                }
            }

            Map<String, Object> sMap = new LinkedHashMap<String, Object>();
            sMap.put("jamMulai", String.format("%02d:00", jam));
            sMap.put("jamSelesai", String.format("%02d:00", jam + 1));
            sMap.put("status", terisi ? "TERISI" : "KOSONG");
            if (terisi) {
                sMap.put("bookingId", bookingId);
                sMap.put("keperluan", keperluan);
                sMap.put("statusBooking", statusBooking);
            }
            slots.add(sMap);
        }

        Map<String, Object> data = new LinkedHashMap<String, Object>();
        data.put("kodeRuangan", ruangan.getKode());
        data.put("namaRuangan", ruangan.getNama());
        data.put("kapasitas", ruangan.getKapasitas());
        data.put("tanggal", tanggal.toString());
        data.put("slots", slots);

        HttpHelper.kirimSukses(exchange, 200, "Jadwal ketersediaan ruangan", data);
    }

    private void ambilDaftar(HttpExchange exchange) throws IOException {
        Map<String, String> q = HttpHelper.ambilQueryParams(exchange);
        String nim = q.get("nim");
        String status = q.get("status");
        String tglStr = q.get("tanggal");

        List<BookingRuangan> semua = konteks.getRepoBooking().semua();
        List<Map<String, Object>> hasil = new ArrayList<Map<String, Object>>();

        for (BookingRuangan b : semua) {
            if (nim != null && !nim.isEmpty() && !b.getPemohon().getNim().equalsIgnoreCase(nim)) {
                continue;
            }
            if (status != null && !status.isEmpty() && !b.getStatus().name().equalsIgnoreCase(status)) {
                continue;
            }
            if (tglStr != null && !tglStr.isEmpty() && !b.getTanggal().toString().equals(tglStr)) {
                continue;
            }
            hasil.add(petakanBooking(b));
        }

        HttpHelper.kirimSukses(exchange, 200, "Daftar transaksi booking ruangan", hasil);
    }

    private void ajukanBooking(HttpExchange exchange) throws Exception {
        String body = HttpHelper.bacaBody(exchange);
        Map<String, Object> req = Json.parseObject(body);

        String nim = req.get("nim") != null ? req.get("nim").toString().trim() : "";
        String kodeRuangan = req.get("kodeRuangan") != null ? req.get("kodeRuangan").toString().trim() : "";
        String tglStr = req.get("tanggal") != null ? req.get("tanggal").toString().trim() : "";
        String jamMulaiStr = req.get("jamMulai") != null ? req.get("jamMulai").toString().trim() : "";
        String jamSelesaiStr = req.get("jamSelesai") != null ? req.get("jamSelesai").toString().trim() : "";
        int jumlahPeserta = req.get("jumlahPeserta") instanceof Number ? ((Number) req.get("jumlahPeserta")).intValue() : 1;
        String keperluan = req.get("keperluan") != null ? req.get("keperluan").toString().trim() : "";

        if (jamMulaiStr.isEmpty() && req.get("slotMulai") instanceof Number) {
            int sm = ((Number) req.get("slotMulai")).intValue();
            int jam = sm < 7 ? sm + 6 : sm;
            jamMulaiStr = String.format("%02d:00", jam);
        }
        if (jamSelesaiStr.isEmpty() && req.get("slotSelesai") instanceof Number) {
            int ss = ((Number) req.get("slotSelesai")).intValue();
            int jam = ss < 7 ? ss + 7 : ss + 1;
            jamSelesaiStr = String.format("%02d:00", jam);
        }

        if (nim.isEmpty() || kodeRuangan.isEmpty() || tglStr.isEmpty() || jamMulaiStr.isEmpty() || jamSelesaiStr.isEmpty() || keperluan.isEmpty()) {
            HttpHelper.kirimError(exchange, 400, "Semua field booking wajib diisi", "BAD_REQUEST");
            return;
        }

        Mahasiswa pemohon = null;
        for (Mahasiswa m : konteks.getRepoPengguna().daftarMahasiswa()) {
            if (m.getNim().equalsIgnoreCase(nim)) {
                pemohon = m;
                break;
            }
        }
        if (pemohon == null) {
            HttpHelper.kirimError(exchange, 404, "Mahasiswa dengan NIM '" + nim + "' tidak ditemukan", "NOT_FOUND");
            return;
        }

        Ruangan ruangan = konteks.getRepoBarang().cariRuangan(kodeRuangan);
        if (ruangan == null) {
            HttpHelper.kirimError(exchange, 404, "Ruangan '" + kodeRuangan + "' tidak ditemukan", "NOT_FOUND");
            return;
        }

        LocalDate tanggal = LocalDate.parse(tglStr);
        LocalTime mulai = LocalTime.parse(jamMulaiStr.length() == 5 ? jamMulaiStr : jamMulaiStr + ":00");
        LocalTime selesai = LocalTime.parse(jamSelesaiStr.length() == 5 ? jamSelesaiStr : jamSelesaiStr + ":00");
        SlotWaktu slot = new SlotWaktu(mulai, selesai);

        BookingRuangan hasil = konteks.getLayanan().ajukanBooking(pemohon, ruangan, tanggal, slot, jumlahPeserta, keperluan, konteks.hariIni());
        HttpHelper.kirimSukses(exchange, 201, "Pengajuan booking ruangan berhasil dibuat", petakanBooking(hasil));
    }

    private void prosesAksi(HttpExchange exchange, String path) throws Exception {
        String sub = path.substring("/api/booking/".length());
        String[] parts = sub.split("/");
        if (parts.length < 2) {
            HttpHelper.kirimError(exchange, 404, "Aksi booking tidak dikenal", "NOT_FOUND");
            return;
        }

        String id = parts[0];
        String aksi = parts[1];

        BookingRuangan b = konteks.getRepoBooking().cari(id);
        if (b == null) {
            HttpHelper.kirimError(exchange, 404, "Booking dengan ID " + id + " tidak ditemukan", "NOT_FOUND");
            return;
        }

        String body = HttpHelper.bacaBody(exchange);
        Map<String, Object> req = Json.parseObject(body);

        if ("verifikasi".equalsIgnoreCase(aksi)) {
            boolean setuju = Boolean.TRUE.equals(req.get("setuju"));
            String catatan = req.get("catatan") != null ? req.get("catatan").toString().trim() : "";
            konteks.getLayanan().verifikasiBooking(b, setuju, catatan);
            HttpHelper.kirimSukses(exchange, 200, setuju ? "Booking disetujui petugas" : "Booking ditolak petugas", petakanBooking(b));
        } else if ("batal".equalsIgnoreCase(aksi)) {
            double denda = konteks.getLayanan().batalkanBooking(b, konteks.hariIni());
            Map<String, Object> data = petakanBooking(b);
            data.put("dendaPembatalan", denda);
            String pesan = denda > 0 ? "Booking dibatalkan dengan denda Rp" + String.format("%,.0f", denda) : "Booking dibatalkan tanpa denda";
            HttpHelper.kirimSukses(exchange, 200, pesan, data);
        } else {
            HttpHelper.kirimError(exchange, 404, "Aksi " + aksi + " tidak didukung", "NOT_FOUND");
        }
    }

    public static Map<String, Object> petakanBooking(BookingRuangan b) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        map.put("id", b.getId());
        map.put("nim", b.getPemohon().getNim());
        map.put("namaMahasiswa", b.getPemohon().getNama());
        map.put("kodeRuangan", b.getRuangan().getKode());
        map.put("namaRuangan", b.getRuangan().getNama());
        map.put("tanggalPengajuan", b.getTanggalPengajuan().toString());
        map.put("tanggal", b.getTanggal().toString());
        map.put("jamMulai", b.getSlot().getJamMulai().toString());
        map.put("jamSelesai", b.getSlot().getJamSelesai().toString());
        map.put("durasiJam", b.getSlot().durasiJam());
        map.put("jumlahPeserta", b.getJumlahPeserta());
        map.put("keperluan", b.getKeperluan());
        map.put("status", b.getStatus().name());
        map.put("labelStatus", b.getStatus().getLabel());
        map.put("catatanPetugas", b.getCatatanPetugas());
        map.put("dendaPembatalan", b.getDendaPembatalan());
        map.put("dendaLunas", b.isDendaLunas());
        return map;
    }
}
