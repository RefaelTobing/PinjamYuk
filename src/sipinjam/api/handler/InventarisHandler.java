package sipinjam.api.handler;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import sipinjam.KonteksAplikasi;
import sipinjam.api.HttpHelper;
import sipinjam.api.json.Json;
import sipinjam.model.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.*;

/**
 * Handler endpoint master data barang inventaris, ruangan, dan cek stok ketersediaan per tanggal.
 */
public class InventarisHandler implements HttpHandler {
    private final KonteksAplikasi konteks;

    public InventarisHandler(KonteksAplikasi konteks) {
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
            if ("/api/inventaris/barang".equals(path)) {
                if ("GET".equals(method)) {
                    ambilDaftarBarang(exchange);
                } else if ("POST".equals(method)) {
                    tambahBarang(exchange);
                } else if ("PUT".equals(method)) {
                    ubahBarang(exchange);
                } else {
                    HttpHelper.kirimError(exchange, 405, "Method tidak diizinkan", "METHOD_NOT_ALLOWED");
                }
            } else if ("/api/inventaris/ruangan".equals(path)) {
                if ("GET".equals(method)) {
                    ambilDaftarRuangan(exchange);
                } else if ("POST".equals(method)) {
                    tambahRuangan(exchange);
                } else {
                    HttpHelper.kirimError(exchange, 405, "Method tidak diizinkan", "METHOD_NOT_ALLOWED");
                }
            } else if ("/api/inventaris/kategori".equals(path) && "GET".equals(method)) {
                ambilKategori(exchange);
            } else {
                HttpHelper.kirimError(exchange, 404, "Endpoint inventaris tidak ditemukan", "NOT_FOUND");
            }
        } catch (Exception e) {
            HttpHelper.kirimError(exchange, 500, "Kesalahan server: " + e.getMessage(), "INTERNAL_ERROR");
        }
    }

    private void ambilDaftarBarang(HttpExchange exchange) throws IOException {
        Map<String, String> q = HttpHelper.ambilQueryParams(exchange);
        String katFilter = q.get("kategori");
        String cari = q.get("cari");
        String mulaiStr = q.get("mulai");
        String selesaiStr = q.get("selesai");

        LocalDate tglMulai = null;
        LocalDate tglSelesai = null;
        if (mulaiStr != null && !mulaiStr.isEmpty() && selesaiStr != null && !selesaiStr.isEmpty()) {
            try {
                tglMulai = LocalDate.parse(mulaiStr);
                tglSelesai = LocalDate.parse(selesaiStr);
            } catch (Exception ignored) {}
        }

        List<Barang> semua = konteks.getRepoBarang().daftarBarang();
        List<Map<String, Object>> hasil = new ArrayList<Map<String, Object>>();

        for (Barang b : semua) {
            if (katFilter != null && !katFilter.isEmpty() && !b.getKategori().getKode().equalsIgnoreCase(katFilter)) {
                continue;
            }
            if (cari != null && !cari.isEmpty()) {
                String keyword = cari.toLowerCase();
                if (!b.getNama().toLowerCase().contains(keyword) && !b.getKode().toLowerCase().contains(keyword)) {
                    continue;
                }
            }

            Map<String, Object> map = petakanBarang(b);
            if (tglMulai != null && tglSelesai != null) {
                int terpakai = konteks.getKetersediaan().terpakai(b, tglMulai, tglSelesai);
                int stokTersedia = konteks.getKetersediaan().sisaStok(b, tglMulai, tglSelesai);
                map.put("terpakai", terpakai);
                map.put("stokTersedia", stokTersedia);
            } else {
                map.put("stokTersedia", b.getStok());
            }
            hasil.add(map);
        }

        HttpHelper.kirimSukses(exchange, 200, "Daftar inventaris barang", hasil);
    }

    private void tambahBarang(HttpExchange exchange) throws IOException {
        String body = HttpHelper.bacaBody(exchange);
        Map<String, Object> req = Json.parseObject(body);

        String kode = req.get("kode") != null ? req.get("kode").toString().trim() : "";
        String nama = req.get("nama") != null ? req.get("nama").toString().trim() : "";
        String kodeKat = req.get("kategori") != null ? req.get("kategori").toString().trim() : "UMUM";
        String jenis = req.get("jenis") != null ? req.get("jenis").toString().trim() : "ELEKTRONIK";
        int stok = req.get("stok") instanceof Number ? ((Number) req.get("stok")).intValue() : 1;
        double harga = req.get("hargaSatuan") instanceof Number ? ((Number) req.get("hargaSatuan")).doubleValue() : 0.0;
        boolean perluPersetujuan = Boolean.TRUE.equals(req.get("perluPersetujuan"));

        if (kode.isEmpty() || nama.isEmpty()) {
            HttpHelper.kirimError(exchange, 400, "Kode dan nama barang wajib diisi", "BAD_REQUEST");
            return;
        }

        if (konteks.getRepoBarang().cari(kode) != null) {
            HttpHelper.kirimError(exchange, 400, "Kode barang '" + kode + "' sudah digunakan", "KODE_DUPLIKAT");
            return;
        }

        KategoriBarang kategori = new KategoriBarang(kodeKat, kodeKat);
        Barang b;
        if ("ALAT_LAB".equalsIgnoreCase(jenis)) {
            b = new AlatLaboratorium(kode, nama, kategori, stok, harga, perluPersetujuan);
        } else if ("FURNITUR".equalsIgnoreCase(jenis)) {
            b = new BarangFurnitur(kode, nama, kategori, stok, harga, perluPersetujuan);
        } else {
            b = new BarangElektronik(kode, nama, kategori, stok, harga, perluPersetujuan);
        }

        konteks.getRepoBarang().tambah(b);
        konteks.getPenyimpanan().simpan();

        HttpHelper.kirimSukses(exchange, 201, "Barang baru berhasil ditambahkan", petakanBarang(b));
    }

    private void ubahBarang(HttpExchange exchange) throws IOException {
        String body = HttpHelper.bacaBody(exchange);
        Map<String, Object> req = Json.parseObject(body);

        String kode = req.get("kode") != null ? req.get("kode").toString().trim() : "";
        Barang b = konteks.getRepoBarang().cari(kode);
        if (b == null) {
            HttpHelper.kirimError(exchange, 404, "Barang dengan kode " + kode + " tidak ditemukan", "NOT_FOUND");
            return;
        }

        if (req.containsKey("nama")) b.setNama(req.get("nama").toString().trim());
        if (req.containsKey("stok") && req.get("stok") instanceof Number) {
            b.setStok(((Number) req.get("stok")).intValue());
        }
        if (req.containsKey("hargaSatuan") && req.get("hargaSatuan") instanceof Number) {
            b.setHargaSatuan(((Number) req.get("hargaSatuan")).doubleValue());
        }
        if (req.containsKey("perluPersetujuan")) {
            b.setPerluPersetujuan(Boolean.TRUE.equals(req.get("perluPersetujuan")));
        }

        konteks.getPenyimpanan().simpan();
        HttpHelper.kirimSukses(exchange, 200, "Data barang berhasil diperbarui", petakanBarang(b));
    }

    private void ambilDaftarRuangan(HttpExchange exchange) throws IOException {
        List<Ruangan> daftar = konteks.getRepoBarang().daftarRuangan();
        List<Map<String, Object>> hasil = new ArrayList<Map<String, Object>>();
        for (Ruangan r : daftar) {
            hasil.add(petakanRuangan(r));
        }
        HttpHelper.kirimSukses(exchange, 200, "Daftar ruangan", hasil);
    }

    private void tambahRuangan(HttpExchange exchange) throws IOException {
        String body = HttpHelper.bacaBody(exchange);
        Map<String, Object> req = Json.parseObject(body);

        String kode = req.get("kode") != null ? req.get("kode").toString().trim() : "";
        String nama = req.get("nama") != null ? req.get("nama").toString().trim() : "";
        int kapasitas = req.get("kapasitas") instanceof Number ? ((Number) req.get("kapasitas")).intValue() : 20;
        String fasilitas = req.get("fasilitas") != null ? req.get("fasilitas").toString().trim() : "-";

        if (kode.isEmpty() || nama.isEmpty()) {
            HttpHelper.kirimError(exchange, 400, "Kode dan nama ruangan wajib diisi", "BAD_REQUEST");
            return;
        }

        if (konteks.getRepoBarang().cari(kode) != null) {
            HttpHelper.kirimError(exchange, 400, "Kode ruangan '" + kode + "' sudah digunakan", "KODE_DUPLIKAT");
            return;
        }

        Ruangan r = new Ruangan(kode, nama, new KategoriBarang("RNG", "Ruangan"), kapasitas, fasilitas);
        konteks.getRepoBarang().tambah(r);
        konteks.getPenyimpanan().simpan();

        HttpHelper.kirimSukses(exchange, 201, "Ruangan berhasil ditambahkan", petakanRuangan(r));
    }

    private void ambilKategori(HttpExchange exchange) throws IOException {
        Set<String> kategoriSet = new LinkedHashSet<String>();
        for (Barang b : konteks.getRepoBarang().semua()) {
            if (b.getKategori() != null) {
                kategoriSet.add(b.getKategori().getNama());
            }
        }
        HttpHelper.kirimSukses(exchange, 200, "Daftar kategori inventaris", new ArrayList<String>(kategoriSet));
    }

    public static Map<String, Object> petakanBarang(Barang b) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        map.put("kode", b.getKode());
        map.put("nama", b.getNama());
        map.put("kategori", b.getKategori() != null ? b.getKategori().getNama() : "");
        map.put("kodeKategori", b.getKategori() != null ? b.getKategori().getKode() : "");
        map.put("jenis", b.getJenisBarang());
        map.put("stok", b.getStok());
        map.put("hargaSatuan", b.getHargaSatuan());
        map.put("perluPersetujuan", b.isPerluPersetujuan());
        map.put("tarifHarian", b.tarifHarian());
        map.put("dikelolaPerSlot", b.dikelolaPerSlot());
        return map;
    }

    public static Map<String, Object> petakanRuangan(Ruangan r) {
        Map<String, Object> map = petakanBarang(r);
        map.put("kapasitas", r.getKapasitas());
        map.put("fasilitas", r.getFasilitas());
        return map;
    }
}
