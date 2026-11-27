import React, { useState, useMemo } from 'react';
import {
  Calendar, Download, ArrowLeftRight, Hourglass, Wallet,
  Search, Bell, Landmark, AlertTriangle, Clock, ChevronLeft,
  ChevronRight, Receipt, CheckCircle2, X
} from 'lucide-react';
import { formatRupiah, formatTanggal } from '../../services/api';

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function diffDaysFromToday(dateStr) {
  if (!dateStr) return 0;
  const target = new Date(dateStr + 'T00:00:00');
  const today = new Date(getTodayStr() + 'T00:00:00');
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export default function MonitoringLaporan({
  peminjamanList = [],
  bookingList = [],
  laporanRingkasan = null,
  laporanKategori = [],
  jatuhTempoList = [],
  showToast
}) {
  const [periode, setPeriode] = useState('ALL'); // 'ALL' | '2026-11' | '2026-10'
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'JATUH_TEMPO' | 'LUNAS_DENDA'
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [remindedIds, setRemindedIds] = useState({});
  const [kuitansiModal, setKuitansiModal] = useState(null);
  const pageSize = 6;

  // Map ID jatuh tempo dari backend untuk hariTerlambat akurat
  const jatuhTempoMap = useMemo(() => {
    const map = {};
    jatuhTempoList.forEach((j) => {
      map[j.id] = j;
    });
    return map;
  }, [jatuhTempoList]);

  // Gabungkan transaksi peminjaman & booking sesuai filter periode
  const periodTransactions = useMemo(() => {
    const matchPeriode = (dateStr) => {
      if (periode === 'ALL') return true;
      return typeof dateStr === 'string' && dateStr.startsWith(periode);
    };

    const pRows = peminjamanList
      .filter((p) => matchPeriode(p.tanggalMulai) || matchPeriode(p.tanggalPengajuan))
      .map((p) => {
        const jt = jatuhTempoMap[p.id];
        const diffDays = diffDaysFromToday(p.tanggalSelesai);
        const isBorrowed = p.status === 'DIPINJAM';
        const isOverdue = Boolean(jt) || (isBorrowed && diffDays < 0);
        const isDueSoon = isBorrowed && diffDays >= 0 && diffDays <= 1;
        const hariTerlambat = jt?.hariTerlambat ?? (isOverdue ? Math.abs(diffDays) : 0);
        const denda = p.pengembalian?.denda || 0;
        const lunas = Boolean(p.pengembalian?.lunas);

        return {
          key: `P-${p.id}`,
          id: p.id,
          type: 'BARANG',
          peminjam: p.namaMahasiswa,
          nim: p.nim,
          itemLabel:
            p.items && p.items.length > 0
              ? p.items.length > 1
                ? `${p.items[0].namaBarang} (+${p.items.length - 1} lainnya)`
                : `${p.items[0].namaBarang} (${p.items[0].jumlah} Unit)`
              : 'Inventaris Kampus',
          tenggat: p.tanggalSelesai,
          status: p.status,
          labelStatus: p.labelStatus || p.status,
          isOverdue,
          isDueSoon,
          hariTerlambat,
          denda,
          lunas,
          raw: p
        };
      });

    const bRows = bookingList
      .filter((b) => matchPeriode(b.tanggal) || matchPeriode(b.tanggalPengajuan))
      .map((b) => {
        const denda = b.dendaPembatalan || 0;
        const lunas = Boolean(b.dendaLunas);
        return {
          key: `B-${b.id}`,
          id: b.id,
          type: 'RUANGAN',
          peminjam: b.namaMahasiswa,
          nim: b.nim,
          itemLabel: `${b.namaRuangan} (${b.jumlahPeserta} Orang)`,
          tenggat: b.tanggal,
          status: b.status,
          labelStatus: b.labelStatus || b.status,
          isOverdue: false,
          isDueSoon: b.status === 'DISETUJUI' && diffDaysFromToday(b.tanggal) <= 1 && diffDaysFromToday(b.tanggal) >= 0,
          hariTerlambat: 0,
          denda,
          lunas,
          raw: b
        };
      });

    // Prioritaskan: Terlambat -> Jatuh Tempo Dekat -> Dipinjam -> Lainnya
    return [...pRows, ...bRows].sort((a, b) => {
      const score = (x) => {
        if (x.isOverdue) return 0;
        if (x.isDueSoon) return 1;
        if (x.status === 'DIPINJAM') return 2;
        if (x.denda > 0) return 3;
        return 4;
      };
      return score(a) - score(b);
    });
  }, [peminjamanList, bookingList, periode, jatuhTempoMap]);

  // Hitung metrik untuk 3 Top Analytics Cards
  const metrics = useMemo(() => {
    const barangCount = periodTransactions.filter((t) => t.type === 'BARANG').length;
    const bookingCount = periodTransactions.filter((t) => t.type === 'RUANGAN').length;
    const overdueCount = periodTransactions.filter((t) => t.isOverdue).length;
    const dueSoonCount = periodTransactions.filter((t) => t.isDueSoon).length;
    const totalDendaCalc = periodTransactions.reduce((sum, t) => sum + (t.denda || 0), 0);
    const displayDenda =
      periode === 'ALL' && laporanRingkasan?.totalDenda !== undefined
        ? Math.max(laporanRingkasan.totalDenda, totalDendaCalc)
        : totalDendaCalc;

    return {
      totalTransaksi: periodTransactions.length,
      barangCount,
      bookingCount,
      followUpCount: overdueCount + dueSoonCount,
      overdueCount,
      dueSoonCount,
      totalDenda: displayDenda
    };
  }, [periodTransactions, periode, laporanRingkasan]);

  // Filter tabel berdasarkan filterTab & searchQuery
  const filteredRows = useMemo(() => {
    return periodTransactions.filter((row) => {
      if (filterTab === 'JATUH_TEMPO') {
        if (!row.isOverdue && !row.isDueSoon && row.status !== 'DIPINJAM') return false;
      } else if (filterTab === 'LUNAS_DENDA') {
        if (row.denda <= 0) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = row.id?.toLowerCase().includes(q);
        const matchNama = row.peminjam?.toLowerCase().includes(q);
        const matchItem = row.itemLabel?.toLowerCase().includes(q);
        if (!matchId && !matchNama && !matchItem) return false;
      }
      return true;
    });
  }, [periodTransactions, filterTab, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, safePage]);

  const handleSendReminder = (row) => {
    setRemindedIds((prev) => ({ ...prev, [row.id]: true }));
    showToast(
      `Pengingat WhatsApp & Email terkirim ke ${row.peminjam} (${row.id})`
    );
  };

  const handleExportReport = () => {
    let csv = 'ID Transaksi,Tipe,Peminjam,NIM,Item/Ruangan,Tenggat,Status,Total Denda,Status Lunas\n';
    filteredRows.forEach((r) => {
      csv += `"${r.id}","${r.type}","${r.peminjam}","${r.nim}","${r.itemLabel}","${r.tenggat}","${r.isOverdue ? 'Jatuh Tempo' : r.labelStatus}",${r.denda},"${r.denda > 0 ? (r.lunas ? 'Lunas' : 'Belum Lunas') : '-'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rekap_laporan_sirkulasi_${periode}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Rekap laporan sirkulasi berhasil diunduh (CSV)');
  };

  return (
    <div className="w-full">
      {/* ========================================================= */}
      {/* 1. HEADER HALAMAN                                         */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-7">
        <div>
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-1">
            PETUGAS SARPRAS / ANALITIK &amp; PENGAWASAN
          </p>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Monitoring &amp; Laporan Sirkulasi
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Pantau kepatuhan peminjaman, estimasi barang jatuh tempo, dan rekapitulasi penerimaan kompensasi denda operasional kampus secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
          <div className="relative flex items-center">
            <Calendar size={15} className="absolute left-3.5 text-slate-500 pointer-events-none" />
            <select
              value={periode}
              onChange={(e) => {
                setPeriode(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:border-blue-600 shadow-2xs cursor-pointer"
            >
              <option value="ALL">Semua Periode</option>
              <option value="2026-11">Bulan Ini: November 2026</option>
              <option value="2026-10">Bulan Lalu: Oktober 2026</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportReport}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition cursor-pointer"
          >
            <Download size={16} />
            Unduh Rekap Laporan
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TIGA KARTU RINGKASAN METRIK (TOP ANALYTICS CARDS)      */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Card 1: Total Transaksi */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              Total Transaksi
            </p>
            <div className="flex items-center gap-2.5">
              <span className="text-3xl font-extrabold text-slate-900">
                {metrics.totalTransaksi}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                Aktif Terpantau
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {metrics.barangCount} peminjaman logistik &bull; {metrics.bookingCount} reservasi ruangan
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ArrowLeftRight size={21} />
          </div>
        </div>

        {/* Card 2: Mendekati / Lewat Jatuh Tempo */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              Mendekati Jatuh Tempo
            </p>
            <div className="flex items-center gap-2.5">
              <span className="text-3xl font-extrabold text-slate-900">
                {metrics.followUpCount}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Perlu Follow-up
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {metrics.overdueCount} lewat tenggat &bull; {metrics.dueSoonCount} jatuh tempo dekat
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Hourglass size={21} />
          </div>
        </div>

        {/* Card 3: Total Pemasukan Denda */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              Total Pemasukan Denda
            </p>
            <p className="text-3xl font-extrabold text-slate-900">
              {formatRupiah(metrics.totalDenda)}
            </p>
            <p className="text-xs text-slate-500 mt-2 font-medium flex items-center gap-1">
              <span>Keterlambatan &amp; ganti rugi</span>
              <span>&bull;</span>
              <span className="text-emerald-700 font-bold">&#10003; 100% Tercatat</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Wallet size={21} />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. TABEL DAFTAR JATUH TEMPO & REKAP DENDA                 */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden mb-6">
        {/* Header Tabel & Filter */}
        <div className="p-5 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-extrabold text-slate-900">
                Daftar Jatuh Tempo &amp; Rekap Denda
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                {metrics.followUpCount} Transaksi Prioritas
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pemantauan tenggat pengembalian barang aktif serta status pelunasan denda.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Filter Tabs */}
            <div className="inline-flex items-center bg-slate-100/80 p-1 rounded-xl">
              {[
                { id: 'ALL', label: 'Semua' },
                { id: 'JATUH_TEMPO', label: 'Jatuh Tempo' },
                { id: 'LUNAS_DENDA', label: 'Rekap Denda' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setFilterTab(t.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    filterTab === t.id
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari ID transaksi, nama..."
                className="pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-600 w-full sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70">
                <th className="py-3.5 px-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  ID Transaksi
                </th>
                <th className="py-3.5 px-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Peminjam
                </th>
                <th className="py-3.5 px-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Item / Ruangan
                </th>
                <th className="py-3.5 px-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Tenggat Kembali
                </th>
                <th className="py-3.5 px-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3.5 px-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Total Denda
                </th>
                <th className="py-3.5 px-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 px-6 text-center">
                    <p className="text-sm font-bold text-slate-700">
                      Tidak ada transaksi ditemukan
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Ubah filter atau kata kunci pencarian untuk melihat data lain.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => {
                  const isReminded = Boolean(remindedIds[row.id]);
                  return (
                    <tr key={row.key} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-5 align-middle whitespace-nowrap">
                        <span className="font-mono text-xs font-extrabold text-slate-900">
                          {row.id}
                        </span>
                      </td>

                      <td className="py-4 px-5 align-middle">
                        <p className="text-xs font-bold text-slate-900">{row.peminjam}</p>
                        <p className="text-[11px] text-slate-500">NIM {row.nim}</p>
                      </td>

                      <td className="py-4 px-5 align-middle">
                        <p className="text-xs font-semibold text-slate-800">{row.itemLabel}</p>
                      </td>

                      <td className="py-4 px-5 align-middle whitespace-nowrap">
                        {row.isOverdue ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                            <AlertTriangle size={13} />
                            Terlambat {row.hariTerlambat} Hari ({formatTanggal(row.tenggat)})
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                            <Clock size={13} className="text-slate-400" />
                            <span>{formatTanggal(row.tenggat)}</span>
                            {row.isDueSoon && (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                Segera
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-5 align-middle whitespace-nowrap">
                        {row.isOverdue ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Jatuh Tempo
                          </span>
                        ) : row.status === 'DIPINJAM' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            Dipinjam
                          </span>
                        ) : row.status === 'DIKEMBALIKAN' || row.status === 'SELESAI' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {row.labelStatus}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            {row.labelStatus}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 align-middle whitespace-nowrap">
                        <span
                          className={`text-xs font-extrabold ${
                            row.denda > 0 ? 'text-rose-600' : 'text-slate-700'
                          }`}
                        >
                          {formatRupiah(row.denda)}
                        </span>
                      </td>

                      <td className="py-4 px-5 align-middle text-right whitespace-nowrap">
                        {row.denda > 0 ? (
                          <button
                            type="button"
                            onClick={() => setKuitansiModal(row)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-emerald-700 transition cursor-pointer"
                          >
                            <Receipt size={13} />
                            Lihat Kuitansi
                          </button>
                        ) : row.status === 'DIPINJAM' || row.isOverdue || row.isDueSoon ? (
                          <button
                            type="button"
                            onClick={() => handleSendReminder(row)}
                            className={`text-xs font-bold transition cursor-pointer ${
                              isReminded
                                ? 'text-slate-400'
                                : 'text-emerald-700 hover:text-emerald-800'
                            }`}
                          >
                            {isReminded ? '✓ Pengingat Terkirim' : 'Kirim Pengingat'}
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">
                            Arsip Data
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bawah */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs font-medium text-slate-500">
            Menampilkan <strong className="text-slate-800">{paginatedRows.length}</strong> dari{' '}
            <strong className="text-slate-800">{filteredRows.length}</strong> transaksi perputaran sirkulasi
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-xs font-bold text-slate-700 px-2">
              Halaman {safePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. REKAP DISTRIBUSI KATEGORI                              */}
      {/* ========================================================= */}
      {laporanKategori.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs mb-6">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-4">
            Distribusi Peminjaman per Kategori Inventaris
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {laporanKategori.map((k, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-800">{k.kategori}</span>
                  <span className="text-blue-700">
                    {k.jumlahPeminjaman} Unit ({k.persentase}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${k.persentase}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. DUA KARTU INTEGRASI SISTEM DI BAGIAN BAWAH             */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Bell size={21} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Pengingat Otomatis Aktif
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Sistem SIPINJAM otomatis mengirim notifikasi WhatsApp &amp; Email H-2 jam sebelum tenggat batas pengembalian barang untuk menekan angka keterlambatan mahasiswa.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Landmark size={21} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Penyelesaian Denda Kasir Kampus
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Kompensasi denda tercatat langsung terintegrasi dengan portal keuangan akademik universitas (SIAKAD) dan dapat dilunasi via Virtual Account bank mitra.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL KUITANSI DENDA                                      */}
      {/* ========================================================= */}
      {kuitansiModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt size={18} className="text-emerald-700" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Kuitansi Denda • {kuitansiModal.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setKuitansiModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Total Kompensasi</p>
                  <p className="text-2xl font-black text-rose-600 mt-0.5">
                    {formatRupiah(kuitansiModal.denda)}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold border ${
                    kuitansiModal.lunas
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  <CheckCircle2 size={13} />
                  {kuitansiModal.lunas ? 'Lunas' : 'Menunggu Pelunasan'}
                </span>
              </div>

              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span>Mahasiswa</span>
                  <strong className="text-slate-900">
                    {kuitansiModal.peminjam} ({kuitansiModal.nim})
                  </strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span>Objek Transaksi</span>
                  <strong className="text-slate-900">{kuitansiModal.itemLabel}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span>Tenggat Kembali</span>
                  <strong className="text-slate-900">{formatTanggal(kuitansiModal.tenggat)}</strong>
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setKuitansiModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
