import React, { useState, useMemo } from 'react';
import {
  Archive, Building2, Wallet, ArrowRight, XCircle,
  AlertTriangle, X, Package, Receipt, CheckCircle2
} from 'lucide-react';
import { formatRupiah, formatTanggal, formatRentang } from '../../services/api';

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function isBookingLateCancel(tanggalStr) {
  if (!tanggalStr) return false;
  const target = new Date(tanggalStr + 'T00:00:00');
  const today = new Date(getTodayStr() + 'T00:00:00');
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
  // Backend: dendaPembatalan diterapkan bila pembatalan kurang dari H-1 (diffDays < 1)
  return diffDays < 1;
}

function resolveStatusInfo(trx) {
  const today = getTodayStr();
  if (trx.type === 'BARANG') {
    const p = trx.raw;
    if (p.status === 'DIAJUKAN' && p.butuhPembina && !p.idPembina) {
      return {
        label: 'Menunggu Pembina',
        className: 'bg-amber-50 text-amber-700 border-amber-200',
        dotClass: 'bg-amber-500'
      };
    }
    if (p.status === 'DIAJUKAN') {
      return {
        label: 'Diajukan',
        className: 'bg-sky-50 text-sky-700 border-sky-200',
        dotClass: 'bg-sky-500'
      };
    }
    if (p.status === 'DISETUJUI') {
      return {
        label: 'Disetujui',
        className: 'bg-blue-50 text-blue-700 border-blue-200',
        dotClass: 'bg-blue-500'
      };
    }
    if (p.status === 'DIPINJAM') {
      if (p.tanggalSelesai && p.tanggalSelesai < today) {
        return {
          label: 'Terlambat',
          className: 'bg-rose-50 text-rose-700 border-rose-200',
          dotClass: 'bg-rose-500'
        };
      }
      return {
        label: 'Dipinjam',
        className: 'bg-purple-50 text-purple-700 border-purple-200',
        dotClass: 'bg-purple-500'
      };
    }
    if (p.status === 'DIKEMBALIKAN') {
      return {
        label: 'Dikembalikan',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotClass: 'bg-emerald-500'
      };
    }
    if (p.status === 'DITOLAK') {
      return {
        label: 'Ditolak',
        className: 'bg-red-50 text-red-700 border-red-200',
        dotClass: 'bg-red-500'
      };
    }
    if (p.status === 'DIBATALKAN') {
      return {
        label: 'Dibatalkan',
        className: 'bg-slate-100 text-slate-600 border-slate-200',
        dotClass: 'bg-slate-400'
      };
    }
  } else {
    const b = trx.raw;
    switch (b.status) {
      case 'DIAJUKAN':
        return {
          label: 'Diajukan',
          className: 'bg-sky-50 text-sky-700 border-sky-200',
          dotClass: 'bg-sky-500'
        };
      case 'DISETUJUI':
        return {
          label: 'Disetujui',
          className: 'bg-blue-50 text-blue-700 border-blue-200',
          dotClass: 'bg-blue-500'
        };
      case 'TERPAKAI':
        return {
          label: 'Terpakai',
          className: 'bg-purple-50 text-purple-700 border-purple-200',
          dotClass: 'bg-purple-500'
        };
      case 'SELESAI':
        return {
          label: 'Selesai',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dotClass: 'bg-emerald-500'
        };
      case 'DITOLAK':
        return {
          label: 'Ditolak',
          className: 'bg-red-50 text-red-700 border-red-200',
          dotClass: 'bg-red-500'
        };
      case 'DIBATALKAN':
        return {
          label: 'Dibatalkan',
          className: 'bg-slate-100 text-slate-600 border-slate-200',
          dotClass: 'bg-slate-400'
        };
      default:
        break;
    }
  }

  return {
    label: trx.raw.labelStatus || trx.raw.status,
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-400'
  };
}

