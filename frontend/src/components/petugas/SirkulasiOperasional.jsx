import React, { useState, useMemo } from 'react';
import {
  Clock, CheckCircle2, PackageCheck, ArrowRight,
  Building2, Package, Handshake, ClipboardCheck
} from 'lucide-react';
import { formatTanggal, formatRentang } from '../../services/api';
import InspeksiPengembalianModal from './InspeksiPengembalianModal';

export default function SirkulasiOperasional({
  peminjamanList = [],
  bookingList = [],
  barangList = [],
  onReviewPeminjaman,
  onReviewBooking,
  onSerahTerima,
  onCatatPengembalian
}) {
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'VERIFIKASI' | 'SERAH_TERIMA' | 'DIPINJAM' | 'BOOKING'
  const [inspeksiTarget, setInspeksiTarget] = useState(null);

  // Hitung statistik sirkulasi
  const stats = useMemo(() => {
    const needVerifyBarang = peminjamanList.filter(
      (p) => p.status === 'DIAJUKAN' && (!p.butuhPembina || p.idPembina)
    );
    const needVerifyBooking = bookingList.filter((b) => b.status === 'DIAJUKAN');
    const waitHandover = peminjamanList.filter((p) => p.status === 'DISETUJUI');
    const currentlyBorrowed = peminjamanList.filter((p) => p.status === 'DIPINJAM');

    return {
      perluVerifikasi: needVerifyBarang.length + needVerifyBooking.length,
      menungguSerahTerima: waitHandover.length,
      sedangDipinjam: currentlyBorrowed.length
    };
  }, [peminjamanList, bookingList]);

  // Daftar terpadu transaksi operasional aktif petugas
  const unifiedRows = useMemo(() => {
    const barangRows = peminjamanList
      .filter((p) => {
        if (p.status === 'DIAJUKAN') {
          return !p.butuhPembina || Boolean(p.idPembina);
        }
        return p.status === 'DISETUJUI' || p.status === 'DIPINJAM';
      })
      .map((p) => ({
        key: `P-${p.id}`,
        id: p.id,
        type: 'BARANG',
        status: p.status,
        raw: p
      }));

    const bookingRows = bookingList
      .filter((b) => b.status === 'DIAJUKAN' || b.status === 'DISETUJUI')
      .map((b) => ({
        key: `B-${b.id}`,
        id: b.id,
        type: 'RUANGAN',
        status: b.status,
        raw: b
      }));

    return [...barangRows, ...bookingRows];
  }, [peminjamanList, bookingList]);

  const filteredRows = useMemo(() => {
    if (filterTab === 'VERIFIKASI') {
      return unifiedRows.filter((r) => r.status === 'DIAJUKAN');
    }
    if (filterTab === 'SERAH_TERIMA') {
      return unifiedRows.filter((r) => r.type === 'BARANG' && r.status === 'DISETUJUI');
    }
    if (filterTab === 'DIPINJAM') {
      return unifiedRows.filter((r) => r.type === 'BARANG' && r.status === 'DIPINJAM');
    }
    if (filterTab === 'BOOKING') {
      return unifiedRows.filter((r) => r.type === 'RUANGAN');
    }
    return unifiedRows;
  }, [unifiedRows, filterTab]);

  const getStatusPill = (row) => {
    switch (row.status) {
      case 'DIAJUKAN':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'DISETUJUI':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'DIPINJAM':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="w-full">
      {/* ========================================================= */}
      {/* 1. HEADER HALAMAN                                         */}
      {/* ========================================================= */}
      <div className="mb-7">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Operasional Sirkulasi &amp; Verifikasi
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Verifikasi kelayakan pengajuan, serah-terima fisik di loket, dan inspeksi pengembalian barang.
        </p>
      </div>

      {/* ========================================================= */}
      {/* 2. KARTU STATISTIK SIRKULASI                              */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              Perlu Verifikasi
            </p>
            <p className="text-2xl font-extrabold text-slate-900">
              {stats.perluVerifikasi}{' '}
              <span className="text-sm font-bold text-slate-500">Pengajuan</span>
            </p>
            <p className="text-xs text-slate-500 mt-1.5">Barang &amp; booking ruangan baru</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              Menunggu Serah Terima
            </p>
            <p className="text-2xl font-extrabold text-slate-900">
              {stats.menungguSerahTerima}{' '}
              <span className="text-sm font-bold text-slate-500">Siap Ambil</span>
            </p>
            <p className="text-xs text-slate-500 mt-1.5">Telah disetujui, siap serah fisik</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
              Sedang Dipinjam
            </p>
            <p className="text-2xl font-extrabold text-slate-900">
              {stats.sedangDipinjam}{' '}
              <span className="text-sm font-bold text-slate-500">Aktif</span>
            </p>
            <p className="text-xs text-slate-500 mt-1.5">Menunggu inspeksi pengembalian</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <PackageCheck size={22} />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. FILTER TABS                                            */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center bg-white border border-slate-200/90 p-1 rounded-xl shadow-2xs gap-1">
          {[
            { id: 'ALL', label: 'Semua Aktif' },
            { id: 'VERIFIKASI', label: 'Perlu Verifikasi' },
            { id: 'SERAH_TERIMA', label: 'Serah Terima' },
            { id: 'DIPINJAM', label: 'Dipinjam (Kembali)' },
            { id: 'BOOKING', label: 'Booking Ruangan' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filterTab === tab.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Menampilkan <strong className="text-slate-800">{filteredRows.length}</strong> Antrean
        </span>
      </div>

      {/* ========================================================= */}
      {/* 4. TABEL SIRKULASI OPERASIONAL                            */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70">
                <th className="py-3.5 px-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  ID &amp; Tipe
                </th>
                <th className="py-3.5 px-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Pemohon
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
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 px-6 text-center">
                    <p className="text-sm font-bold text-slate-700">
                      Tidak ada antrean operasional saat ini
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Semua pengajuan dan sirkulasi fisik pada filter ini telah selesai diproses.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const raw = row.raw;
                  const isBarang = row.type === 'BARANG';

                  return (
                    <tr key={row.key} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-5 align-middle whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isBarang
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-indigo-50 text-indigo-700'
                            }`}
                          >
                            {isBarang ? <Package size={15} /> : <Building2 size={15} />}
                          </div>
                          <div>
                            <span className="font-mono text-xs font-extrabold text-slate-900">
                              {raw.id}
                            </span>
                            <p className="text-[10px] font-bold uppercase text-slate-400">
                              {isBarang ? 'Inventaris' : 'Ruangan'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5 align-middle">
                        <p className="text-xs font-bold text-slate-900">{raw.namaMahasiswa}</p>
                        <p className="text-[11px] text-slate-500">NIM {raw.nim}</p>
                      </td>

                      <td className="py-4 px-5 align-middle">
                        {isBarang ? (
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-1">
                              {raw.items?.map((it, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-semibold"
                                >
                                  {it.namaBarang} ({it.jumlah}x)
                                </span>
                              ))}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {raw.keperluan}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs font-bold text-slate-900">
                              {raw.namaRuangan} ({raw.kodeRuangan})
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {raw.keperluan} ({raw.jumlahPeserta} org)
                            </p>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-5 align-middle whitespace-nowrap text-xs font-semibold text-slate-700">
                        {isBarang
                          ? formatRentang(raw.tanggalMulai, raw.tanggalSelesai)
                          : `${formatTanggal(raw.tanggal)} • ${raw.jamMulai}–${raw.jamSelesai}`}
                      </td>

                      <td className="py-4 px-5 align-middle whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-bold ${getStatusPill(
                            row
                          )}`}
                        >
                          {raw.labelStatus || raw.status}
                        </span>
                      </td>

                      <td className="py-4 px-5 align-middle text-right whitespace-nowrap">
                        {row.status === 'DIAJUKAN' && (
                          <button
                            type="button"
                            onClick={() =>
                              isBarang ? onReviewPeminjaman(raw) : onReviewBooking(raw)
                            }
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                          >
                            Verifikasi
                            <ArrowRight size={13} />
                          </button>
                        )}

                        {isBarang && row.status === 'DISETUJUI' && (
                          <button
                            type="button"
                            onClick={() => onSerahTerima(raw.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                          >
                            <Handshake size={14} />
                            Serah Terima
                          </button>
                        )}

                        {isBarang && row.status === 'DIPINJAM' && (
                          <button
                            type="button"
                            onClick={() => setInspeksiTarget(raw)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                          >
                            <ClipboardCheck size={14} />
                            Proses Kembali
                          </button>
                        )}
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
      {/* 5. MODAL INSPEKSI PENGEMBALIAN FISIK                      */}
      {/* ========================================================= */}
      {inspeksiTarget && (
        <InspeksiPengembalianModal
          peminjaman={inspeksiTarget}
          barangList={barangList}
          onClose={() => setInspeksiTarget(null)}
          onSubmit={async (id, payload) => {
            await onCatatPengembalian(id, payload);
            setInspeksiTarget(null);
          }}
        />
      )}
    </div>
  );
}
