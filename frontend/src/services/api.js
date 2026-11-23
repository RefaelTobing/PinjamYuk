// Base URL backend. Bisa dioverride lewat frontend/.env -> VITE_API_BASE_URL.
// Default 8080 harus SAMA dengan port yang dipakai run_server (./run_server.ps1 -Port 8080).
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/+$/, '');

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
      error.data = data;
      throw error;
    }
    return data;
  } catch (err) {
    if (err.name === 'TypeError') {
      throw new Error(
        `Tidak dapat terhubung ke Backend Server Java di ${BASE_URL}. ` +
        'Pastikan server sudah jalan (./run_server.ps1) dan port-nya sama dengan VITE_API_BASE_URL ' +
        '(mis. backend di 8081 -> set VITE_API_BASE_URL=http://localhost:8081/api di frontend/.env).'
      );
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
    if (params.mulai) q.set('mulai', params.mulai);
    if (params.selesai) q.set('selesai', params.selesai);
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

export const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

export const formatTanggal = (str) => {
  if (!str) return '-';
  try {
    const d = new Date(str + 'T00:00:00');
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
  } catch (e) {
    return str;
  }
};