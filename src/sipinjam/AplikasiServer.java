package sipinjam;

import sipinjam.api.HttpServerManager;

/**
 * Entry point utama Backend REST API Server untuk SIPINJAM (PinjamYuk).
 * Menyediakan endpoint JSON untuk dikonsumsi oleh Frontend Bebas (React/Web/Mobile).
 */
public class AplikasiServer {

    public static void main(String[] args) {
        int port = 8080;
        String folderData = "data";

        for (int i = 0; i < args.length; i++) {
            if ("--port".equals(args[i]) && i + 1 < args.length) {
                try {
                    port = Integer.parseInt(args[i + 1]);
                } catch (NumberFormatException e) {
                    System.err.println("Format port tidak valid, menggunakan default 8080");
                }
            } else if ("--data".equals(args[i]) && i + 1 < args.length) {
                folderData = args[i + 1];
            }
        }

        try {
            KonteksAplikasi konteks = new KonteksAplikasi(folderData);
            HttpServerManager server = new HttpServerManager(port, konteks);
            server.start();

            Runtime.getRuntime().addShutdownHook(new Thread(new Runnable() {
                @Override
                public void run() {
                    server.stop();
                }
            }));
        } catch (Exception e) {
            System.err.println("Gagal memulai server backend: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
