// Base URL backend. Bisa dioverride lewat frontend/.env -> VITE_API_BASE_URL.
const RAW_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.VITE_API_BASE_URL) ||
  'http://localhost:8080/api';
const BASE_URL = RAW_URL.replace(/\/+$/, '');

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error = new Error(data.pesan || `HTTP Error ${res.status}`);
      error.status = res.status;
      error.pesan = data.pesan || error.message;
      error.kodeKesalahan = data.kodeKesalahan || null;
      error.data = data;
      throw error;
    }
    return data;
  } catch (err) {
    if (err.name === 'TypeError') {
      const connError = new Error(
        `Tidak dapat terhubung ke Backend Server Java di ${BASE_URL}. ` +
        'Pastikan server sudah jalan (./run_server.ps1 atau npm run backend) dan port-nya sama dengan VITE_API_BASE_URL.'
      );
      connError.status = 503;
      connError.pesan = connError.message;
      connError.kodeKesalahan = 'KONEKSI_GAGAL';
      throw connError;
    }
    throw err;
  }
}

export const api = {
  // Health
  checkHealth: () => request('/health'),

  // Auth
  login: (username, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  }),
  register: (payload) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getMe: (username) => request(`/auth/me?username=${encodeURIComponent(username)}`),
  getUsers: () => request('/auth/users'),

  // Inventaris & Ruangan
  getBarang: (params = {}) => {
    const q = new URLSearchParams();
    const mulai = params.mulai || params.tglMulai;
    const selesai = params.selesai || params.tglSelesai;
    if (mulai) {
      q.set('mulai', mulai);
      q.set('tglMulai', mulai);
    }
    if (selesai) {
      q.set('selesai', selesai);
      q.set('tglSelesai', selesai);
    }
    if (params.kategori) q.set('kategori', params.kategori);
    if (params.cari) q.set('cari', params.cari);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return request(`/inventaris/barang${qs}`);
  },
  tambahBarang: (payload) => request('/inventaris/barang', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  ubahBarang: (payload) => request('/inventaris/barang', {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  getRuangan: () => request('/inventaris/ruangan'),
  tambahRuangan: (payload) => request('/inventaris/ruangan', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getKategori: () => request('/inventaris/kategori'),

  // Peminjaman Barang
  getPeminjaman: (params = {}) => {
    const q = new URLSearchParams();
    if (params.nim) q.set('nim', params.nim);
    if (params.status) q.set('status', params.status);
    if (params.menungguPembina) q.set('menungguPembina', 'true');
    if (params.jatuhTempo) q.set('jatuhTempo', 'true');
    const qs = q.toString() ? `?${q.toString()}` : '';
    return request(`/peminjaman${qs}`);
  },
  ajukanPeminjaman: (payload) => request('/peminjaman', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  persetujuanPembina: (id, setuju, catatan) => request(`/peminjaman/${id}/persetujuan-pembina`, {
    method: 'POST',
    body: JSON.stringify({ setuju, catatan })
  }),
  verifikasiPetugas: (id, setuju, catatan) => request(`/peminjaman/${id}/verifikasi-petugas`, {
    method: 'POST',
    body: JSON.stringify({ setuju, catatan })
  }),
  serahTerima: (id) => request(`/peminjaman/${id}/serah-terima`, {
    method: 'POST',
    body: JSON.stringify({})
  }),
  catatPengembalian: (id, payload) => request(`/peminjaman/${id}/pengembalian`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  batalkanPeminjaman: (id) => request(`/peminjaman/${id}/batal`, {
    method: 'POST',
    body: JSON.stringify({})
  }),

  // Booking Ruangan
  getJadwalRuangan: (kodeRuangan, tanggal) => 
    request(`/booking/jadwal?kodeRuangan=${encodeURIComponent(kodeRuangan)}&tanggal=${encodeURIComponent(tanggal)}`),
  getBooking: (params = {}) => {
    const q = new URLSearchParams();
    if (params.nim) q.set('nim', params.nim);
    if (params.status) q.set('status', params.status);
    if (params.tanggal) q.set('tanggal', params.tanggal);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return request(`/booking${qs}`);
  },
  ajukanBooking: (payload) => request('/booking', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  verifikasiBooking: (id, setuju, catatan) => request(`/booking/${id}/verifikasi`, {
    method: 'POST',
    body: JSON.stringify({ setuju, catatan })
  }),
  batalkanBooking: (id) => request(`/booking/${id}/batal`, {
    method: 'POST',
    body: JSON.stringify({})
  }),

  // Laporan & Statistik
  getLaporanRingkasan: () => request('/laporan/ringkasan'),
  getLaporanKategori: () => request('/laporan/kategori'),
  getLaporanUtilisasi: () => request('/laporan/utilisasi-ruangan'),
  getLaporanJatuhTempo: () => request('/laporan/jatuh-tempo')
};

/**
 * Utilitas Pemformatan Mata Uang Rupiah (contoh: Rp10.000)
 */
export const formatRupiah = (val) => {
  if (val === null || val === undefined || isNaN(Number(val))) return 'Rp0';
  const num = Math.round(Number(val));
  const formatted = Math.abs(num).toLocaleString('id-ID');
  return num < 0 ? `-Rp${formatted}` : `Rp${formatted}`;
};

/**
 * Utilitas Pemformatan Tanggal Indonesia (contoh: 24 Nov 2026)
 */
export const formatTanggal = (str) => {
  if (!str) return '-';
  try {
    if (typeof str === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(str.trim())) {
      const [year, month, day] = str.trim().split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
    }
    const d = new Date(str);
    if (isNaN(d.getTime())) return String(str);
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
  } catch (_e) {
    return String(str);
  }
};

/**
 * Utilitas Pemformatan Rentang Tanggal (contoh: 24 Nov 2026 – 26 Nov 2026)
 */
export const formatRentang = (tglMulai, tglSelesai) => {
  if (!tglMulai && !tglSelesai) return '-';
  if (tglMulai && !tglSelesai) return formatTanggal(tglMulai);
  if (!tglMulai && tglSelesai) return formatTanggal(tglSelesai);
  return `${formatTanggal(tglMulai)} \u2013 ${formatTanggal(tglSelesai)}`;
};
