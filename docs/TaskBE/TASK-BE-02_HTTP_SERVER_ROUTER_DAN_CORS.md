# TASK-BE-02: Setup HTTP Server, Dispatcher Router & Penanganan CORS

## 1. Identitas Task
- **ID Task**: `TASK-BE-02`
- **Fase**: Fase 2 (Pondasi REST API & Komunikasi)
- **Komponen**: `sipinjam.api.server`, `sipinjam.api.router`, `sipinjam.api.helper`
- **Tingkat Kesulitan**: Sedang
- **Estimasi Waktu**: 1 - 2 Hari

---

## 2. Deskripsi & Tujuan
Membangun web server HTTP berbasis pustaka standar Java (`com.sun.net.httpserver.HttpServer`) yang berjalan pada port tertentu (misal: `8080`), mendukung router request berbasis method HTTP (GET, POST, PUT, DELETE), serta menyertakan penanganan CORS (*Cross-Origin Resource Sharing*) agar Frontend bebas (React/Vue/Next.js/Svelte/Mobile) dapat berkomunikasi dengan lancar tanpa terhalang browser security policy.

---

## 3. Spesifikasi Teknis

### 3.1 Paket Baru yang Dibangun
Buat package baru `sipinjam.api`:
- `sipinjam.api.HttpServerManager`: Inisialisasi port, context path, thread pool executor, dan shutdown hook.
- `sipinjam.api.HttpRouter`: Router handler pusat yang memetakan URL path dan method ke sub-handler yang spesifik.
- `sipinjam.api.HttpHelper`: Utilitas kirim respons JSON, baca query params, parsing request body, dan header CORS.

### 3.2 Header CORS Wajib
Setiap request HTTP (khususnya pre-flight request `OPTIONS`) wajib mengembalikan header:
```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```
Ketika browser mengirim method `OPTIONS`, server langsung membalas dengan status HTTP 204 No Content / 200 OK beserta header di atas.

### 3.3 Penanganan Request & Response Helper
- `HttpHelper.kirimJson(HttpExchange exchange, int statusCode, String jsonResponse)`:
  - Set Header `Content-Type: application/json; charset=UTF-8`.
  - Kirim header response length dan tulis bytes ke `exchange.getResponseBody()`.
- `HttpHelper.kirimError(HttpExchange exchange, int statusCode, String pesan, String kodeKesalahan)`:
  - Membungkus pesan error ke format JSON standar `{ "sukses": false, "pesan": ..., "kodeKesalahan": ... }`.
- `HttpHelper.bacaBody(HttpExchange exchange)`:
  - Membaca `InputStream` request body menjadi `String` UTF-8.
- `HttpHelper.ambilQueryParams(HttpExchange exchange)`:
  - Mem-parse query string `?key=val&key2=val2` menjadi `Map<String, String>`.

---

## 4. Langkah-Langkah Pengerjaan
1. Buat direktori `src/sipinjam/api/` dan sub-komponennya.
2. Implementasikan `HttpServerManager` dengan port default `8080` (dapat diatur lewat argumen `--port 8080`).
3. Konfigurasikan ThreadPoolExecutor (`Executors.newFixedThreadPool(10)`) agar server mampu melayani request konkuren dari banyak tab/klien.
4. Buat base router yang mendaftarkan endpoint `/api/...` dan menangani error 404 (Route Not Found) serta 500 (Internal Server Error) secara tertata.
5. Buat script `run_server.sh` untuk memudahkan menjalankan backend.

---

## 5. Kriteria Penerimaan (Acceptance Criteria / DoD)
- [ ] Server Java HTTP dapat dijalankan via terminal:
  ```bash
  java -cp out sipinjam.AplikasiServer --port 8080
  ```
- [ ] Endpoint `/api/health` mengembalikan status 200:
  ```json
  { "sukses": true, "pesan": "SIPINJAM Server berjalan normal" }
  ```
- [ ] Permintaan pre-flight `curl -I -X OPTIONS http://localhost:8080/api/health` menghasilkan header CORS yang benar.
- [ ] Permintaan endpoint yang tidak terdaftar menghasilkan JSON respons error 404 tanpa membuat aplikasi crash.

