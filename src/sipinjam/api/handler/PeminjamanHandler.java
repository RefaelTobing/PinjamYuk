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
import java.util.*;

/**
 * Handler endpoint transaksi peminjaman barang inventaris kampus.
 */
public class PeminjamanHandler implements HttpHandler {
    private final KonteksAplikasi konteks;

    public PeminjamanHandler(KonteksAplikasi konteks) {
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
            if ("/api/peminjaman".equals(path)) {
                if ("GET".equals(method)) {
                    ambilDaftar(exchange);
                } else if ("POST".equals(method)) {
                    ajukanPeminjaman(exchange);
                } else {
                    HttpHelper.kirimError(exchange, 405, "Method tidak diizinkan", "METHOD_NOT_ALLOWED");
                }
            } else if (path.startsWith("/api/peminjaman/") && "POST".equals(method)) {
                prosesAksi(exchange, path);
            } else {
                HttpHelper.kirimError(exchange, 404, "Endpoint peminjaman tidak ditemukan", "NOT_FOUND");
            }
        } catch (AturanDilanggarException e) {
            HttpHelper.kirimError(exchange, 400, "Pengajuan ditolak aturan: " + e.getMessage(), "ATURAN_DILANGGAR");
        } catch (AksesDitolakException e) {
            HttpHelper.kirimError(exchange, 403, "Akses ditolak: " + e.getMessage(), "AKSES_DITOLAK");
        } catch (Exception e) {
            HttpHelper.kirimError(exchange, 500, "Kesalahan server: " + e.getMessage(), "INTERNAL_ERROR");
        }
    }

    private void ambilDaftar(HttpExchange exchange) throws IOException {
        Map<String, String> q = HttpHelper.ambilQueryParams(exchange);
        String nim = q.get("nim");
        String status = q.get("status");
        boolean perluPembina = "true".equalsIgnoreCase(q.get("menungguPembina"));
        boolean jatuhTempo = "true".equalsIgnoreCase(q.get("jatuhTempo"));

        List<Peminjaman> sumber;
        if (perluPembina) {
            sumber = konteks.getLayanan().menungguPembina();
        } else if (jatuhTempo) {
            sumber = konteks.getLayanan().jatuhTempo(konteks.hariIni());
        } else {
            sumber = konteks.getRepoPeminjaman().semua();
        }

        List<Map<String, Object>> hasil = new ArrayList<Map<String, Object>>();
        for (Peminjaman p : sumber) {
            if (nim != null && !nim.isEmpty() && !p.getPemohon().getNim().equalsIgnoreCase(nim)) {
                continue;
            }
            if (status != null && !status.isEmpty() && !p.getStatus().name().equalsIgnoreCase(status)) {
                continue;
            }
            hasil.add(petakanPeminjaman(p));
        }

        HttpHelper.kirimSukses(exchange, 200, "Daftar transaksi peminjaman", hasil);
    }

    @SuppressWarnings("unchecked")
    private void ajukanPeminjaman(HttpExchange exchange) throws Exception {
        String body = HttpHelper.bacaBody(exchange);
        Map<String, Object> req = Json.parseObject(body);

        String nim = req.get("nim") != null ? req.get("nim").toString().trim() : "";
        String tglMulaiStr = req.get("tanggalMulai") != null ? req.get("tanggalMulai").toString().trim() : "";
        String tglSelesaiStr = req.get("tanggalSelesai") != null ? req.get("tanggalSelesai").toString().trim() : "";
        String keperluan = req.get("keperluan") != null ? req.get("keperluan").toString().trim() : "";

        if (nim.isEmpty() || tglMulaiStr.isEmpty() || tglSelesaiStr.isEmpty() || keperluan.isEmpty()) {
            HttpHelper.kirimError(exchange, 400, "NIM, tanggal mulai, tanggal selesai, dan keperluan wajib diisi", "BAD_REQUEST");
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

        LocalDate tglMulai = LocalDate.parse(tglMulaiStr);
        LocalDate tglSelesai = LocalDate.parse(tglSelesaiStr);

        Object itemsObj = req.get("items");
        if (!(itemsObj instanceof List<?>)) {
            HttpHelper.kirimError(exchange, 400, "Daftar barang (items) harus berupa array", "BAD_REQUEST");
            return;
        }

        List<Object> rawList = (List<Object>) itemsObj;
        if (rawList.isEmpty()) {
            HttpHelper.kirimError(exchange, 400, "Minimal harus memilih satu barang", "BAD_REQUEST");
            return;
        }

        List<DetailPeminjaman> detailList = new ArrayList<DetailPeminjaman>();
        for (Object itemObj : rawList) {
            if (itemObj instanceof Map<?, ?>) {
                Map<String, Object> itemMap = (Map<String, Object>) itemObj;
                String kodeBarang = itemMap.get("kodeBarang") != null ? itemMap.get("kodeBarang").toString().trim() : "";
                int jumlah = itemMap.get("jumlah") instanceof Number ? ((Number) itemMap.get("jumlah")).intValue() : 1;

                Barang barang = konteks.getRepoBarang().cari(kodeBarang);
                if (barang == null) {
                    HttpHelper.kirimError(exchange, 404, "Barang dengan kode " + kodeBarang + " tidak ditemukan", "NOT_FOUND");
                    return;
                }
                detailList.add(new DetailPeminjaman(barang, jumlah, KondisiBarang.BAIK));
            }
        }

        Peminjaman hasil = konteks.getLayanan().ajukanBarang(pemohon, detailList, tglMulai, tglSelesai, keperluan, konteks.hariIni());
        HttpHelper.kirimSukses(exchange, 201, "Pengajuan peminjaman barang berhasil dibuat", petakanPeminjaman(hasil));
    }

    @SuppressWarnings("unchecked")
    private void prosesAksi(HttpExchange exchange, String path) throws Exception {
        String sub = path.substring("/api/peminjaman/".length());
        String[] parts = sub.split("/");
        if (parts.length < 2) {
            HttpHelper.kirimError(exchange, 404, "Aksi tidak dikenal", "NOT_FOUND");
            return;
        }

        String id = parts[0];
        String aksi = parts[1];

        Peminjaman p = konteks.getRepoPeminjaman().cari(id);
        if (p == null) {
            HttpHelper.kirimError(exchange, 404, "Peminjaman dengan ID " + id + " tidak ditemukan", "NOT_FOUND");
            return;
        }

        String body = HttpHelper.bacaBody(exchange);
        Map<String, Object> req = Json.parseObject(body);

        if ("persetujuan-pembina".equalsIgnoreCase(aksi)) {
            boolean setuju = Boolean.TRUE.equals(req.get("setuju"));
            String catatan = req.get("catatan") != null ? req.get("catatan").toString().trim() : "";
            DosenPembina pembina = null;
            for (Pengguna u : konteks.getRepoPengguna().semua()) {
                if (u instanceof DosenPembina) {
                    pembina = (DosenPembina) u;
                    break;
                }
            }
            if (pembina == null) {
                pembina = new DosenPembina("U002", "Dosen Pembina", "pembina", "pembina123", "0712345678", "Pembina");
            }

            if (setuju) {
                konteks.getLayanan().setujuiPembina(p, pembina);
                HttpHelper.kirimSukses(exchange, 200, "Pengajuan berhasil disetujui dosen pembina", petakanPeminjaman(p));
            } else {
                konteks.getLayanan().tolakPembina(p, pembina, catatan);
                HttpHelper.kirimSukses(exchange, 200, "Pengajuan ditolak oleh dosen pembina", petakanPeminjaman(p));
            }
        } else if ("verifikasi-petugas".equalsIgnoreCase(aksi)) {
            boolean setuju = Boolean.TRUE.equals(req.get("setuju"));
            String catatan = req.get("catatan") != null ? req.get("catatan").toString().trim() : "";
            konteks.getLayanan().verifikasiPetugas(p, setuju, catatan);
            HttpHelper.kirimSukses(exchange, 200, setuju ? "Pengajuan disetujui petugas" : "Pengajuan ditolak petugas", petakanPeminjaman(p));
        } else if ("serah-terima".equalsIgnoreCase(aksi)) {
            konteks.getLayanan().serahTerima(p);
            HttpHelper.kirimSukses(exchange, 200, "Serah terima barang berhasil dicatat, status berubah jadi DIPINJAM", petakanPeminjaman(p));
        } else if ("pengembalian".equalsIgnoreCase(aksi)) {
            String tglKembaliStr = req.get("tanggalKembali") != null ? req.get("tanggalKembali").toString().trim() : "";
            LocalDate tglKembali = tglKembaliStr.isEmpty() ? konteks.hariIni() : LocalDate.parse(tglKembaliStr);
            boolean dendaLunas = Boolean.TRUE.equals(req.get("dendaLunas"));

            Map<String, Object> kondisiMap = (Map<String, Object>) req.get("kondisiAkhir");
            Map<DetailPeminjaman, KondisiBarang> mapKondisi = new LinkedHashMap<DetailPeminjaman, KondisiBarang>();

            for (DetailPeminjaman d : p.getDetail()) {
                KondisiBarang k = KondisiBarang.BAIK;
                if (kondisiMap != null && kondisiMap.containsKey(d.getBarang().getKode())) {
                    String kStr = kondisiMap.get(d.getBarang().getKode()).toString();
                    try {
                        k = KondisiBarang.valueOf(kStr.toUpperCase());
                    } catch (Exception ignored) {}
                }
                mapKondisi.put(d, k);
            }

            RincianDenda rincian = konteks.getLayanan().catatPengembalian(p, mapKondisi, tglKembali, dendaLunas);
            Map<String, Object> respData = petakanPeminjaman(p);
            respData.put("rincianDenda", rincian.getKeterangan());
            respData.put("totalDenda", rincian.getTotal());
            HttpHelper.kirimSukses(exchange, 200, "Pengembalian barang berhasil dicatat", respData);
        } else if ("batal".equalsIgnoreCase(aksi)) {
            konteks.getLayanan().batalkanPeminjaman(p);
            HttpHelper.kirimSukses(exchange, 200, "Peminjaman berhasil dibatalkan", petakanPeminjaman(p));
        } else {
            HttpHelper.kirimError(exchange, 404, "Aksi " + aksi + " tidak didukung", "NOT_FOUND");
        }
    }

    public static Map<String, Object> petakanPeminjaman(Peminjaman p) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        map.put("id", p.getId());
        map.put("nim", p.getPemohon().getNim());
        map.put("namaMahasiswa", p.getPemohon().getNama());
        map.put("tanggalPengajuan", p.getTanggalPengajuan().toString());
        map.put("tanggalMulai", p.getTanggalMulai().toString());
        map.put("tanggalSelesai", p.getTanggalSelesai().toString());
        map.put("keperluan", p.getKeperluan());
        map.put("status", p.getStatus().name());
        map.put("labelStatus", p.getStatus().getLabel());
        map.put("catatanPetugas", p.getCatatanPetugas());
        map.put("idPembina", p.getIdPembina());
        map.put("butuhPembina", p.butuhPersetujuanPembina());

        List<Map<String, Object>> items = new ArrayList<Map<String, Object>>();
        for (DetailPeminjaman d : p.getDetail()) {
            Map<String, Object> it = new LinkedHashMap<String, Object>();
            it.put("kodeBarang", d.getBarang().getKode());
            it.put("namaBarang", d.getBarang().getNama());
            it.put("jenis", d.getBarang().getJenisBarang());
            it.put("jumlah", d.getJumlah());
            it.put("kondisiAwal", d.getKondisiAwal() != null ? d.getKondisiAwal().name() : "BAIK");
            it.put("kondisiAkhir", d.getKondisiAkhir() != null ? d.getKondisiAkhir().name() : "");
            items.add(it);
        }
        map.put("items", items);

        if (p.getPengembalian() != null) {
            Map<String, Object> peng = new LinkedHashMap<String, Object>();
            peng.put("tanggalKembali", p.getPengembalian().getTanggalKembali().toString());
            peng.put("denda", p.getPengembalian().getTotalDenda());
            peng.put("lunas", p.getPengembalian().isLunas());
            map.put("pengembalian", peng);
        }

        return map;
    }
}
