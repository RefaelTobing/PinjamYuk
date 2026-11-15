package sipinjam.api;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import sipinjam.KonteksAplikasi;
import sipinjam.api.handler.*;

import java.io.IOException;
import java.util.LinkedHashMap;
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
            HttpHelper.kirimError(exchange, 404, "Endpoint '" + path + "' tidak ditemukan", "NOT_FOUND");
        }
    }
}
