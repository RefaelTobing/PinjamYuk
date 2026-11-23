package sipinjam.api;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import sipinjam.KonteksAplikasi;
import sipinjam.api.handler.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Router pusat yang memetakan URL request ke sub-handler yang spesifik.
 */
public class HttpRouter implements HttpHandler {
    private final AuthHandler authHandler;
    private final InventarisHandler inventarisHandler;
    private final PeminjamanHandler peminjamanHandler;
    private final BookingHandler bookingHandler;
    private final LaporanHandler laporanHandler;

    public HttpRouter(KonteksAplikasi konteks) {
        this.authHandler = new AuthHandler(konteks);
        this.inventarisHandler = new InventarisHandler(konteks);
        this.peminjamanHandler = new PeminjamanHandler(konteks);
        this.bookingHandler = new BookingHandler(konteks);
        this.laporanHandler = new LaporanHandler(konteks);
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (HttpHelper.tanganiPreflight(exchange)) {
            return;
        }

        String path = exchange.getRequestURI().getPath();

        // Halaman indeks: membuka base URL di browser (mis. http://localhost:8080/api)
        // tidak boleh dibalas 404, karena itu bukan salah ketik pengguna melainkan
        // alamat dasar yang memang ditampilkan server saat start.
        if ("/".equals(path) || "/api".equals(path) || "/api/".equals(path)) {
            HttpHelper.kirimSukses(exchange, 200,
                    "Server backend SIPINJAM aktif. Ini halaman indeks API, bukan endpoint data.",
                    indeksApi());
            return;
        }

        if ("/api/health".equals(path)) {
            Map<String, Object> data = new LinkedHashMap<String, Object>();
            data.put("status", "UP");
            data.put("aplikasi", "SIPINJAM (PinjamYuk) Backend Server");
            data.put("waktu", java.time.LocalDateTime.now().toString());
            HttpHelper.kirimSukses(exchange, 200, "Server backend Java berjalan normal", data);
            return;
        }

        if (path.startsWith("/api/auth")) {
            authHandler.handle(exchange);
        } else if (path.startsWith("/api/inventaris")) {
            inventarisHandler.handle(exchange);
        } else if (path.startsWith("/api/peminjaman")) {
            peminjamanHandler.handle(exchange);
        } else if (path.startsWith("/api/booking")) {
            bookingHandler.handle(exchange);
        } else if (path.startsWith("/api/laporan")) {
            laporanHandler.handle(exchange);
        } else {
            Map<String, Object> detail = new LinkedHashMap<String, Object>();
            detail.put("path", path);
            detail.put("petunjuk", "Daftar endpoint yang tersedia: buka GET /api");
            HttpHelper.kirimError(exchange, 404, "Endpoint '" + path + "' tidak ditemukan", "NOT_FOUND", detail);
        }
    }

    /** Ringkasan endpoint yang tersedia, ditampilkan saat base URL dibuka di browser. */
    private Map<String, Object> indeksApi() {
        List<String> endpoint = new ArrayList<String>();
        endpoint.add("GET    /api/health");
        endpoint.add("POST   /api/auth/login");
        endpoint.add("POST   /api/auth/register");
        endpoint.add("GET    /api/auth/me?username=...");
        endpoint.add("GET    /api/auth/users");
        endpoint.add("GET    /api/inventaris/barang");
        endpoint.add("POST   /api/inventaris/barang");
        endpoint.add("PUT    /api/inventaris/barang");
        endpoint.add("GET    /api/inventaris/ruangan");
        endpoint.add("POST   /api/inventaris/ruangan");
        endpoint.add("GET    /api/inventaris/kategori");
        endpoint.add("GET    /api/peminjaman");
        endpoint.add("POST   /api/peminjaman");
        endpoint.add("POST   /api/peminjaman/{id}/persetujuan-pembina");
        endpoint.add("POST   /api/peminjaman/{id}/verifikasi-petugas");
        endpoint.add("POST   /api/peminjaman/{id}/serah-terima");
        endpoint.add("POST   /api/peminjaman/{id}/pengembalian");
        endpoint.add("POST   /api/peminjaman/{id}/batal");
        endpoint.add("GET    /api/booking/jadwal?kodeRuangan=...&tanggal=...");
        endpoint.add("GET    /api/booking");
        endpoint.add("POST   /api/booking");
        endpoint.add("POST   /api/booking/{id}/verifikasi");
        endpoint.add("POST   /api/booking/{id}/batal");
        endpoint.add("GET    /api/laporan/ringkasan");
        endpoint.add("GET    /api/laporan/kategori");
        endpoint.add("GET    /api/laporan/utilisasi-ruangan");
        endpoint.add("GET    /api/laporan/jatuh-tempo");

        Map<String, Object> data = new LinkedHashMap<String, Object>();
        data.put("aplikasi", "SIPINJAM (PinjamYuk) Backend Server");
        data.put("status", "UP");
        data.put("healthCheck", "/api/health");
        data.put("jumlahEndpoint", endpoint.size());
        data.put("endpoint", endpoint);
        return data;
    }
}