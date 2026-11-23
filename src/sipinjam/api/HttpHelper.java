package sipinjam.api;

import com.sun.net.httpserver.HttpExchange;
import sipinjam.api.json.Json;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Utilitas pembantu untuk menangani komunikasi HTTP: CORS, parsing body, query params,
 * dan pembentukan respons JSON standar.
 */
public class HttpHelper {

    public static void pasangCors(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        exchange.getResponseHeaders().set("Access-Control-Max-Age", "86400");
    }

    public static boolean tanganiPreflight(HttpExchange exchange) throws IOException {
        pasangCors(exchange);
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            exchange.close();
            return true;
        }
        return false;
    }

    public static String bacaBody(HttpExchange exchange) throws IOException {
        InputStream is = exchange.getRequestBody();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        byte[] buffer = new byte[1024];
        int read;
        while ((read = is.read(buffer)) != -1) {
            baos.write(buffer, 0, read);
        }
        return baos.toString(StandardCharsets.UTF_8.name());
    }

    public static Map<String, String> ambilQueryParams(HttpExchange exchange) {
        Map<String, String> params = new LinkedHashMap<String, String>();
        String query = exchange.getRequestURI().getRawQuery();
        if (query == null || query.isEmpty()) {
            return params;
        }

        String[] pairs = query.split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf("=");
            try {
                if (idx > 0) {
                    String key = URLDecoder.decode(pair.substring(0, idx), "UTF-8");
                    String val = URLDecoder.decode(pair.substring(idx + 1), "UTF-8");
                    params.put(key, val);
                } else if (!pair.isEmpty()) {
                    String key = URLDecoder.decode(pair, "UTF-8");
                    params.put(key, "");
                }
            } catch (Exception ignored) {}
        }
        return params;
    }

    public static void kirimJson(HttpExchange exchange, int statusCode, Object data) throws IOException {
        pasangCors(exchange);
        String json = Json.stringify(data);
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);

        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);

        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.flush();
        os.close();
    }

    public static void kirimSukses(HttpExchange exchange, int statusCode, String pesan, Object data) throws IOException {
        Map<String, Object> resp = new LinkedHashMap<String, Object>();
        resp.put("sukses", true);
        resp.put("pesan", pesan);
        resp.put("data", data);
        kirimJson(exchange, statusCode, resp);
    }

    public static void kirimError(HttpExchange exchange, int statusCode, String pesan, String kodeKesalahan) throws IOException {
        kirimError(exchange, statusCode, pesan, kodeKesalahan, null);
    }

    public static void kirimError(HttpExchange exchange, int statusCode, String pesan, String kodeKesalahan, Object detail) throws IOException {
        Map<String, Object> resp = new LinkedHashMap<String, Object>();
        resp.put("sukses", false);
        resp.put("pesan", pesan);
        if (kodeKesalahan != null && !kodeKesalahan.isEmpty()) {
            resp.put("kodeKesalahan", kodeKesalahan);
        }
        if (detail != null) {
            resp.put("detail", detail);
        }
        kirimJson(exchange, statusCode, resp);
    }
}
