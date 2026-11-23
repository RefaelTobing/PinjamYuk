package sipinjam.api;

import com.sun.net.httpserver.HttpServer;
import sipinjam.KonteksAplikasi;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

/**
 * Pengelola siklus hidup HTTP Server Java native.
 */
public class HttpServerManager {
    private final int port;
    private final KonteksAplikasi konteks;
    private HttpServer server;

    public HttpServerManager(int port, KonteksAplikasi konteks) {
        this.port = port;
        this.konteks = konteks;
    }

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(port), 0);
        HttpRouter router = new HttpRouter(konteks);

        server.createContext("/api", router);
        // Konteks akar: supaya membuka http://localhost:PORT/ (tanpa /api) juga
        // menampilkan indeks API, bukan 404 HTML bawaan HttpServer.
        server.createContext("/", router);
        server.setExecutor(Executors.newFixedThreadPool(10));
        server.start();

        System.out.println("====================================================");
        System.out.println("  SIPINJAM (PinjamYuk) REST API Server AKTIF");
        System.out.println("  Port        : " + port);
        System.out.println("  Base URL    : http://localhost:" + port + "/api");
        System.out.println("  Health Check: http://localhost:" + port + "/api/health");
        System.out.println("====================================================");
    }

    public void stop() {
        if (server != null) {
            server.stop(0);
            System.out.println("Server backend SIPINJAM dihentikan.");
        }
    }
}
