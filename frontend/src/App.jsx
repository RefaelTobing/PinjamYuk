import React, { useState, useEffect } from 'react';
import { api, formatRupiah, formatTanggal } from './services/api';
import AuthPage from './components/auth/AuthPage';
import { 
  Package, Calendar, Clock, ShieldCheck, AlertTriangle, 
  CheckCircle2, Trash2, LogOut, Search, Plus, X, 
  Building2, Layers, AlertCircle, ShoppingCart, RefreshCw
} from 'lucide-react';

export default function App() {
  // Auth state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sipinjam_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Global feedback notification
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' | 'info' }

  // Active navigation tab
  const [activeTab, setActiveTab] = useState('katalog'); // 'katalog' | 'booking' | 'riwayat' | 'verifikasi' | 'sirkulasi' | 'master' | 'laporan'

  // Mahasiswa states: Date range & Cart
  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };
  const getNextWeek = () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  };

  const [tglMulai, setTglMulai] = useState(getTomorrow());
  const [tglSelesai, setTglSelesai] = useState(getNextWeek());
  const [barangList, setBarangList] = useState([]);
  const [kategoriFilter, setKategoriFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]); // [{ barang, jumlah }]
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [keperluanPeminjaman, setKeperluanPeminjaman] = useState('');

  // Booking states
  const [ruanganList, setRuanganList] = useState([]);
  const [selectedRuangan, setSelectedRuangan] = useState(null);
  const [tglBooking, setTglBooking] = useState(getNextWeek());
  const [jadwalSlots, setJadwalSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]); // [slotObj, ...]
  const [bookingPeserta, setBookingPeserta] = useState(15);
  const [bookingKeperluan, setBookingKeperluan] = useState('');

  // Riwayat & Admin lists
  const [peminjamanList, setPeminjamanList] = useState([]);
  const [bookingList, setBookingList] = useState([]);
  const [laporanRingkasan, setLaporanRingkasan] = useState(null);
  const [laporanKategori, setLaporanKategori] = useState([]);
  const [laporanUtilisasi, setLaporanUtilisasi] = useState([]);
  const [jatuhTempoList, setJatuhTempoList] = useState([]);

  // Modals
  const [reviewModal, setReviewModal] = useState(null); // for approval/rejection
  const [pengembalianModal, setPengembalianModal] = useState(null);
  const [kondisiAkhirMap, setKondisiAkhirMap] = useState({});
  const [tambahBarangModal, setTambahBarangModal] = useState(false);
  const [barangBaru, setBarangBaru] = useState({
    kode: '', nama: '', kategori: 'ELK', jenis: 'ELEKTRONIK',
    stok: 5, hargaSatuan: 1000000, perluPersetujuan: false
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Synchronize user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('sipinjam_user', JSON.stringify(user));
      if (user.peran === 'MAHASISWA') setActiveTab('katalog');
      else if (user.peran === 'PETUGAS') setActiveTab('verifikasi');
      else if (user.peran === 'PEMBINA') setActiveTab('verifikasi');
    } else {
      localStorage.removeItem('sipinjam_user');
    }
  }, [user]);

  // Load initial data
  const loadBarang = async () => {
    try {
      const res = await api.getBarang({ mulai: tglMulai, selesai: tglSelesai, kategori: kategoriFilter, cari: searchQuery });
      setBarangList(res.data || []);
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const loadRuangan = async () => {
    try {
      const res = await api.getRuangan();
      setRuanganList(res.data || []);
      if (!selectedRuangan && res.data && res.data.length > 0) {
        setSelectedRuangan(res.data[0]);
      }
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const loadJadwal = async () => {
    if (!selectedRuangan) return;
    try {
      const res = await api.getJadwalRuangan(selectedRuangan.kode, tglBooking);
      setJadwalSlots(res.data?.slots || []);
      setSelectedSlots([]);
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const loadRiwayatDanLaporan = async () => {
    try {
      if (user?.peran === 'MAHASISWA') {
        const [pRes, bRes] = await Promise.all([
          api.getPeminjaman({ nim: user.nim }),
          api.getBooking({ nim: user.nim })
        ]);
        setPeminjamanList(pRes.data || []);
        setBookingList(bRes.data || []);
      } else {
        const [pRes, bRes, rRes, kRes, uRes, jRes] = await Promise.all([
          api.getPeminjaman(),
          api.getBooking(),
          api.getLaporanRingkasan(),
          api.getLaporanKategori(),
          api.getLaporanUtilisasi(),
          api.getLaporanJatuhTempo()
        ]);
        setPeminjamanList(pRes.data || []);
        setBookingList(bRes.data || []);
        setLaporanRingkasan(rRes.data || null);
        setLaporanKategori(kRes.data || []);
        setLaporanUtilisasi(uRes.data || []);
        setJatuhTempoList(jRes.data || []);
      }
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  useEffect(() => {
    if (user) {
      loadBarang();
      loadRuangan();
      loadRiwayatDanLaporan();
    }
  }, [user, tglMulai, tglSelesai, kategoriFilter, searchQuery]);

  useEffect(() => {
    if (selectedRuangan) {
      loadJadwal();
    }
  }, [selectedRuangan, tglBooking]);


  // Handle Add to Cart
  const addToCart = (b) => {
    const sisa = b.stokTersedia !== undefined ? b.stokTersedia : b.stok;
    if (sisa <= 0) {
      showToast(`Stok ${b.nama} sedang habis untuk rentang tanggal tersebut`, 'error');
      return;
    }
    setCart(prev => {
      const exist = prev.find(item => item.barang.kode === b.kode);
      if (exist) {
        if (exist.jumlah >= sisa) {
          showToast(`Kuantitas maksimal (${sisa} unit) telah tercapai`, 'error');
          return prev;
        }
        return prev.map(item => item.barang.kode === b.kode ? { ...item, jumlah: item.jumlah + 1 } : item);
      }
      return [...prev, { barang: b, jumlah: 1 }];
    });
    showToast(`${b.nama} ditambahkan ke keranjang`);
  };

  // Handle Submit Peminjaman
  const submitPeminjaman = async () => {
    if (cart.length === 0) return;
    if (!keperluanPeminjaman.trim()) {
      showToast('Harap isi keperluan peminjaman kegiatan', 'error');
      return;
    }
    try {
      const payload = {
        nim: user.nim,
        tanggalMulai: tglMulai,
        tanggalSelesai: tglSelesai,
        keperluan: keperluanPeminjaman,
        items: cart.map(c => ({ kodeBarang: c.barang.kode, jumlah: c.jumlah }))
      };
      await api.ajukanPeminjaman(payload);
      showToast('Pengajuan peminjaman barang berhasil dikirim!');
      setCart([]);
      setIsCartOpen(false);
      setKeperluanPeminjaman('');
      loadBarang();
      loadRiwayatDanLaporan();
      setActiveTab('riwayat');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // Handle Submit Booking
  const submitBooking = async () => {
    if (!selectedRuangan || selectedSlots.length === 0) {
      showToast('Pilih ruangan dan minimal satu slot jam', 'error');
      return;
    }
    if (!bookingKeperluan.trim()) {
      showToast('Harap isi keperluan kegiatan booking ruangan', 'error');
      return;
    }
    const jamMulai = selectedSlots[0].jamMulai;
    const jamSelesai = selectedSlots[selectedSlots.length - 1].jamSelesai;

    try {
      const payload = {
        nim: user.nim,
        kodeRuangan: selectedRuangan.kode,
        tanggal: tglBooking,
        jamMulai,
        jamSelesai,
        jumlahPeserta: bookingPeserta,
        keperluan: bookingKeperluan
      };
      await api.ajukanBooking(payload);
      showToast('Pengajuan booking ruangan berhasil dikirim!');
      setBookingKeperluan('');
      setSelectedSlots([]);
      loadJadwal();
      loadRiwayatDanLaporan();
      setActiveTab('riwayat');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // Handle Cancel Peminjaman
  const handleBatalPeminjaman = async (id) => {
    if (!window.confirm('Yakin ingin membatalkan pengajuan peminjaman ini?')) return;
    try {
      await api.batalkanPeminjaman(id);
      showToast('Pengajuan peminjaman berhasil dibatalkan');
      loadRiwayatDanLaporan();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // Handle Cancel Booking
  const handleBatalBooking = async (b) => {
    const isLate = new Date(b.tanggal) - new Date() < 86400000;
    const pesan = isLate 
      ? 'PERHATIAN: Pembatalan kurang dari H-1 dikenakan denda Rp50.000. Lanjutkan pembatalan?' 
      : 'Yakin ingin membatalkan booking ruangan ini?';
    if (!window.confirm(pesan)) return;
    try {
      const res = await api.batalkanBooking(b.id);
      showToast(res.pesan || 'Booking berhasil dibatalkan');
      loadRiwayatDanLaporan();
      loadJadwal();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // Petugas & Pembina review action
  const handleReviewAction = async (setuju, catatan) => {
    if (!reviewModal) return;
    try {
      if (reviewModal.tipe === 'PEMINJAMAN_PEMBINA') {
        await api.persetujuanPembina(reviewModal.data.id, setuju, catatan);
        showToast(setuju ? 'Peminjaman disetujui dosen pembina' : 'Peminjaman ditolak dosen pembina');
      } else if (reviewModal.tipe === 'PEMINJAMAN_PETUGAS') {
        await api.verifikasiPetugas(reviewModal.data.id, setuju, catatan);
        showToast(setuju ? 'Peminjaman disetujui petugas sarpras' : 'Peminjaman ditolak petugas');
      } else if (reviewModal.tipe === 'BOOKING_PETUGAS') {
        await api.verifikasiBooking(reviewModal.data.id, setuju, catatan);
        showToast(setuju ? 'Booking ruangan disetujui petugas' : 'Booking ruangan ditolak');
      }
      setReviewModal(null);
      loadRiwayatDanLaporan();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // Petugas Serah Terima
  const handleSerahTerima = async (id) => {
    try {
      await api.serahTerima(id);
      showToast('Barang berhasil diserahterimakan (Status: DIPINJAM)');
      loadRiwayatDanLaporan();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // Petugas Pengembalian submit
  const handlePengembalianSubmit = async () => {
    if (!pengembalianModal) return;
    try {
      const payload = {
        tanggalKembali: new Date().toISOString().split('T')[0],
        kondisiAkhir: kondisiAkhirMap,
        dendaLunas: true
      };
      const res = await api.catatPengembalian(pengembalianModal.id, payload);
      showToast(`Pengembalian dicatat! Total denda: ${formatRupiah(res.data.totalDenda)}`);
      setPengembalianModal(null);
      loadRiwayatDanLaporan();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // Handle Tambah Barang Baru
  const handleTambahBarang = async (e) => {
    e.preventDefault();
    try {
      await api.tambahBarang(barangBaru);
      showToast('Barang inventaris baru berhasil ditambahkan');
      setTambahBarangModal(false);
      loadBarang();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Role Color Helpers
  const getRoleBadge = (peran) => {
    if (peran === 'MAHASISWA') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (peran === 'PETUGAS') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (peran === 'PEMBINA') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-slate-100 text-slate-800';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'MENUNGGU_PEMBINA': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'DIAJUKAN': return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'DISETUJUI': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'DIPINJAM': case 'TERPAKAI': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'DIKEMBALIKAN': case 'SELESAI': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'DITOLAK': case 'DIBATALKAN': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  // ==========================================
  // RENDER: LOGIN & REGISTRATION
  // ==========================================
  if (!user) {
    return (
      <>
        {toast && (
          <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 ${
            toast.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 
            toast.type === 'info' ? 'bg-blue-50 text-blue-800 border-blue-200' :
            'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            {toast.message}
          </div>
        )}
        <AuthPage onLoginSuccess={(userData) => setUser(userData)} showToast={showToast} />
      </>
    );
  }

  // ==========================================
  // RENDER: MAIN APPLICATION SHELL
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* GLOBAL TOAST */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold flex items-center gap-2 animate-bounce ${
          toast.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {toast.message}
        </div>
      )}

      {/* TOP NAVBAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
              <Package size={22} />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-2">
                SIPINJAM <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">v2.0 Decoupled</span>
              </span>
              <p className="text-[10px] text-slate-500 font-medium">Sistem Peminjaman Inventaris & Ruangan Kampus</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* User profile pill */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                {user.nama.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">{user.nama}</p>
                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${getRoleBadge(user.peran)}`}>
                  {user.labelPeran || user.peran}
                </span>
              </div>
            </div>

            {/* Cart Button (for Mahasiswa) */}
            {user.peran === 'MAHASISWA' && (
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl border border-blue-200 transition">
                <ShoppingCart size={18} />
                {cart.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {cart.reduce((sum, i) => sum + i.jumlah, 0)}
                  </span>
                )}
              </button>
            )}

            {/* Logout */}
            <button 
              onClick={() => setUser(null)}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
              title="Keluar">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="max-w-7xl mx-auto px-4 flex gap-2 overflow-x-auto py-1">
          {user.peran === 'MAHASISWA' && (
            <>
              <button 
                onClick={() => setActiveTab('katalog')} 
                className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'katalog' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}>
                <Package size={15} /> Katalog Barang
              </button>
              <button 
                onClick={() => setActiveTab('booking')} 
                className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'booking' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}>
                <Calendar size={15} /> Jadwal & Booking Ruangan
              </button>
              <button 
                onClick={() => setActiveTab('riwayat')} 
                className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'riwayat' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}>
                <Clock size={15} /> Riwayat Saya & Denda
              </button>
            </>
          )}

          {user.peran === 'PETUGAS' && (
            <>
              <button 
                onClick={() => setActiveTab('verifikasi')} 
                className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'verifikasi' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}>
                <ShieldCheck size={15} /> Verifikasi Pengajuan
              </button>
              <button 
                onClick={() => setActiveTab('sirkulasi')} 
                className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'sirkulasi' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}>
                <RefreshCw size={15} /> Sirkulasi & Denda
              </button>
              <button 
                onClick={() => setActiveTab('master')} 
                className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'master' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}>
                <Layers size={15} /> Master Data Inventaris
              </button>
              <button 
                onClick={() => setActiveTab('laporan')} 
                className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'laporan' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}>
                <Building2 size={15} /> Laporan & Overdue
              </button>
            </>
          )}

          {user.peran === 'PEMBINA' && (
            <>
              <button 
                onClick={() => setActiveTab('verifikasi')} 
                className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'verifikasi' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}>
                <ShieldCheck size={15} /> Antrean Persetujuan Khusus
              </button>
              <button 
                onClick={() => setActiveTab('laporan')} 
                className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'laporan' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}>
                <Building2 size={15} /> Pantau Jatuh Tempo & Statistik
              </button>
            </>
          )}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full">
        {/* ========================================================= */}
        {/* TAB: KATALOG BARANG (MAHASISWA) */}
        {/* ========================================================= */}
        {activeTab === 'katalog' && (
          <div className="space-y-6">
            {/* Filter Date Range & Dynamic Stock Calculator */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-slate-800">Rentang Tanggal Peminjaman</h2>
                <p className="text-xs text-slate-500">Sisa stok dihitung otomatis berdasarkan tumpang tindih tanggal peminjaman aktif.</p>
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Mulai</label>
                  <input 
                    type="date" 
                    value={tglMulai}
                    min={getTomorrow()}
                    onChange={e => setTglMulai(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <span className="text-slate-400 font-bold">&rarr;</span>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Selesai (Maks 7 Hari)</label>
                  <input 
                    type="date" 
                    value={tglSelesai}
                    min={tglMulai}
                    onChange={e => setTglSelesai(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari nama barang atau kode inventaris..." 
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select 
                value={kategoriFilter}
                onChange={e => setKategoriFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none">
                <option value="">Semua Kategori</option>
                <option value="ELK">Elektronik</option>
                <option value="LAB">Alat Laboratorium</option>
                <option value="FUR">Furnitur</option>
              </select>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {barangList.map(b => {
                const sisa = b.stokTersedia !== undefined ? b.stokTersedia : b.stok;
                return (
                  <div key={b.kode} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
                    <div className="p-4 border-b border-slate-100 flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{b.kategori || b.jenis}</span>
                        <h3 className="font-bold text-sm text-slate-900 mt-0.5">{b.nama}</h3>
                        <p className="text-[11px] text-slate-400">Kode: {b.kode}</p>
                      </div>
                      {b.perluPersetujuan && (
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          Perlu Pembina
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Stok Tersedia:</span>
                        <span className={`font-black ${sisa > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {sisa} Unit (Total: {b.stok})
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Tarif Denda Telat:</span>
                        <span className="font-semibold text-slate-700">{formatRupiah(b.tarifHarian)}/hari</span>
                      </div>

                      <button 
                        onClick={() => addToCart(b)}
                        disabled={sisa <= 0}
                        className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                          sisa > 0 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}>
                        <Plus size={14} /> Tambah ke Keranjang
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: JADWAL & BOOKING RUANGAN (MAHASISWA) */}
        {/* ========================================================= */}
        {activeTab === 'booking' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-slate-800">Visualisasi Papan Jadwal Slot Ruangan</h2>
                <p className="text-xs text-slate-500">Slot operasional 07.00 - 21.00. Slot terkunci bila berstatus Diajukan, Disetujui, atau Terpakai.</p>
              </div>

              <div className="flex items-center gap-3">
                <select 
                  value={selectedRuangan?.kode || ''}
                  onChange={e => {
                    const r = ruanganList.find(x => x.kode === e.target.value);
                    setSelectedRuangan(r);
                  }}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 outline-none">
                  {ruanganList.map(r => (
                    <option key={r.kode} value={r.kode}>{r.nama} (Kapasitas: {r.kapasitas})</option>
                  ))}
                </select>

                <input 
                  type="date" 
                  value={tglBooking}
                  min={getNextWeek()}
                  onChange={e => setTglBooking(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
            </div>

            {/* Room Info Card */}
            {selectedRuangan && (
              <div className="bg-slate-900 text-white p-4 rounded-2xl flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-base">{selectedRuangan.nama} ({selectedRuangan.kode})</h3>
                  <p className="text-xs text-slate-300 mt-0.5">Fasilitas: {selectedRuangan.fasilitas}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Kapasitas Maksimal</span>
                  <p className="text-lg font-black text-blue-400">{selectedRuangan.kapasitas} Orang</p>
                </div>
              </div>
            )}

            {/* Grid Slot Jam (07.00 - 21.00) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Pilih Slot Waktu (07.00 s.d 21.00):</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {jadwalSlots.map((s, idx) => {
                  const isBusy = s.status === 'TERISI';
                  const isSelected = selectedSlots.some(x => x.jamMulai === s.jamMulai);

                  return (
                    <button 
                      key={idx}
                      disabled={isBusy}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedSlots(selectedSlots.filter(x => x.jamMulai !== s.jamMulai));
                        } else {
                          if (selectedSlots.length >= 4) {
                            showToast('Batas maksimal booking adalah 4 jam per pengajuan', 'error');
                            return;
                          }
                          setSelectedSlots([...selectedSlots, s].sort((a,b) => a.jamMulai.localeCompare(b.jamMulai)));
                        }
                      }}
                      className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                        isBusy 
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60' 
                          : isSelected 
                            ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-sm ring-2 ring-amber-400' 
                            : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100 cursor-pointer'
                      }`}>
                      <span className="text-xs font-black">{s.jamMulai} - {s.jamSelesai}</span>
                      <span className="text-[10px] font-semibold mt-1">
                        {isBusy ? 'Terisi' : isSelected ? 'Dipilih' : 'Kosong'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Booking Submission Form */}
              {selectedSlots.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Peserta</label>
                    <input 
                      type="number" 
                      value={bookingPeserta}
                      onChange={e => setBookingPeserta(Number(e.target.value))}
                      max={selectedRuangan?.kapasitas}
                      className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Keperluan Kegiatan</label>
                    <input 
                      type="text" 
                      value={bookingKeperluan}
                      onChange={e => setBookingKeperluan(e.target.value)}
                      placeholder="Contoh: Rapat Kerja Himpunan Mahasiswa"
                      className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div>
                    <button 
                      onClick={submitBooking}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition">
                      Kirim Pengajuan Booking ({selectedSlots.length} Jam)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: RIWAYAT SAYA (MAHASISWA) */}
        {/* ========================================================= */}
        {activeTab === 'riwayat' && (
          <div className="space-y-6">
            <h2 className="text-base font-extrabold text-slate-800">Riwayat Pengajuan Peminjaman & Booking</h2>

            {/* Peminjaman Barang */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <span className="font-extrabold text-xs text-slate-700 uppercase">Peminjaman Barang Inventaris</span>
                <span className="text-xs text-slate-500 font-semibold">{peminjamanList.length} Pengajuan</span>
              </div>

              <div className="divide-y divide-slate-100">
                {peminjamanList.length === 0 ? (
                  <p className="p-6 text-center text-xs text-slate-400">Belum ada riwayat peminjaman barang.</p>
                ) : (
                  peminjamanList.map(p => (
                    <div key={p.id} className="p-4 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-700">{p.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(p.status)}`}>
                            {p.labelStatus || p.status}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 mt-1">{p.keperluan}</p>
                        <p className="text-[11px] text-slate-500">
                          Rentang: {formatTanggal(p.tanggalMulai)} &rarr; {formatTanggal(p.tanggalSelesai)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {p.items?.map((it, idx) => (
                            <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                              {it.namaBarang} ({it.jumlah} unit)
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {p.pengembalian && (
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400">Total Denda</span>
                            <p className="text-xs font-bold text-red-600">{formatRupiah(p.pengembalian.denda)}</p>
                          </div>
                        )}

                        {(p.status === 'DIAJUKAN' || p.status === 'DISETUJUI') && (
                          <button 
                            onClick={() => handleBatalPeminjaman(p.id)}
                            className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition">
                            Batalkan
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Booking Ruangan */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <span className="font-extrabold text-xs text-slate-700 uppercase">Booking Ruangan</span>
                <span className="text-xs text-slate-500 font-semibold">{bookingList.length} Booking</span>
              </div>

              <div className="divide-y divide-slate-100">
                {bookingList.length === 0 ? (
                  <p className="p-6 text-center text-xs text-slate-400">Belum ada riwayat booking ruangan.</p>
                ) : (
                  bookingList.map(b => (
                    <div key={b.id} className="p-4 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-700">{b.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(b.status)}`}>
                            {b.labelStatus || b.status}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 mt-1">{b.namaRuangan} &bull; {b.keperluan}</h4>
                        <p className="text-[11px] text-slate-500">
                          Tanggal: {formatTanggal(b.tanggal)} | Jam: {b.jamMulai} - {b.jamSelesai} ({b.durasiJam} Jam)
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {b.dendaPembatalan > 0 && (
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400">Denda Pembatalan</span>
                            <p className="text-xs font-bold text-red-600">{formatRupiah(b.dendaPembatalan)}</p>
                          </div>
                        )}

                        {(b.status === 'DIAJUKAN' || b.status === 'DISETUJUI') && (
                          <button 
                            onClick={() => handleBatalBooking(b)}
                            className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition">
                            Batalkan Booking
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: VERIFIKASI (PETUGAS / PEMBINA) */}
        {/* ========================================================= */}
        {activeTab === 'verifikasi' && (
          <div className="space-y-6">
            <h2 className="text-base font-extrabold text-slate-800">Antrean Verifikasi Pengajuan</h2>

            {/* Peminjaman pending */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <span className="font-extrabold text-xs text-slate-700 uppercase">
                  {user.peran === 'PEMBINA' ? 'Barang Khusus Menunggu Persetujuan Pembina' : 'Pengajuan Peminjaman Barang'}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {peminjamanList
                  .filter(p => user.peran === 'PEMBINA' ? (p.status === 'DIAJUKAN' && p.butuhPembina && !p.idPembina) : (p.status === 'DIAJUKAN' && (!p.butuhPembina || p.idPembina)))
                  .length === 0 ? (
                  <p className="p-6 text-center text-xs text-slate-400">Tidak ada pengajuan peminjaman menunggu verifikasi.</p>
                ) : (
                  peminjamanList
                    .filter(p => user.peran === 'PEMBINA' ? (p.status === 'DIAJUKAN' && p.butuhPembina && !p.idPembina) : (p.status === 'DIAJUKAN' && (!p.butuhPembina || p.idPembina)))
                    .map(p => (
                      <div key={p.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-800">{p.id}</span>
                            <span className="text-xs font-semibold text-slate-600">&bull; {p.namaMahasiswa} ({p.nim})</span>
                          </div>
                          <p className="text-xs font-bold text-slate-800 mt-1">Keperluan: {p.keperluan}</p>
                          <p className="text-[11px] text-slate-500">
                            Rentang: {formatTanggal(p.tanggalMulai)} &rarr; {formatTanggal(p.tanggalSelesai)}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {p.items?.map((it, idx) => (
                              <span key={idx} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium border border-blue-200">
                                {it.namaBarang} ({it.jumlah} unit)
                              </span>
                            ))}
                          </div>
                        </div>

                        <button 
                          onClick={() => setReviewModal({
                            tipe: user.peran === 'PEMBINA' ? 'PEMINJAMAN_PEMBINA' : 'PEMINJAMAN_PETUGAS',
                            data: p
                          })}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition">
                          Tinjau & Verifikasi
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Booking pending (petugas only) */}
            {user.peran === 'PETUGAS' && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <span className="font-extrabold text-xs text-slate-700 uppercase">Pengajuan Booking Ruangan</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {bookingList.filter(b => b.status === 'DIAJUKAN').length === 0 ? (
                    <p className="p-6 text-center text-xs text-slate-400">Tidak ada booking ruangan menunggu verifikasi.</p>
                  ) : (
                    bookingList.filter(b => b.status === 'DIAJUKAN').map(b => (
                      <div key={b.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <span className="font-mono text-xs font-bold text-slate-800">{b.id}</span>
                          <h4 className="text-xs font-bold text-slate-900 mt-1">{b.namaRuangan} &bull; {b.keperluan}</h4>
                          <p className="text-[11px] text-slate-500">
                            Oleh: {b.namaMahasiswa} ({b.nim}) | Tanggal: {formatTanggal(b.tanggal)} | Jam: {b.jamMulai} - {b.jamSelesai}
                          </p>
                        </div>

                        <button 
                          onClick={() => setReviewModal({ tipe: 'BOOKING_PETUGAS', data: b })}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition">
                          Tinjau Booking
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: SIRKULASI (PETUGAS) */}
        {/* ========================================================= */}
        {activeTab === 'sirkulasi' && (
          <div className="space-y-6">
            <h2 className="text-base font-extrabold text-slate-800">Sirkulasi Fisik: Serah Terima & Pengembalian</h2>

            {/* Antrean Serah Terima (DISETUJUI) */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
                <span className="font-extrabold text-xs text-indigo-900 uppercase">Siap Serah Terima Barang (Status: Disetujui)</span>
              </div>
              <div className="divide-y divide-slate-100">
                {peminjamanList.filter(p => p.status === 'DISETUJUI').length === 0 ? (
                  <p className="p-6 text-center text-xs text-slate-400">Tidak ada barang menunggu serah terima.</p>
                ) : (
                  peminjamanList.filter(p => p.status === 'DISETUJUI').map(p => (
                    <div key={p.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <span className="font-mono text-xs font-bold text-indigo-900">{p.id}</span> &bull; <span className="font-bold text-xs">{p.namaMahasiswa} ({p.nim})</span>
                        <p className="text-xs text-slate-700 mt-1">{p.keperluan}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {p.items?.map((it, idx) => (
                            <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                              {it.namaBarang} ({it.jumlah} unit)
                            </span>
                          ))}
                        </div>
                      </div>

                      <button 
                        onClick={() => handleSerahTerima(p.id)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition">
                        Catat Serah Terima (Serahkan Fisik)
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Antrean Pengembalian (DIPINJAM) */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
                <span className="font-extrabold text-xs text-purple-900 uppercase">Sedang Dipinjam & Tunggu Pengembalian</span>
              </div>
              <div className="divide-y divide-slate-100">
                {peminjamanList.filter(p => p.status === 'DIPINJAM').length === 0 ? (
                  <p className="p-6 text-center text-xs text-slate-400">Tidak ada barang yang sedang dipinjam saat ini.</p>
                ) : (
                  peminjamanList.filter(p => p.status === 'DIPINJAM').map(p => (
                    <div key={p.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <span className="font-mono text-xs font-bold text-purple-900">{p.id}</span> &bull; <span className="font-bold text-xs">{p.namaMahasiswa} ({p.nim})</span>
                        <p className="text-xs text-slate-700 mt-1">Batas Kembali: <b>{formatTanggal(p.tanggalSelesai)}</b></p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {p.items?.map((it, idx) => (
                            <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                              {it.namaBarang} ({it.jumlah} unit)
                            </span>
                          ))}
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          const initialKondisi = {};
                          p.items?.forEach(it => { initialKondisi[it.kodeBarang] = 'BAIK'; });
                          setKondisiAkhirMap(initialKondisi);
                          setPengembalianModal(p);
                        }}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition">
                        Catat Pengembalian & Denda
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: MASTER DATA INVENTARIS (PETUGAS) */}
        {/* ========================================================= */}
        {activeTab === 'master' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-extrabold text-slate-800">Master Data Inventaris Kampus</h2>
              <button 
                onClick={() => setTambahBarangModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5">
                <Plus size={16} /> Tambah Barang Baru
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Kode</th>
                    <th className="p-3">Nama Barang</th>
                    <th className="p-3">Kategori & Jenis</th>
                    <th className="p-3">Stok Fisik</th>
                    <th className="p-3">Harga Satuan</th>
                    <th className="p-3">Persetujuan</th>
                    <th className="p-3">Tarif Denda/Hari</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {barangList.map(b => (
                    <tr key={b.kode} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-slate-800">{b.kode}</td>
                      <td className="p-3 font-semibold text-slate-900">{b.nama}</td>
                      <td className="p-3 text-slate-600">{b.kategori} ({b.jenis})</td>
                      <td className="p-3 font-bold text-slate-800">{b.stok} Unit</td>
                      <td className="p-3 text-slate-600">{formatRupiah(b.hargaSatuan)}</td>
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.perluPersetujuan ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {b.perluPersetujuan ? 'Wajib Pembina' : 'Reguler'}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-emerald-600">{formatRupiah(b.tarifHarian)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: LAPORAN & OVERDUE (PETUGAS / PEMBINA) */}
        {/* ========================================================= */}
        {activeTab === 'laporan' && (
          <div className="space-y-6">
            <h2 className="text-base font-extrabold text-slate-800">Laporan Statistik & Pemantauan Jatuh Tempo</h2>

            {/* Metric Cards */}
            {laporanRingkasan && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Peminjaman Aktif</span>
                  <h3 className="text-2xl font-black text-blue-600 mt-1">{laporanRingkasan.totalPeminjamanAktif}</h3>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Booking Ruang Aktif</span>
                  <h3 className="text-2xl font-black text-indigo-600 mt-1">{laporanRingkasan.totalBookingAktif}</h3>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Kasus Jatuh Tempo</span>
                  <h3 className="text-2xl font-black text-red-600 mt-1">{laporanRingkasan.kasusJatuhTempo}</h3>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Denda Terkumpul</span>
                  <h3 className="text-xl font-black text-emerald-600 mt-1">{formatRupiah(laporanRingkasan.totalDenda)}</h3>
                </div>
              </div>
            )}

            {/* Overdue Alerts (Red warning cards) */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <h3 className="text-xs font-black text-red-800 uppercase tracking-wider flex items-center gap-2 mb-3">
                <AlertTriangle size={16} /> Peringatan Transaksi Jatuh Tempo / Lewat Batas Waktu
              </h3>
              {jatuhTempoList.length === 0 ? (
                <p className="text-xs text-red-600">Tidak ada peminjaman yang melewati jatuh tempo saat ini. Semua tertib.</p>
              ) : (
                <div className="space-y-3">
                  {jatuhTempoList.map(j => (
                    <div key={j.id} className="bg-white p-3 rounded-xl border border-red-200 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-mono font-bold text-red-800">{j.id}</span> &bull; <b>{j.namaMahasiswa} ({j.nim})</b>
                        <p className="text-[11px] text-slate-600">Tenggat Selesai: {formatTanggal(j.tanggalSelesai)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-red-500 font-bold">Terlambat {j.hariTerlambat || 0} Hari</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rekapitulasi Kategori */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">Rekapitulasi Frekuensi Peminjaman per Kategori</h3>
              <div className="space-y-3">
                {laporanKategori.map((k, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>{k.kategori}</span>
                      <span>{k.jumlahPeminjaman} Unit ({k.persentase}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${k.persentase}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* CART DRAWER / MODAL (MAHASISWA) */}
      {/* ========================================================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-4">
                <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                  <ShoppingCart size={18} /> Keranjang Peminjaman Multi-Item
                </h3>
                <button onClick={() => setIsCartOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4 bg-blue-50 p-3 rounded-xl border border-blue-200 text-xs text-blue-800">
                <p><b>Rentang:</b> {formatTanggal(tglMulai)} &rarr; {formatTanggal(tglSelesai)}</p>
              </div>

              {cart.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-10">Keranjang masih kosong.</p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.barang.nama}</h4>
                        <p className="text-[10px] text-slate-500">Kode: {item.barang.kode}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            if (item.jumlah > 1) {
                              setCart(cart.map(c => c.barang.kode === item.barang.kode ? { ...c, jumlah: c.jumlah - 1 } : c));
                            } else {
                              setCart(cart.filter(c => c.barang.kode !== item.barang.kode));
                            }
                          }}
                          className="w-6 h-6 rounded bg-white border border-slate-300 font-bold text-xs flex items-center justify-center">
                          -
                        </button>
                        <span className="text-xs font-bold">{item.jumlah}</span>
                        <button 
                          onClick={() => {
                            const sisa = item.barang.stokTersedia !== undefined ? item.barang.stokTersedia : item.barang.stok;
                            if (item.jumlah < sisa) {
                              setCart(cart.map(c => c.barang.kode === item.barang.kode ? { ...c, jumlah: c.jumlah + 1 } : c));
                            } else {
                              showToast(`Stok maksimal ${sisa} unit`, 'error');
                            }
                          }}
                          className="w-6 h-6 rounded bg-white border border-slate-300 font-bold text-xs flex items-center justify-center">
                          +
                        </button>
                        <button 
                          onClick={() => setCart(cart.filter(c => c.barang.kode !== item.barang.kode))}
                          className="p-1 text-red-500 hover:text-red-700 ml-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="mt-4">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Keperluan Peminjaman (Wajib)</label>
                    <textarea 
                      rows={3}
                      value={keperluanPeminjaman}
                      onChange={e => setKeperluanPeminjaman(e.target.value)}
                      placeholder="Jelaskan tujuan kegiatan dan organisasi peminjam..."
                      className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button 
                onClick={submitPeminjaman}
                disabled={cart.length === 0}
                className={`w-full py-2.5 rounded-xl font-bold text-xs shadow transition ${
                  cart.length > 0 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}>
                Kirim Pengajuan ({cart.reduce((s, i) => s + i.jumlah, 0)} Unit)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* REVIEW & APPROVAL MODAL (PETUGAS / PEMBINA) */}
      {/* ========================================================= */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900 mb-2">Tinjau Keputusan Pengajuan</h3>
            <p className="text-xs text-slate-500 mb-4">
              Nomor: <b>{reviewModal.data.id}</b> | Mahasiswa: <b>{reviewModal.data.namaMahasiswa} ({reviewModal.data.nim})</b>
            </p>
            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4">
              <b>Keperluan:</b> {reviewModal.data.keperluan}
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              const catatan = e.target.catatan.value;
              handleReviewAction(true, catatan);
            }}>
              <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Verifikator (Opsional)</label>
              <textarea 
                name="catatan" 
                rows={2} 
                className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                placeholder="Tuliskan catatan kelayakan atau alasan..." 
              />

              <div className="flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setReviewModal(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">
                  Batal
                </button>
                <button 
                  type="button" 
                  onClick={(e) => {
                    const form = e.target.closest('form');
                    const catatan = form.catatan.value;
                    if (!catatan.trim()) {
                      showToast('Catatan alasan wajib diisi untuk penolakan', 'error');
                      return;
                    }
                    handleReviewAction(false, catatan);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl">
                  Tolak Pengajuan
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl">
                  Setujui Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PENGEMBALIAN & DENDA MODAL (PETUGAS) */}
      {/* ========================================================= */}
      {pengembalianModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900 mb-1">Catat Pengembalian & Kondisi Akhir Barang</h3>
            <p className="text-xs text-slate-500 mb-4">Nomor: <b>{pengembalianModal.id}</b> | Peminjam: <b>{pengembalianModal.namaMahasiswa}</b></p>

            <div className="space-y-3 mb-6">
              {pengembalianModal.items?.map(it => (
                <div key={it.kodeBarang} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">{it.namaBarang}</h4>
                    <span className="text-[10px] text-slate-500">Jumlah: {it.jumlah} Unit</span>
                  </div>
                  <select 
                    value={kondisiAkhirMap[it.kodeBarang] || 'BAIK'}
                    onChange={e => setKondisiAkhirMap({ ...kondisiAkhirMap, [it.kodeBarang]: e.target.value })}
                    className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 outline-none">
                    <option value="BAIK">Kondisi: Baik (Tanpa Denda)</option>
                    <option value="RUSAK_RINGAN">Kondisi: Rusak Ringan</option>
                    <option value="RUSAK_BERAT">Kondisi: Rusak Berat</option>
                    <option value="HILANG">Kondisi: Hilang</option>
                  </select>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setPengembalianModal(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">
                Batal
              </button>
              <button 
                onClick={handlePengembalianSubmit}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl">
                Simpan & Selesaikan Peminjaman
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL TAMBAH BARANG (PETUGAS) */}
      {/* ========================================================= */}
      {tambahBarangModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900 mb-3">Tambah Barang Inventaris Baru</h3>
            <form onSubmit={handleTambahBarang} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Kode Barang</label>
                <input 
                  type="text" 
                  value={barangBaru.kode}
                  onChange={e => setBarangBaru({...barangBaru, kode: e.target.value})}
                  placeholder="Contoh: PROY-02" 
                  className="w-full px-3 py-1.5 border rounded-lg text-xs outline-none" required 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Barang</label>
                <input 
                  type="text" 
                  value={barangBaru.nama}
                  onChange={e => setBarangBaru({...barangBaru, nama: e.target.value})}
                  placeholder="Nama inventaris" 
                  className="w-full px-3 py-1.5 border rounded-lg text-xs outline-none" required 
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Kategori</label>
                  <select 
                    value={barangBaru.kategori}
                    onChange={e => setBarangBaru({...barangBaru, kategori: e.target.value})}
                    className="w-full px-2 py-1.5 border rounded-lg text-xs outline-none">
                    <option value="ELK">Elektronik</option>
                    <option value="LAB">Alat Laboratorium</option>
                    <option value="FUR">Furnitur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Subtipe OOP</label>
                  <select 
                    value={barangBaru.jenis}
                    onChange={e => setBarangBaru({...barangBaru, jenis: e.target.value})}
                    className="w-full px-2 py-1.5 border rounded-lg text-xs outline-none">
                    <option value="ELEKTRONIK">BarangElektronik</option>
                    <option value="ALAT_LAB">AlatLaboratorium</option>
                    <option value="FURNITUR">BarangFurnitur</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Stok Fisik</label>
                  <input 
                    type="number" 
                    value={barangBaru.stok}
                    onChange={e => setBarangBaru({...barangBaru, stok: Number(e.target.value)})}
                    className="w-full px-3 py-1.5 border rounded-lg text-xs outline-none" required 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Harga Satuan (Rp)</label>
                  <input 
                    type="number" 
                    value={barangBaru.hargaSatuan}
                    onChange={e => setBarangBaru({...barangBaru, hargaSatuan: Number(e.target.value)})}
                    className="w-full px-3 py-1.5 border rounded-lg text-xs outline-none" required 
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="perluPersetujuan"
                  checked={barangBaru.perluPersetujuan}
                  onChange={e => setBarangBaru({...barangBaru, perluPersetujuan: e.target.checked})}
                  className="rounded" 
                />
                <label htmlFor="perluPersetujuan" className="text-xs text-slate-700 font-semibold">
                  Wajib Persetujuan Dosen Pembina
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button 
                  type="button" 
                  onClick={() => setTambahBarangModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg">
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg">
                  Simpan Barang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
