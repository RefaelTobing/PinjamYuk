import React, { useState, useEffect } from 'react';
import { api, formatRupiah } from './services/api';
import AuthPage from './components/auth/AuthPage';
import Navbar from './components/layout/Navbar';
import KatalogInventaris from './components/mahasiswa/KatalogInventaris';
import BookingRuangan from './components/mahasiswa/BookingRuangan';
import CartDrawer from './components/mahasiswa/CartDrawer';
import RiwayatDenda from './components/mahasiswa/RiwayatDenda';
import PersetujuanPembina from './components/pembina/PersetujuanPembina';
import MasterDataFasilitas from './components/petugas/MasterDataFasilitas';
import SirkulasiOperasional from './components/petugas/SirkulasiOperasional';
import MonitoringLaporan from './components/petugas/MonitoringLaporan';
import { CheckCircle2, AlertCircle } from 'lucide-react';

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
  const [jatuhTempoList, setJatuhTempoList] = useState([]);

  // Modals
  const [reviewModal, setReviewModal] = useState(null); // for approval/rejection

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
      const res = await api.getBarang({ mulai: tglMulai, selesai: tglSelesai });
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
        const [pRes, bRes, rRes, kRes, jRes] = await Promise.all([
          api.getPeminjaman(),
          api.getBooking(),
          api.getLaporanRingkasan(),
          api.getLaporanKategori(),
          api.getLaporanJatuhTempo()
        ]);
        setPeminjamanList(pRes.data || []);
        setBookingList(bRes.data || []);
        setLaporanRingkasan(rRes.data || null);
        setLaporanKategori(kRes.data || []);
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
  }, [user, tglMulai, tglSelesai]);

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
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl border text-sm font-semibold flex items-center gap-2 transition-all ${
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
        {/* TAB: VERIFIKASI & SIRKULASI (PETUGAS - MOCKUP COMPLIANT)  */}
        {/* ========================================================= */}
        {(activeTab === 'verifikasi' || activeTab === 'sirkulasi') && user.peran === 'PETUGAS' && (
          <SirkulasiOperasional
            peminjamanList={peminjamanList}
            bookingList={bookingList}
            barangList={barangList}
            onReviewPeminjaman={(p) =>
              setReviewModal({ tipe: 'PEMINJAMAN_PETUGAS', data: p })
            }
            onReviewBooking={(b) =>
              setReviewModal({ tipe: 'BOOKING_PETUGAS', data: b })
            }
            onSerahTerima={handleSerahTerima}
            onCatatPengembalian={async (id, payload) => {
              try {
                const res = await api.catatPengembalian(id, payload);
                showToast(
                  `Pengembalian dicatat! Total denda: ${formatRupiah(res.data?.totalDenda || 0)}`
                );
                loadRiwayatDanLaporan();
                loadBarang();
              } catch (e) {
                showToast(e.message, 'error');
              }
            }}
          />
        )}

        {/* ========================================================= */}
        {/* TAB: MASTER DATA FASILITAS (PETUGAS - MOCKUP COMPLIANT)   */}
        {/* ========================================================= */}
        {activeTab === 'master' && (
          <MasterDataFasilitas
            barangList={barangList}
            ruanganList={ruanganList}
            peminjamanList={peminjamanList}
            onAddBarang={async (payload) => {
              await api.tambahBarang(payload);
              showToast('Barang inventaris baru berhasil ditambahkan');
              loadBarang();
            }}
            onEditBarang={async (payload) => {
              await api.ubahBarang(payload);
              showToast('Data barang berhasil diperbarui');
              loadBarang();
            }}
            onAddRuangan={async (payload) => {
              await api.tambahRuangan(payload);
              showToast('Ruangan baru berhasil ditambahkan');
              loadRuangan();
            }}
            showToast={showToast}
          />
        )}

        {/* ========================================================= */}
        {/* TAB: MONITORING & LAPORAN (PETUGAS - MOCKUP COMPLIANT)    */}
        {/* ========================================================= */}
        {activeTab === 'laporan' && (
          <MonitoringLaporan
            peminjamanList={peminjamanList}
            bookingList={bookingList}
            laporanRingkasan={laporanRingkasan}
            laporanKategori={laporanKategori}
            jatuhTempoList={jatuhTempoList}
            showToast={showToast}
          />
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
    </div>
  );
}
