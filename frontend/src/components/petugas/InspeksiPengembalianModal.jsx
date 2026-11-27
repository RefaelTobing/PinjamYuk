import React, { useState, useMemo } from 'react';
import {
  ClipboardCheck, X, Receipt, Check, Package
} from 'lucide-react';
import { formatRupiah, formatTanggal } from '../../services/api';

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function calcLateDays(dueDateStr, returnDateStr) {
  if (!dueDateStr || !returnDateStr) return 0;
  const due = new Date(dueDateStr + 'T00:00:00');
  const ret = new Date(returnDateStr + 'T00:00:00');
  const diff = Math.round((ret.getTime() - due.getTime()) / 86400000);
  return Math.max(0, diff);
}

/**
 * Kalkulasi biaya kondisi sesuai polimorfisme OOP backend Java:
 * - ELEKTRONIK: Rusak Ringan Rp100.000, Rusak Berat 40% harga, Hilang 100% harga
 * - ALAT_LAB: Rusak Ringan Rp75.000, Rusak Berat 50% harga, Hilang 100% harga
 * - FURNITUR: Rusak Ringan Rp25.000, Rusak Berat 30% harga, Hilang 100% harga
 */
function calcBiayaKondisi(jenis, hargaSatuan, kondisi) {
  if (!kondisi || kondisi === 'BAIK') return 0;
  const harga = Number(hargaSatuan) || 0;
  const j = (jenis || 'ELEKTRONIK').toUpperCase();

  if (kondisi === 'HILANG') return harga;

  if (j === 'ALAT_LAB') {
    if (kondisi === 'RUSAK_RINGAN') return 75000;
    if (kondisi === 'RUSAK_BERAT') return harga * 0.5;
  } else if (j === 'FURNITUR') {
    if (kondisi === 'RUSAK_RINGAN') return 25000;
    if (kondisi === 'RUSAK_BERAT') return harga * 0.3;
  } else {
    // ELEKTRONIK (default)
    if (kondisi === 'RUSAK_RINGAN') return 100000;
    if (kondisi === 'RUSAK_BERAT') return harga * 0.4;
  }
  return 0;
}

function getDefaultTarifHarian(jenis) {
  const j = (jenis || 'ELEKTRONIK').toUpperCase();
  if (j === 'ALAT_LAB') return 15000;
  if (j === 'FURNITUR') return 5000;
  return 10000;
}

