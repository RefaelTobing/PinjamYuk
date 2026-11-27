import React, { useState, useMemo } from 'react';
import {
  ShieldCheck, GraduationCap, Calendar, FileText, Microscope,
  Tv, Package, Check, X, Info, AlertCircle, CheckCircle2, Clock
} from 'lucide-react';
import { formatRupiah, formatTanggal, formatRentang } from '../../services/api';

function calcDurationDays(mulai, selesai) {
  if (!mulai || !selesai) return 1;
  const diff = new Date(selesai).getTime() - new Date(mulai).getTime();
  const days = Math.round(diff / 86400000);
  return Math.max(1, days);
}

function getAssetIcon(item) {
  const str = `${item.kodeBarang} ${item.namaBarang} ${item.jenis}`.toLowerCase();
  if (str.includes('mikro') || str.includes('lab') || str.includes('alat')) {
    return <Microscope size={22} className="text-indigo-600" />;
  }
  if (str.includes('proy') || str.includes('kam') || str.includes('tv') || str.includes('elk')) {
    return <Tv size={22} className="text-indigo-600" />;
  }
  return <Package size={22} className="text-indigo-600" />;
}

export default function PersetujuanPembina({
  mode = 'antrean', // 'antrean' | 'riwayat'
  peminjamanList = [],
  barangList = [],
  onApprove,
  onReject
}) {
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [proposalModal, setProposalModal] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // Map kodeBarang -> master barang info (hargaSatuan, kategori, perluPersetujuan)
  const barangMap = useMemo(() => {
    const map = {};
    barangList.forEach((b) => {
      map[b.kode] = b;
    });
    return map;
  }, [barangList]);

  // Antrean menunggu persetujuan pembina
  const pendingList = useMemo(
    () =>
      peminjamanList.filter(
        (p) => p.status === 'DIAJUKAN' && p.butuhPembina && !p.idPembina
      ),
    [peminjamanList]
  );

  // Riwayat pengajuan khusus yang sudah ditinjau pembina
  const historyList = useMemo(
    () =>
      peminjamanList.filter(
        (p) => p.butuhPembina && (p.idPembina || p.status !== 'DIAJUKAN')
      ),
    [peminjamanList]
  );

  const handleApproveClick = async (p) => {
    setProcessingId(p.id);
    try {
      await onApprove(p.id, '');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectTarget || !rejectReason.trim()) return;
    setProcessingId(rejectTarget.id);
    try {
      await onReject(rejectTarget.id, rejectReason.trim());
      setRejectTarget(null);
      setRejectReason('');
    } finally {
      setProcessingId(null);
    }
  };

  if (mode === 'riwayat') {
    return (
      <div className="w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Riwayat Persetujuan Pembina
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Daftar pengajuan barang khusus yang telah Anda tinjau atau verifikasi.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold self-start md:self-auto">
            {historyList.length} Transaksi
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {historyList.length === 0 ? (
            <div className="p-12 text-center">
              <Clock size={28} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Belum ada riwayat keputusan</p>
              <p className="text-xs text-slate-400 mt-1">
                Keputusan persetujuan atau penolakan Anda akan tercatat di sini.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {historyList.map((p) => (
                <div
                  key={p.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-slate-900">
                        {p.id}
                      </span>
                      <span className="text-xs text-slate-400">&bull;</span>
                      <span className="text-xs font-bold text-slate-800">
                        {p.namaMahasiswa} ({p.nim})
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          p.status === 'DITOLAK'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {p.status === 'DITOLAK' ? 'Ditolak' : p.labelStatus || 'Disetujui Pembina'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 mt-1.5">{p.keperluan}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Jadwal: {formatRentang(p.tanggalMulai, p.tanggalSelesai)}
                      {p.catatanPetugas ? ` • Catatan: ${p.catatanPetugas}` : ''}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {p.items?.map((it, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/80 text-[11px] font-bold"
                      >
                        {it.jumlah}x {it.namaBarang}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ========================================================= */}
      {/* 1. HEADER HALAMAN                                         */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Antrean Persetujuan Barang Khusus
          </h1>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {pendingList.length} Menunggu
          </span>
        </div>

        <p className="text-sm text-slate-500 font-medium">
          Pemberian rekomendasi kelayakan peminjaman inventaris bernilai tinggi.
        </p>
      </div>

      {/* ========================================================= */}
      {/* 2. KARTU ANTREAN PENGAJUAN (MINIMALIST CARD LIST)         */}
      {/* ========================================================= */}
      {pendingList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={28} />
          </div>
          <h2 className="text-base font-extrabold text-slate-900">
            Seluruh Antrean Sudah Ditinjau
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Saat ini tidak ada pengajuan peminjaman alat laboratorium atau elektronik bernilai tinggi yang menunggu persetujuan Anda.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingList.map((p) => {
            const durasiHari = calcDurationDays(p.tanggalMulai, p.tanggalSelesai);
            const isProcessing = processingId === p.id;

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs hover:border-slate-300/90 transition"
              >
                {/* Baris Atas: ID & Tanggal + Badge Kategori Otorisasi */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-extrabold text-slate-900">
                      {p.id}
                    </span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="font-medium text-slate-500">
                      Diajukan {formatTanggal(p.tanggalPengajuan)}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50/80 text-indigo-800 border border-indigo-200/70 text-xs font-bold">
                    <ShieldCheck size={14} className="text-indigo-600" />
                    Perlu Otorisasi Lab/Elektronik
                  </span>
                </div>

                {/* Profil Pemohon */}
                <div className="flex items-center gap-3.5 my-5">
                  <div className="w-11 h-11 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200/80 shrink-0">
                    <GraduationCap size={21} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {p.namaMahasiswa}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      NIM {p.nim} &bull; Mahasiswa Aktif
                    </p>
                  </div>
                </div>

                {/* Kotak Rincian Jadwal & Keperluan */}
                <div className="bg-slate-50/90 border border-slate-200/70 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Jadwal Peminjaman
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Calendar size={15} className="text-slate-500 shrink-0" />
                      <span>
                        {formatRentang(p.tanggalMulai, p.tanggalSelesai)} ({durasiHari} Hari)
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Keperluan
                    </p>
                    <div className="flex items-start gap-2 text-xs font-semibold text-slate-800">
                      <FileText size={15} className="text-slate-500 shrink-0 mt-0.5" />
                      <span>{p.keperluan}</span>
                    </div>
                  </div>
                </div>

                {/* Kotak Sorotan Aset Bernilai Tinggi */}
                <div className="space-y-2.5 mb-5">
                  {p.items?.map((it, idx) => {
                    const master = barangMap[it.kodeBarang];
                    const hargaSatuan = master?.hargaSatuan || 0;
                    const estimasiNilai = hargaSatuan * (it.jumlah || 1);
                    const kategoriNama = master?.kategori || it.jenis || 'Inventaris Khusus';
                    const isHighValue = master?.perluPersetujuan || estimasiNilai >= 1000000;

                    return (
                      <div
                        key={idx}
                        className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-white border border-indigo-100 flex items-center justify-center shrink-0 shadow-2xs">
                            {getAssetIcon(it)}
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-900">
                              {it.jumlah}x {it.namaBarang}
                            </h4>
                            <p className="text-xs text-slate-600 font-medium mt-0.5">
                              {estimasiNilai > 0
                                ? `Estimasi Nilai: ${formatRupiah(estimasiNilai)} • `
                                : ''}
                              {kategoriNama} ({it.kodeBarang})
                            </p>
                          </div>
                        </div>

                        {isHighValue && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold self-start sm:self-auto shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Aset Bernilai Tinggi
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Baris Aksi Bawah */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setProposalModal(p)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-amber-900 transition cursor-pointer self-start sm:self-auto"
                  >
                    <FileText size={15} className="text-amber-700" />
                    Lihat Berkas Proposal PDF
                  </button>

                  <div className="flex items-center gap-2.5 self-end sm:self-auto">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => {
                        setRejectTarget(p);
                        setRejectReason('');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 font-semibold text-xs transition cursor-pointer disabled:opacity-50"
                    >
                      Tolak
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleApproveClick(p)}
                      className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-white font-semibold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                      <Check size={15} strokeWidth={2.5} />
                      {isProcessing ? 'Memproses...' : 'Setujui Pengajuan'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. FOOTER KETERANGAN                                      */}
      {/* ========================================================= */}
      <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Info size={15} className="text-slate-400 shrink-0" />
        <span>
          Persetujuan otomatis diteruskan ke Petugas Loket Sarpras untuk persiapan serah-terima fisik.
        </span>
      </div>

      {/* ========================================================= */}
      {/* MODAL PENOLAKAN (ALASAN WAJIB)                            */}
      {/* ========================================================= */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="text-rose-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Tolak Pengajuan {rejectTarget.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                Pengajuan oleh <strong>{rejectTarget.namaMahasiswa}</strong> ({rejectTarget.nim}) akan ditolak dan dibatalkan.
              </p>

              <div>
                <label
                  htmlFor="alasan-penolakan"
                  className="block text-xs font-bold text-slate-800 mb-1.5"
                >
                  Alasan Penolakan <span className="text-rose-600">*</span>
                </label>
                <textarea
                  id="alasan-penolakan"
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Tuliskan alasan kelayakan atau pertimbangan penolakan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!rejectReason.trim() || processingId === rejectTarget.id}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  {processingId === rejectTarget.id ? 'Menolak...' : 'Konfirmasi Penolakan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL PRATINJAU BERKAS PROPOSAL                           */}
      {/* ========================================================= */}
      {proposalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-amber-700" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Ringkasan Proposal Pengajuan
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setProposalModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nomor Pengajuan</span>
                  <strong className="font-mono text-slate-900">{proposalModal.id}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pemohon</span>
                  <strong className="text-slate-900">
                    {proposalModal.namaMahasiswa} ({proposalModal.nim})
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal Pakai</span>
                  <strong className="text-slate-900">
                    {formatRentang(proposalModal.tanggalMulai, proposalModal.tanggalSelesai)}
                  </strong>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Deskripsi Kegiatan / Proposal
                </p>
                <p className="p-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 leading-relaxed">
                  {proposalModal.keperluan}
                </p>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setProposalModal(null)}
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
