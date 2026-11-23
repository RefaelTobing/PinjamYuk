# TASK-FE-01: Setup Project, Token Warna Mockup & API Client Service
## Fondasi Frontend Web Reaktif SIPINJAM

---

## 1. Ringkasan Tugas
Menyiapkan struktur proyek Frontend menggunakan **React 19 + Vite** dengan konfigurasi **Tailwind CSS v4**, mengonfigurasi palet warna kustom (*Role-Based Theme System*), tipografi Google Font (`Plus Jakarta Sans`), ikonografi `lucide-react`, serta modul API client terpadu berbasis Axios/Fetch yang terhubung ke Backend Java REST API pada `http://localhost:8080/api`.

---

## 2. Acuan Desain Mockup
* **Direktori Mockup**: `frontend/MockUpPinjamYuk/`
* **Elemen Visual Kunci**:
  - Latar belakang dot-grid pattern (`bg-dot-grid`).
  - Palet warna peran: Blue-700 (Mahasiswa), Emerald-800 (Petugas), Amber-900 (Pembina).
  - Radius sudut rounded lembut (`rounded-xl` hingga `rounded-2xl`).
  - Shadow elevasi halus (`shadow-sm`, `shadow-md`, `shadow-xl shadow-slate-100`).

---

## 3. Rincian Pekerjaan Teknis

### A. Konfigurasi CSS & Token Warna (`frontend/src/index.css`)
Konfigurasikan Tailwind CSS v4 dengan variabel CSS kustom untuk merepresentasikan token warna dari mockup:
```css
@import "tailwindcss";

@layer base {
  :root {
    --color-mhs-primary: #1d4ed8;
    --color-mhs-hover: #1e40af;
    --color-mhs-light: #eff6ff;
    
    --color-petugas-primary: #065f46;
    --color-petugas-hover: #047857;
    --color-petugas-light: #d1fae5;
    
    --color-pembina-primary: #78350f;
    --color-pembina-hover: #92400e;
    --color-pembina-light: #fef3c7;
  }
}

/* Pola dot-grid untuk latar belakang halaman login */
.bg-dot-grid {
  background-image: radial-gradient(#cbd5e1 1.2px, transparent 1.2px);
  background-size: 24px 24px;
}
```

### B. Konfigurasi API Client (`frontend/src/services/api.js`)
Buat wrapper pemanggilan HTTP yang terstandarisasi untuk menangani permintaan ke Backend Java:
1. **Base URL**: Mengarah ke `http://localhost:8080/api` (dapat dikonfigurasi melalui `.env` `VITE_API_BASE_URL`).
2. **CORS Handling**: Menyertakan header `Content-Type: application/json`.
3. **Standarisasi Respons & Error Handling**:
   - Jika respons berstatus `sukses: true`, kembalikan payload data.
   - Jika menerima HTTP 400 (AturanDilanggarException), HTTP 403 (AksesDitolakException), atau HTTP 404, parse pesan kesalahan `pesan` dan `kodeKesalahan` untuk ditampilkan pada toast UI.
4. **Fungsi Pembantu Format (Utils)**:
   - `formatRupiah(number)`: Menghasilkan format mata uang Indonesia (contoh: `Rp10.000`).
   - `formatTanggal(dateString)`: Menghasilkan format tanggal Indonesia (contoh: `24 Nov 2026`).
   - `formatRentang(tglMulai, tglSelesai)`: Menghasilkan format rentang tanggal (contoh: `24 Nov 2026 – 26 Nov 2026`).

---

## 4. Checklist Penerimaan Tugas (Definition of Done)
- [ ] Server development Vite berjalan lancar via `npm run dev` di port 5173.
- [ ] Tailwind CSS v4 terpasang dengan plugin `@tailwindcss/vite` tanpa error build.
- [ ] Class utilitas kustom `.bg-dot-grid` dapat dirender dengan rapi.
- [ ] Modul `api.js` berhasil melakukan uji *health check* ke `GET http://localhost:8080/api/health`.
- [ ] Helper pemformatan Rupiah dan Tanggal berfungsi akurat.