export default function InspeksiPengembalianModal({
  peminjaman,
  barangList = [],
  onClose,
  onSubmit
}) {
  const [tanggalKembali, setTanggalKembali] = useState(getTodayStr);
  const [kondisiMap, setKondisiMap] = useState(() => {
    const init = {};
    peminjaman?.items?.forEach((it) => {
      init[it.kodeBarang] = 'BAIK';
    });
    return init;
  });
  const [catatanPetugas, setCatatanPetugas] = useState('');
  const [dendaLunas, setDendaLunas] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const barangMap = useMemo(() => {
    const map = {};
    barangList.forEach((b) => {
      map[b.kode] = b;
    });
    return map;
  }, [barangList]);

  const hariTerlambat = useMemo(
    () => calcLateDays(peminjaman?.tanggalSelesai, tanggalKembali),
    [peminjaman?.tanggalSelesai, tanggalKembali]
  );

  // Kalkulasi denda real-time
  const { dendaTerlambat, dendaKondisi, totalDenda } = useMemo(() => {
    let telat = 0;
    let kondisi = 0;

    peminjaman?.items?.forEach((it) => {
      const master = barangMap[it.kodeBarang];
      const jenis = master?.jenis || it.jenis || 'ELEKTRONIK';
      const tarifHarian = master?.tarifHarian ?? getDefaultTarifHarian(jenis);
      const hargaSatuan = master?.hargaSatuan ?? 0;
      const qty = it.jumlah || 1;
      const k = kondisiMap[it.kodeBarang] || 'BAIK';

      telat += tarifHarian * hariTerlambat * qty;
      kondisi += calcBiayaKondisi(jenis, hargaSatuan, k) * qty;
    });

    return {
      dendaTerlambat: telat,
      dendaKondisi: kondisi,
      totalDenda: telat + kondisi
    };
  }, [peminjaman?.items, barangMap, kondisiMap, hariTerlambat]);

  if (!peminjaman) return null;

  const handleConfirm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(peminjaman.id, {
        tanggalKembali,
        kondisiAkhir: kondisiMap,
        catatan: catatanPetugas.trim(),
        dendaLunas: totalDenda === 0 ? true : dendaLunas
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectBorderClass = (kondisi) => {
    if (kondisi === 'BAIK') return 'border-emerald-300 bg-emerald-50/40 text-emerald-900';
    if (kondisi === 'RUSAK_RINGAN') return 'border-amber-300 bg-amber-50/50 text-amber-900';
    return 'border-rose-300 bg-rose-50/50 text-rose-900';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* ========================================================= */}
        {/* 1. HEADER MODAL                                           */}
        {/* ========================================================= */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/70 shrink-0">
              <ClipboardCheck size={20} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Inspeksi Pengembalian &bull; {peminjaman.id}
                </h3>
                {hariTerlambat > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Terlambat {hariTerlambat} Hari
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Pemeriksaan fisik unit dan kalkulasi denda otomatis
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal inspeksi"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleConfirm}>
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* ========================================================= */}
            {/* 2. KOTAK INFORMASI PEMINJAM & WAKTU                       */}
            {/* ========================================================= */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                  Peminjam
                </p>
                <p className="font-bold text-slate-900 mt-0.5">
                  {peminjaman.namaMahasiswa}
                </p>
                <p className="text-[11px] text-slate-500">NIM {peminjaman.nim}</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Jadwal Kembali:</span>
                  <strong className="text-slate-900">
                    {formatTanggal(peminjaman.tanggalSelesai)}
                  </strong>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 font-medium">Aktual Kembali:</span>
                  <input
                    type="date"
                    value={tanggalKembali}
                    onChange={(e) => setTanggalKembali(e.target.value)}
                    className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 outline-none focus:border-emerald-600"
                  />
                </div>
                <div className="text-right">
                  {hariTerlambat > 0 ? (
                    <span className="text-[11px] font-bold text-rose-600">
                      (Terlambat {hariTerlambat} Hari)
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-700">
                      (Tepat Waktu)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* 3. FORMULIR PENGECEKAN KONDISI FISIK BARANG               */}
            {/* ========================================================= */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                  Cek Kondisi Fisik Barang
                </h4>
                <span className="text-xs font-bold text-slate-500">
                  {peminjaman.items?.length || 0} Item Terdaftar
                </span>
              </div>

              <div className="space-y-2.5">
                {peminjaman.items?.map((it) => {
                  const currentKondisi = kondisiMap[it.kodeBarang] || 'BAIK';
                  return (
                    <div
                      key={it.kodeBarang}
                      className="p-3.5 rounded-2xl border border-slate-200/90 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                          <Package size={17} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-slate-900 truncate">
                            {it.namaBarang} ({it.jumlah} Unit)
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            Kode: {it.kodeBarang} &bull; {it.jenis}
                          </p>
                        </div>
                      </div>

                      <select
                        value={currentKondisi}
                        onChange={(e) =>
                          setKondisiMap((prev) => ({
                            ...prev,
                            [it.kodeBarang]: e.target.value
                          }))
                        }
                        className={`px-3 py-2 rounded-xl border text-xs font-bold outline-none transition cursor-pointer ${getSelectBorderClass(
                          currentKondisi
                        )}`}
                      >
                        <option value="BAIK">Baik (Berfungsi Normal)</option>
                        <option value="RUSAK_RINGAN">Rusak Ringan</option>
                        <option value="RUSAK_BERAT">Rusak Berat</option>
                        <option value="HILANG">Hilang</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ========================================================= */}
            {/* 4. TEXTAREA CATATAN TAMBAHAN PETUGAS                      */}
            {/* ========================================================= */}
            <div>
              <label
                htmlFor="catatan-inspeksi"
                className="block text-xs font-bold text-slate-700 mb-1.5"
              >
                Catatan Tambahan Petugas
              </label>
              <textarea
                id="catatan-inspeksi"
                rows={2}
                value={catatanPetugas}
                onChange={(e) => setCatatanPetugas(e.target.value)}
                placeholder="Catatan kondisi fisik riil (opsional, misal: baut pengunci longgar)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 resize-none"
              />
            </div>

            {/* ========================================================= */}
            {/* 5. KOTAK RINCIAN TAGIHAN DENDA OTOMATIS                   */}
            {/* ========================================================= */}
            <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-2xl space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600 font-medium">
                <span>Denda Terlambat ({hariTerlambat} hari)</span>
                <span className="font-bold text-slate-900">
                  {formatRupiah(dendaTerlambat)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600 font-medium">
                <span>Denda Kondisi / Kerusakan</span>
                <span className="font-bold text-slate-900">
                  {formatRupiah(dendaKondisi)}
                </span>
              </div>

              <div className="pt-2.5 border-t border-blue-200/70 flex items-center justify-between">
                <span className="text-sm font-extrabold text-slate-900">
                  Total Denda:
                </span>
                <span
                  className={`text-xl font-black ${
                    totalDenda > 0 ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {formatRupiah(totalDenda)}
                </span>
              </div>

              {totalDenda > 0 && (
                <label className="flex items-center gap-2 pt-1.5 cursor-pointer text-[11px] font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={dendaLunas}
                    onChange={(e) => setDendaLunas(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                  />
                  <span>Mahasiswa langsung melunasi denda di loket sarpras</span>
                </label>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* 6. FOOTER MODAL                                           */}
          {/* ========================================================= */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <Receipt size={15} className="text-slate-400 shrink-0" />
              <span>Kuitansi denda otomatis diterbitkan ke akun mahasiswa</span>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                <Check size={15} strokeWidth={2.5} />
                {submitting ? 'Menyimpan...' : 'Simpan Pengembalian'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