export default function RiwayatDenda({
  user,
  peminjamanList = [],
  bookingList = [],
  onCancelPeminjaman,
  onCancelBooking
}) {
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'BARANG' | 'RUANGAN'
  const [detailModal, setDetailModal] = useState(null);
  const [dendaModal, setDendaModal] = useState(null);
  const [cancelConfirmModal, setCancelConfirmModal] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  // Hitung metrik untuk 3 Stat Cards
  const stats = useMemo(() => {
    const activeLoans = peminjamanList.filter((p) =>
      ['DIAJUKAN', 'DISETUJUI', 'DIPINJAM'].includes(p.status)
    );
    const activeBookings = bookingList.filter((b) =>
      ['DIAJUKAN', 'DISETUJUI', 'TERPAKAI'].includes(b.status)
    );

    let unpaidFines = 0;
    peminjamanList.forEach((p) => {
      if (p.pengembalian && p.pengembalian.denda > 0 && !p.pengembalian.lunas) {
        unpaidFines += p.pengembalian.denda;
      }
    });
    bookingList.forEach((b) => {
      if (b.dendaPembatalan > 0 && !b.dendaLunas) {
        unpaidFines += b.dendaPembatalan;
      }
    });

    const firstActiveBooking = activeBookings[0] || null;
    return {
      activeLoansCount: activeLoans.length,
      activeBookingsCount: activeBookings.length,
      firstActiveBookingLabel: firstActiveBooking
        ? `${firstActiveBooking.namaRuangan} ${firstActiveBooking.kodeRuangan}`
        : 'Belum ada jadwal aktif',
      unpaidFines
    };
  }, [peminjamanList, bookingList]);

  // Gabungkan transaksi peminjaman & booking ke dalam satu daftar terurut
  const allTransactions = useMemo(() => {
    const barangTrx = peminjamanList.map((p) => ({
      key: `B-${p.id}`,
      id: p.id,
      type: 'BARANG',
      sortDate: p.tanggalPengajuan || p.tanggalMulai || '',
      raw: p
    }));

    const ruangTrx = bookingList.map((b) => ({
      key: `R-${b.id}`,
      id: b.id,
      type: 'RUANGAN',
      sortDate: b.tanggalPengajuan || b.tanggal || '',
      raw: b
    }));

    return [...barangTrx, ...ruangTrx].sort((a, b) => {
      if (b.sortDate !== a.sortDate) return b.sortDate.localeCompare(a.sortDate);
      return b.id.localeCompare(a.id);
    });
  }, [peminjamanList, bookingList]);

  const filteredTransactions = useMemo(() => {
    if (filterTab === 'BARANG') return allTransactions.filter((t) => t.type === 'BARANG');
    if (filterTab === 'RUANGAN') return allTransactions.filter((t) => t.type === 'RUANGAN');
    return allTransactions;
  }, [allTransactions, filterTab]);

  const handleConfirmCancel = async () => {
    if (!cancelConfirmModal) return;
    setCancelling(true);
    try {
      if (cancelConfirmModal.type === 'BARANG') {
        await onCancelPeminjaman(cancelConfirmModal.raw.id);
      } else {
        await onCancelBooking(cancelConfirmModal.raw.id);
      }
      setCancelConfirmModal(null);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="w-full">
      {/* ========================================================= */}
      {/* 1. HEADER & BREADCRUMBS                                   */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
        <div>
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">
            AKUN {user?.nama?.toUpperCase() || 'MAHASISWA'} &gt; AKTIVITAS PEMINJAMAN
          </p>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Riwayat &amp; Denda
          </h1>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-xs font-semibold text-slate-600 self-start md:self-auto">
          <span>
            NIM: <strong className="text-slate-900 font-bold">{user?.nim || '-'}</strong>
          </span>
          <span className="text-slate-300">&bull;</span>
          <span>{user?.programStudi || 'Teknik Informatika'}</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TIGA KARTU RINGKASAN METRIK (TOP STAT CARDS)           */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Card 1: Peminjaman Aktif */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              Peminjaman Aktif
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900">
                {stats.activeLoansCount} / 2
              </span>
              <span className="text-sm font-bold text-slate-500">Kuota</span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">
              Maks. 2 peminjaman simultan
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Archive size={22} />
          </div>
        </div>

        {/* Card 2: Booking Ruangan */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              Booking Ruangan
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-slate-900">
                {stats.activeBookingsCount}
              </span>
              <span className="text-sm font-bold text-slate-500">Jadwal</span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 font-medium truncate max-w-[200px]">
              {stats.firstActiveBookingLabel}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Building2 size={22} />
          </div>
        </div>

        {/* Card 3: Tunggakan Denda */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              Tunggakan Denda
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-2xl font-extrabold ${
                  stats.unpaidFines > 0 ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                {formatRupiah(stats.unpaidFines)}
              </span>
              {stats.unpaidFines === 0 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Bebas Denda
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Ada Tunggakan
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">
              {stats.unpaidFines === 0
                ? 'Status akun tertib & aktif'
                : 'Selesaikan di bagian sarpras'}
            </p>
          </div>
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              stats.unpaidFines === 0
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-rose-50 text-rose-600'
            }`}
          >
            <Wallet size={22} />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. BILAH FILTER TAB RIWAYAT                               */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="inline-flex items-center bg-white border border-slate-200/90 p-1 rounded-xl shadow-2xs self-start">
          {[
            { id: 'ALL', label: 'Semua' },
            { id: 'BARANG', label: 'Peminjaman Barang' },
            { id: 'RUANGAN', label: 'Booking Ruangan' }
          ].map((tab) => {
            const active = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <p className="text-xs font-semibold text-slate-500">
          Menampilkan <strong className="text-slate-800">{filteredTransactions.length}</strong> Transaksi
        </p>
      </div>

      {/* ========================================================= */}
      {/* 4. TABEL RIWAYAT TRANSAKSI MINIMALIST                     */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70">
                <th className="py-3.5 px-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  ID Transaksi
                </th>
                <th className="py-3.5 px-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Item / Ruangan
                </th>
                <th className="py-3.5 px-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Jadwal
                </th>
                <th className="py-3.5 px-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3.5 px-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 px-6 text-center">
                    <p className="text-sm font-bold text-slate-700">Belum ada transaksi</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Riwayat peminjaman barang dan booking ruangan Anda akan tampil di sini.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx) => {
                  const statusInfo = resolveStatusInfo(trx);
                  const isBarang = trx.type === 'BARANG';
                  const raw = trx.raw;
                  const canCancel = raw.status === 'DIAJUKAN' || raw.status === 'DISETUJUI';
                  const fineAmount = isBarang
                    ? raw.pengembalian?.denda || 0
                    : raw.dendaPembatalan || 0;

                  const itemTitle = isBarang
                    ? raw.items && raw.items.length > 0
                      ? raw.items.length > 1
                        ? `${raw.items[0].namaBarang} (+${raw.items.length - 1} lainnya)`
                        : `${raw.items[0].namaBarang} (${raw.items[0].jumlah} unit)`
                      : 'Peminjaman Barang'
                    : `${raw.namaRuangan} (${raw.kodeRuangan})`;

                  const scheduleText = isBarang
                    ? formatRentang(raw.tanggalMulai, raw.tanggalSelesai)
                    : `${formatTanggal(raw.tanggal)} • ${raw.jamMulai}–${raw.jamSelesai}`;

                  return (
                    <tr key={trx.key} className="hover:bg-slate-50/70 transition">
                      {/* ID TRANSAKSI */}
                      <td className="py-4 px-5 align-middle">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-xs font-extrabold text-slate-900">
                            {raw.id}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            {isBarang ? 'Inventaris' : 'Ruangan'}
                          </span>
                        </div>
                      </td>

                      {/* ITEM / RUANGAN */}
                      <td className="py-4 px-5 align-middle">
                        <p className="text-xs font-bold text-slate-900">{itemTitle}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 max-w-xs">
                          {raw.keperluan}
                        </p>
                      </td>

                      {/* JADWAL */}
                      <td className="py-4 px-5 align-middle whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-700">
                          {scheduleText}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="py-4 px-5 align-middle whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${statusInfo.className}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* AKSI */}
                      <td className="py-4 px-5 align-middle text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2">
                          {fineAmount > 0 && (
                            <button
                              type="button"
                              onClick={() => setDendaModal(trx)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition cursor-pointer"
                            >
                              <Receipt size={12} />
                              Rincian Denda ({formatRupiah(fineAmount)})
                            </button>
                          )}

                          {canCancel && (
                            <button
                              type="button"
                              onClick={() => setCancelConfirmModal(trx)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50/70 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-[11px] font-bold transition cursor-pointer"
                            >
                              <XCircle size={12} />
                              Batalkan
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setDetailModal(trx)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                          >
                            Detail
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL DETAIL TRANSAKSI                                    */}
      {/* ========================================================= */}
      {detailModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {detailModal.raw.id}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  {detailModal.type === 'BARANG'
                    ? 'Detail Peminjaman Barang'
                    : 'Detail Booking Ruangan'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Tanggal Pengajuan</p>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {formatTanggal(detailModal.raw.tanggalPengajuan)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Jadwal Pakai</p>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {detailModal.type === 'BARANG'
                      ? formatRentang(detailModal.raw.tanggalMulai, detailModal.raw.tanggalSelesai)
                      : `${formatTanggal(detailModal.raw.tanggal)} (${detailModal.raw.jamMulai}–${detailModal.raw.jamSelesai})`}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase mb-1">Keperluan Acara</p>
                <p className="text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200/80 font-medium">
                  {detailModal.raw.keperluan}
                </p>
              </div>

              {detailModal.type === 'BARANG' ? (
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase mb-2">
                    Daftar Barang ({detailModal.raw.items?.length || 0} Item)
                  </p>
                  <div className="space-y-2">
                    {detailModal.raw.items?.map((it, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Package size={15} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{it.namaBarang}</p>
                            <p className="text-[11px] text-slate-500">{it.kodeBarang}</p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold">
                          {it.jumlah} Unit
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-slate-200">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Ruangan</p>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {detailModal.raw.namaRuangan} ({detailModal.raw.kodeRuangan})
                    </p>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Estimasi Peserta</p>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {detailModal.raw.jumlahPeserta} Orang ({detailModal.raw.durasiJam} Jam)
                    </p>
                  </div>
                </div>
              )}

              {detailModal.raw.catatanPetugas && (
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900">
                  <p className="text-[11px] font-bold uppercase mb-0.5">Catatan Verifikator</p>
                  <p className="font-medium">{detailModal.raw.catatanPetugas}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL RINCIAN DENDA                                       */}
      {/* ========================================================= */}
      {dendaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Rincian Denda Transaksi</h3>
              <button
                type="button"
                onClick={() => setDendaModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-rose-700 uppercase">Total Denda</p>
                  <p className="text-2xl font-extrabold text-rose-800 mt-0.5">
                    {formatRupiah(
                      dendaModal.type === 'BARANG'
                        ? dendaModal.raw.pengembalian?.denda || 0
                        : dendaModal.raw.dendaPembatalan || 0
                    )}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    (dendaModal.type === 'BARANG'
                      ? dendaModal.raw.pengembalian?.lunas
                      : dendaModal.raw.dendaLunas)
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-white text-rose-700 border-rose-200'
                  }`}
                >
                  {(dendaModal.type === 'BARANG'
                    ? dendaModal.raw.pengembalian?.lunas
                    : dendaModal.raw.dendaLunas)
                    ? 'Lunas'
                    : 'Belum Lunas'}
                </span>
              </div>

              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span>ID Transaksi</span>
                  <strong className="text-slate-900 font-mono">{dendaModal.raw.id}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span>Jenis Denda</span>
                  <strong className="text-slate-900">
                    {dendaModal.type === 'BARANG'
                      ? 'Keterlambatan / Kerusakan Pengembalian'
                      : 'Pembatalan Booking < H-1'}
                  </strong>
                </div>
                {dendaModal.type === 'BARANG' && dendaModal.raw.pengembalian && (
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span>Tanggal Dikembalikan</span>
                    <strong className="text-slate-900">
                      {formatTanggal(dendaModal.raw.pengembalian.tanggalKembali)}
                    </strong>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setDendaModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL KONFIRMASI PEMBATALAN & DETEKSI PENALTI             */}
      {/* ========================================================= */}
      {cancelConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Konfirmasi Pembatalan
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Apakah Anda yakin ingin membatalkan transaksi{' '}
                    <strong className="font-mono text-slate-900">
                      {cancelConfirmModal.raw.id}
                    </strong>
                    ?
                  </p>
                </div>
              </div>

              {cancelConfirmModal.type === 'RUANGAN' &&
              isBookingLateCancel(cancelConfirmModal.raw.tanggal) ? (
                <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1">
                  <p className="font-extrabold flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                    Peringatan Denda Pembatalan Rp50.000
                  </p>
                  <p className="text-amber-800">
                    Pembatalan booking ruangan kurang dari H-1 jadwal pemakaian (
                    {formatTanggal(cancelConfirmModal.raw.tanggal)}) dikenakan denda administratif{' '}
                    <strong>Rp50.000</strong>.
                  </p>
                </div>
              ) : (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 size={15} className="shrink-0" />
                  <span>Pembatalan pengajuan ini bebas biaya (tanpa denda).</span>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setCancelConfirmModal(null)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition"
              >
                Kembali
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition"
              >
                {cancelling ? 'Membatalkan...' : 'Ya, Batalkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
