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
        } catch (java.net.BindException e) {
            System.err.println("====================================================");
            System.err.println("[ERROR] Port " + port + " SUDAH DIGUNAKAN!");
            System.err.println("Kemungkinan server SIPINJAM sudah berjalan di background,");
            System.err.println("atau port 8080 dipakai aplikasi lain (Oracle/Tomcat/XAMPP).");
            System.err.println();
            System.err.println("Solusi:");
            System.err.println("1. Matikan proses java di Task Manager (End Task 'java.exe'),");
            System.err.println("   atau ketik di PowerShell: Stop-Process -Name java -Force");
            System.err.println("2. Atau jalankan di port lain: java -jar sipinjam-server.jar --port 8081");
            System.err.println("====================================================");
        } catch (Exception e) {
            System.err.println("Gagal memulai server backend: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
