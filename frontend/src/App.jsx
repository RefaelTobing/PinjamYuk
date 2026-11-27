import React, { useState, useEffect } from 'react';
import { api, formatRupiah, formatTanggal } from './services/api';
import AuthPage from './components/auth/AuthPage';
import Navbar from './components/layout/Navbar';
import KatalogInventaris from './components/mahasiswa/KatalogInventaris';
import BookingRuangan from './components/mahasiswa/BookingRuangan';
import CartDrawer from './components/mahasiswa/CartDrawer';
import RiwayatDenda from './components/mahasiswa/RiwayatDenda';
import PersetujuanPembina from './components/pembina/PersetujuanPembina';
import { 
  Package, Calendar, Clock, ShieldCheck, AlertTriangle, 
  CheckCircle2, LogOut, Search, Plus, X, 
  Building2, Layers, AlertCircle, RefreshCw
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

  // Handle Update Cart Quantity (Stepper +/-)
  const updateCartQuantity = (kode, newQty) => {
    if (newQty <= 0) {
      setCart(prev => prev.filter(item => item.barang.kode !== kode));
      showToast('Item dihapus dari keranjang');
    } else {
      setCart(prev => prev.map(item => {
        if (item.barang.kode === kode) {
          const sisa = item.barang.stokTersedia !== undefined ? item.barang.stokTersedia : item.barang.stok;
          if (newQty > sisa) {
            showToast(`Kuantitas maksimal (${sisa} unit) telah tercapai`, 'error');
            return item;
          }
          return { ...item, jumlah: newQty };
        }
        return item;
      }));
    }
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


  // Handle Cancel Peminjaman
  const handleBatalPeminjaman = async (id) => {
    try {
      await api.batalkanPeminjaman(id);
      showToast('Pengajuan peminjaman berhasil dibatalkan');
      loadRiwayatDanLaporan();
      loadBarang();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // Handle Cancel Booking
  const handleBatalBooking = async (id) => {
    try {
      const res = await api.batalkanBooking(id);
      showToast(res.pesan || 'Booking berhasil dibatalkan');
      loadRiwayatDanLaporan();
      loadJadwal();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // Hitung kuota aktif & tunggakan denda mahasiswa
  const activeLoanCount = peminjamanList.filter((p) =>
    ['DIAJUKAN', 'DISETUJUI', 'DIPINJAM'].includes(p.status)
  ).length;

  const totalUnpaidFines =
    peminjamanList.reduce((sum, p) => {
      if (p.pengembalian && p.pengembalian.denda > 0 && !p.pengembalian.lunas) {
        return sum + p.pengembalian.denda;
      }
      return sum;
    }, 0) +
    bookingList.reduce((sum, b) => {
      if (b.dendaPembatalan > 0 && !b.dendaLunas) {
        return sum + b.dendaPembatalan;
      }
      return sum;
    }, 0);

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

      {/* TOP NAVBAR UNIVERSAL (ROLE-BASED & MOCKUP COMPLIANT) */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cart.reduce((sum, i) => sum + i.jumlah, 0)}
        onCartClick={() => setIsCartOpen(true)}
        onLogout={() => setUser(null)}
      />

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full">
        {/* ========================================================= */}
        {/* TAB: KATALOG BARANG (MAHASISWA - MOCKUP COMPLIANT)        */}
        {/* ========================================================= */}
        {activeTab === 'katalog' && (
          <KatalogInventaris
            barangList={barangList}
            tglMulai={tglMulai}
            tglSelesai={tglSelesai}
            onDateChange={(mulai, selesai) => {
              setTglMulai(mulai);
              setTglSelesai(selesai);
            }}
            cart={cart}
            onAddToCart={addToCart}
            onUpdateCartQuantity={updateCartQuantity}
          />
        )}

        {/* ========================================================= */}
        {/* TAB: JADWAL & BOOKING RUANGAN (MAHASISWA - MOCKUP COMPLIANT) */}
        {/* ========================================================= */}
        {activeTab === 'booking' && (
          <BookingRuangan
            user={user}
            ruanganList={ruanganList}
            selectedRuangan={selectedRuangan}
            setSelectedRuangan={setSelectedRuangan}
            tglBooking={tglBooking}
            setTglBooking={setTglBooking}
            jadwalSlots={jadwalSlots}
            onSubmitBooking={async (payload) => {
              await api.ajukanBooking(payload);
              loadJadwal();
              loadRiwayatDanLaporan();
            }}
            showToast={showToast}
            setActiveTab={setActiveTab}
          />
        )}

        {/* ========================================================= */}
        {/* TAB: RIWAYAT (MAHASISWA / DOSEN PEMBINA)                  */}
        {/* ========================================================= */}
        {activeTab === 'riwayat' && user.peran === 'PEMBINA' && (
          <PersetujuanPembina
            mode="riwayat"
            peminjamanList={peminjamanList}
            barangList={barangList}
          />
        )}

        {activeTab === 'riwayat' && user.peran !== 'PEMBINA' && (
          <RiwayatDenda
            user={user}
            peminjamanList={peminjamanList}
            bookingList={bookingList}
            onCancelPeminjaman={handleBatalPeminjaman}
            onCancelBooking={handleBatalBooking}
          />
        )}

        {/* ========================================================= */}
        {/* TAB: VERIFIKASI (DOSEN PEMBINA - MOCKUP COMPLIANT)        */}
        {/* ========================================================= */}
        {activeTab === 'verifikasi' && user.peran === 'PEMBINA' && (
          <PersetujuanPembina
            mode="antrean"
            peminjamanList={peminjamanList}
            barangList={barangList}
            onApprove={async (id, catatan) => {
              try {
                await api.persetujuanPembina(id, true, catatan || '');
                showToast('Pengajuan berhasil disetujui dan diteruskan ke Petugas Sarpras');
                loadRiwayatDanLaporan();
              } catch (e) {
                showToast(e.message, 'error');
              }
            }}
            onReject={async (id, alasan) => {
              try {
                await api.persetujuanPembina(id, false, alasan);
                showToast('Pengajuan telah ditolak oleh Dosen Pembina');
                loadRiwayatDanLaporan();
              } catch (e) {
                showToast(e.message, 'error');
              }
            }}
          />
        )}

        {/* ========================================================= */}
        {/* TAB: VERIFIKASI (PETUGAS) */}
        {/* ========================================================= */}
        {activeTab === 'verifikasi' && user.peran === 'PETUGAS' && (
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
      {/* SLIDE-OVER CART DRAWER (MAHASISWA - MOCKUP COMPLIANT)     */}
      {/* ========================================================= */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        tglMulai={tglMulai}
        tglSelesai={tglSelesai}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={(kode) => {
          setCart((prev) => prev.filter((item) => item.barang.kode !== kode));
          showToast('Item dihapus dari keranjang');
        }}
        keperluan={keperluanPeminjaman}
        setKeperluan={setKeperluanPeminjaman}
        onSubmit={submitPeminjaman}
        user={user}
        activeLoanCount={activeLoanCount}
        totalUnpaidFines={totalUnpaidFines}
      />

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
