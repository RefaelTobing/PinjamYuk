package sipinjam.api.handler;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import sipinjam.KonteksAplikasi;
import sipinjam.api.HttpHelper;
import sipinjam.api.json.Json;
import sipinjam.model.*;

import java.io.IOException;
import java.util.*;

/**
 * Handler endpoint autentikasi, registrasi akun mahasiswa, dan profil pengguna.
 */
public class AuthHandler implements HttpHandler {
    private final KonteksAplikasi konteks;

    public AuthHandler(KonteksAplikasi konteks) {
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
            if ("/api/auth/login".equals(path) && "POST".equals(method)) {
                prosesLogin(exchange);
            } else if ("/api/auth/register".equals(path) && "POST".equals(method)) {
                prosesRegister(exchange);
            } else if ("/api/auth/me".equals(path) && "GET".equals(method)) {
                prosesMe(exchange);
            } else if ("/api/auth/users".equals(path) && "GET".equals(method)) {
                prosesDaftarPengguna(exchange);
            } else {
                HttpHelper.kirimError(exchange, 404, "Endpoint autentikasi tidak ditemukan", "NOT_FOUND");
            }
        } catch (Exception e) {
            HttpHelper.kirimError(exchange, 500, "Kesalahan internal server: " + e.getMessage(), "INTERNAL_ERROR");
        }
    }

    private void prosesLogin(HttpExchange exchange) throws IOException {
        String body = HttpHelper.bacaBody(exchange);
        Map<String, Object> req = Json.parseObject(body);

        String username = req.get("username") != null ? req.get("username").toString().trim() : "";
        String password = req.get("password") != null ? req.get("password").toString().trim() : "";

        if (username.isEmpty() || password.isEmpty()) {
            HttpHelper.kirimError(exchange, 400, "Username dan kata sandi wajib diisi", "BAD_REQUEST");
            return;
        }

        Pengguna pengguna = konteks.getRepoPengguna().login(username, password);
        if (pengguna == null) {
            HttpHelper.kirimError(exchange, 401, "Username atau kata sandi tidak cocok", "AUTH_GAGAL");
            return;
        }

        Map<String, Object> data = petakanPengguna(pengguna);
        data.put("token", "sess-" + pengguna.getId() + "-" + System.currentTimeMillis());
        HttpHelper.kirimSukses(exchange, 200, "Login berhasil sebagai " + pengguna.getPeran().getLabel(), data);
    }

    private void prosesRegister(HttpExchange exchange) throws IOException {
        String body = HttpHelper.bacaBody(exchange);
        Map<String, Object> req = Json.parseObject(body);

        String nim = req.get("nim") != null ? req.get("nim").toString().trim() : "";
        String nama = req.get("nama") != null ? req.get("nama").toString().trim() : "";
        String prodi = req.get("programStudi") != null ? req.get("programStudi").toString().trim() : "D3 Teknik Informatika";
        String noTelepon = req.get("noTelepon") != null ? req.get("noTelepon").toString().trim() : "-";
        String username = req.get("username") != null ? req.get("username").toString().trim() : "";
        String password = req.get("password") != null ? req.get("password").toString().trim() : "";

        if (nim.isEmpty() || nama.isEmpty() || username.isEmpty() || password.isEmpty()) {
            HttpHelper.kirimError(exchange, 400, "NIM, nama, username, dan kata sandi wajib diisi", "BAD_REQUEST");
            return;
        }

        if (konteks.getRepoPengguna().cariUsername(username) != null) {
            HttpHelper.kirimError(exchange, 400, "Username '" + username + "' sudah digunakan", "USERNAME_DUPLIKAT");
            return;
        }

        for (Mahasiswa m : konteks.getRepoPengguna().daftarMahasiswa()) {
            if (m.getNim().equalsIgnoreCase(nim)) {
                HttpHelper.kirimError(exchange, 400, "NIM '" + nim + "' sudah terdaftar", "NIM_DUPLIKAT");
                return;
            }
        }

        String idBaru = konteks.getRepoPengguna().idBerikutnya();
        Mahasiswa mahasiswaBaru = new Mahasiswa(idBaru, nama, username, password, nim, prodi, noTelepon, true);
        konteks.getRepoPengguna().tambah(mahasiswaBaru);
        konteks.getPenyimpanan().simpan();

        Map<String, Object> data = petakanPengguna(mahasiswaBaru);
        HttpHelper.kirimSukses(exchange, 201, "Registrasi akun mahasiswa berhasil", data);
    }

    private void prosesMe(HttpExchange exchange) throws IOException {
        Map<String, String> q = HttpHelper.ambilQueryParams(exchange);
        String username = q.get("username");
        if (username == null || username.isEmpty()) {
            HttpHelper.kirimError(exchange, 400, "Parameter username diperlukan", "BAD_REQUEST");
            return;
        }

        Pengguna pengguna = konteks.getRepoPengguna().cariUsername(username);
        if (pengguna == null) {
            HttpHelper.kirimError(exchange, 404, "Pengguna tidak ditemukan", "NOT_FOUND");
            return;
        }

        HttpHelper.kirimSukses(exchange, 200, "Data profil pengguna", petakanPengguna(pengguna));
    }

    private void prosesDaftarPengguna(HttpExchange exchange) throws IOException {
        List<Map<String, Object>> daftar = new ArrayList<Map<String, Object>>();
        for (Pengguna p : konteks.getRepoPengguna().semua()) {
            daftar.add(petakanPengguna(p));
        }
        HttpHelper.kirimSukses(exchange, 200, "Daftar pengguna", daftar);
    }

    public static Map<String, Object> petakanPengguna(Pengguna p) {
        Map<String, Object> map = new LinkedHashMap<String, Object>();
        map.put("id", p.getId());
        map.put("nama", p.getNama());
        map.put("username", p.getUsername());
        map.put("peran", p.getPeran().name());
        map.put("labelPeran", p.getPeran().getLabel());

        if (p instanceof Mahasiswa) {
            Mahasiswa m = (Mahasiswa) p;
            map.put("nim", m.getNim());
            map.put("programStudi", m.getProgramStudi());
            map.put("noTelepon", m.getNoTelepon());
            map.put("statusAktif", m.isAktif());
        } else if (p instanceof PetugasSarpras) {
            PetugasSarpras pt = (PetugasSarpras) p;
            map.put("nip", pt.getNip());
            map.put("unitKerja", pt.getUnitKerja());
        } else if (p instanceof DosenPembina) {
            DosenPembina dp = (DosenPembina) p;
            map.put("nidn", dp.getNidn());
            map.put("jabatan", dp.getJabatan());
        }
        return map;
    }
}
