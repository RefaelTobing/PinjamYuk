import React, { useState, useMemo } from 'react';
import {
  X, Calendar, Trash2, Check, AlertCircle, Send, ShoppingBag
} from 'lucide-react';
import { formatRupiah, formatRentang } from '../../services/api';

export default function CartDrawer({
  isOpen,
  onClose,
  cart = [],
  tglMulai,
  tglSelesai,
  onUpdateQuantity,
  onRemoveItem,
  keperluan,
  setKeperluan,
  onSubmit,
  user,
  activeLoanCount = 0,
  totalUnpaidFines = 0
}) {
  const [submitting, setSubmitting] = useState(false);

  // Hitung durasi hari peminjaman (inklusif atau selisih hari, minimal 1 hari)
  const durasiHari = useMemo(() => {
    if (!tglMulai || !tglSelesai) return 0;
    const start = new Date(tglMulai);
    const end = new Date(tglSelesai);
    const diffMs = end.getTime() - start.getTime();
    const days = Math.round(diffMs / 86400000);
    return days >= 0 ? Math.max(1, days) : -1;
  }, [tglMulai, tglSelesai]);

  const isDurationValid = durasiHari >= 1 && durasiHari <= 7;
  const isMahasiswaAktif = user?.statusAktif !== false;
  const isKuotaTersedia = activeLoanCount < 2;
  const isBebasDenda = totalUnpaidFines <= 0;
  const allPrerequisitesMet = isMahasiswaAktif && isKuotaTersedia && isBebasDenda;

  const hasPerluPembina = useMemo(
    () => cart.some((item) => item.barang?.perluPersetujuan),
    [cart]
  );

  const canSubmit =
    cart.length > 0 &&
    keperluan.trim().length > 0 &&
    isDurationValid &&
    allPrerequisitesMet &&
    !submitting;

  if (!isOpen) return null;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs transition-opacity">
      {/* Backdrop klik untuk tutup */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide-Over Drawer Kanan */}
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        {/* ========================================================= */}
        {/* 1. HEADER DRAWER                                          */}
        {/* ========================================================= */}
        <div className="px-6 py-5 border-b border-slate-200/80 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Keranjang Pengajuan
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-xs font-bold">
              {cart.length} Item
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup keranjang"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* ========================================================= */}
        {/* 2. KONTEN UTAMA (SCROLLABLE)                              */}
        {/* ========================================================= */}
        <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-6 space-y-5 flex-1">
            {/* Banner Rentang Peminjaman */}
            <div
              className={`rounded-xl border p-3.5 flex items-center justify-between gap-3 ${
                isDurationValid
                  ? 'bg-slate-50 border-slate-200/90 text-slate-700'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isDurationValid ? 'bg-blue-100/80 text-blue-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  <Calendar size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    Rentang Peminjaman
                  </p>
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {formatRentang(tglMulai, tglSelesai)}
                  </p>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${
                  isDurationValid
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}
              >
                {durasiHari >= 1 ? `${durasiHari} Hari` : 'Tidak Valid'}
              </span>
            </div>

            {!isDurationValid && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 flex items-start gap-2 text-xs text-rose-700 font-medium">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>
                  Durasi peminjaman maksimal adalah 7 hari dan tanggal selesai harus setelah tanggal mulai.
                </span>
              </div>
            )}

            {/* Daftar Barang Terpilih */}
            {cart.length === 0 ? (
              <div className="py-12 px-4 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag size={22} />
                </div>
                <p className="text-sm font-bold text-slate-700">Keranjang masih kosong</p>
                <p className="text-xs text-slate-500 mt-1">
                  Tambahkan barang dari katalog inventaris untuk mengajukan peminjaman.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => {
                  const b = item.barang;
                  const sisaStok = b.stokTersedia !== undefined ? b.stokTersedia : b.stok;
                  return (
                    <div
                      key={b.kode}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <h3 className="text-sm font-bold text-slate-900 truncate">
                              {b.nama}
                            </h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-medium">
                            <span>
                              {b.kode} &bull; {b.kategori || b.jenis}
                            </span>
                            {b.perluPersetujuan ? (
                              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                                Perlu Pembina
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                                Mandiri
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(b.kode)}
                          aria-label={`Hapus ${b.nama}`}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600">
                          Denda:{' '}
                          <span className="text-slate-900 font-bold">
                            {formatRupiah(b.tarifHarian || 0)}/hari
                          </span>
                        </span>

                        {/* Kontrol Stepper Kuantitas */}
                        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(b.kode, item.jumlah - 1)}
                            className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200/70 font-bold text-sm transition"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-extrabold text-slate-900 bg-white h-7 leading-7 border-x border-slate-200">
                            {item.jumlah}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(b.kode, item.jumlah + 1)}
                            disabled={item.jumlah >= sisaStok}
                            className={`w-7 h-7 flex items-center justify-center font-bold text-sm transition ${
                              item.jumlah >= sisaStok
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-600 hover:bg-slate-200/70'
                            }`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Checklist Prasyarat Otomatis */}
            <div
              className={`rounded-xl p-3.5 border ${
                allPrerequisitesMet
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs font-bold">
                <span
                  className={`inline-flex items-center gap-1 ${
                    isMahasiswaAktif ? 'text-emerald-800' : 'text-rose-700'
                  }`}
                >
                  {isMahasiswaAktif ? <Check size={14} strokeWidth={3} /> : <AlertCircle size={14} />}
                  {isMahasiswaAktif ? 'Mahasiswa Aktif' : 'Akun Nonaktif'}
                </span>

                <span
                  className={`inline-flex items-center gap-1 ${
                    isKuotaTersedia ? 'text-emerald-800' : 'text-rose-700'
                  }`}
                >
                  {isKuotaTersedia ? <Check size={14} strokeWidth={3} /> : <AlertCircle size={14} />}
                  Kuota Pinjam {activeLoanCount}/2
                </span>

                <span
                  className={`inline-flex items-center gap-1 ${
                    isBebasDenda ? 'text-emerald-800' : 'text-rose-700'
                  }`}
                >
                  {isBebasDenda ? <Check size={14} strokeWidth={3} /> : <AlertCircle size={14} />}
                  {isBebasDenda ? 'Bebas Denda' : `Denda ${formatRupiah(totalUnpaidFines)}`}
                </span>
              </div>

              <p
                className={`text-[11px] mt-1.5 font-medium ${
                  allPrerequisitesMet ? 'text-emerald-700' : 'text-amber-800'
                }`}
              >
                {!allPrerequisitesMet
                  ? 'Harap penuhi seluruh prasyarat (status aktif, kuota < 2, bebas tunggakan denda) sebelum mengajukan.'
                  : hasPerluPembina
                    ? 'Prasyarat terpenuhi. Barang bertanda Perlu Pembina akan diteruskan ke Dosen Pembina.'
                    : 'Seluruh prasyarat peminjaman mandiri terpenuhi.'}
              </p>
            </div>

            {/* Input Form Keperluan Kegiatan */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="keperluan-kegiatan"
                  className="text-xs font-bold text-slate-800"
                >
                  Keperluan Kegiatan
                </label>
                <span className="text-[11px] font-semibold text-slate-400">
                  Wajib diisi
                </span>
              </div>
              <textarea
                id="keperluan-kegiatan"
                rows={3}
                value={keperluan}
                onChange={(e) => setKeperluan(e.target.value)}
                placeholder="Contoh: Workshop Pemrograman Web Himpunan Mahasiswa..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition resize-none"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Deskripsikan acara secara ringkas untuk verifikasi bagian kemahasiswaan.
              </p>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 3. FOOTER TOMBOL EKSEKUSI PENGAJUAN                       */}
          {/* ========================================================= */}
          <div className="px-6 py-4 border-t border-slate-200/80 bg-slate-50/70 shrink-0">
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition ${
                canSubmit
                  ? 'bg-blue-700 hover:bg-blue-800 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send size={16} />
              {submitting ? 'Mengirim Pengajuan...' : 'Ajukan Peminjaman'}
            </button>
            <p className="text-[11px] text-slate-500 text-center mt-2">
              Persetujuan pembina akan diteruskan secara otomatis.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
