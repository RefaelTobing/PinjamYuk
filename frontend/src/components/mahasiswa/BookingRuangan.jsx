import React, { useState, useMemo } from 'react';
import { 
  Calendar, Clock, Users, AlertTriangle, 
  ChevronRight, Check
} from 'lucide-react';
import { formatTanggal } from '../../services/api';

export default function BookingRuangan({
  user,
  ruanganList = [],
  selectedRuangan,
  setSelectedRuangan,
  tglBooking,
  setTglBooking,
  jadwalSlots = [],
  loadingJadwal = false,
  onSubmitBooking,
  showToast,
  setActiveTab
}) {
  const [selectedSlots, setSelectedSlots] = useState([]); // array of slot objects: [{ jamMulai, jamSelesai, ... }]
  const [jumlahPeserta, setJumlahPeserta] = useState(20);
  const [keperluan, setKeperluan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Batas minimum tanggal booking sesuai aturan bisnis kampus (minimal H-3)
  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  }, []);

  // Preset tanggal cepat
  const setQuickDate = (offsetDays) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const dateStr = d.toISOString().split('T')[0];
    setTglBooking(dateStr);
    setSelectedSlots([]);
  };

  // Toggle seleksi slot jam dengan validasi urutan
  const handleSlotClick = (slot) => {
    if (slot.status === 'TERISI') return;

    const exists = selectedSlots.some((s) => s.jamMulai === slot.jamMulai);

    if (exists) {
      // Hapus slot
      setSelectedSlots(selectedSlots.filter((s) => s.jamMulai !== slot.jamMulai));
    } else {
      // Batasi maksimal 6 jam
      if (selectedSlots.length >= 6) {
        showToast('Batas maksimal booking adalah 6 jam berturut-turut dalam satu hari', 'error');
        return;
      }

      // Tambahkan slot baru dan urutkan
      const updated = [...selectedSlots, slot].sort((a, b) => 
        a.jamMulai.localeCompare(b.jamMulai)
      );
      setSelectedSlots(updated);
    }
  };

  // Hitung jam mulai dan jam selesai dari slot yang dipilih
  const timeSummary = useMemo(() => {
    if (selectedSlots.length === 0) return null;
    const sorted = [...selectedSlots].sort((a, b) => a.jamMulai.localeCompare(b.jamMulai));
    const jamMulai = sorted[0].jamMulai;
    const jamSelesai = sorted[sorted.length - 1].jamSelesai;
    const durasiJam = sorted.length;

    // Hitung nomor slot (Slot 1 = 07:00, Slot 2 = 08:00, ...)
    const slotMulaiNum = parseInt(jamMulai.split(':')[0], 10) - 6;
    const slotSelesaiNum = parseInt(jamSelesai.split(':')[0], 10) - 6;

    return { jamMulai, jamSelesai, durasiJam, slotMulaiNum, slotSelesaiNum };
  }, [selectedSlots]);

  // Validasi kapasitas ruangan
  const isKapasitasExceeded = useMemo(() => {
    if (!selectedRuangan || !selectedRuangan.kapasitas) return false;
    return Number(jumlahPeserta) > Number(selectedRuangan.kapasitas);
  }, [selectedRuangan, jumlahPeserta]);

  // Eksekusi Submit Booking
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRuangan) {
      showToast('Pilih ruangan terlebih dahulu', 'error');
      return;
    }

    if (selectedSlots.length === 0) {
      showToast('Pilih minimal satu slot jam operasional yang tersedia', 'error');
      return;
    }

    if (!keperluan.trim()) {
      showToast('Deskripsi keperluan kegiatan wajib diisi', 'error');
      return;
    }

    if (isKapasitasExceeded) {
      showToast(`Jumlah peserta (${jumlahPeserta}) melebihi kapasitas ruangan (${selectedRuangan.kapasitas} orang)!`, 'error');
      return;
    }

    if (!timeSummary) return;

    setSubmitting(true);
    try {
      const payload = {
        nim: user?.nim || '220411100001',
        kodeRuangan: selectedRuangan.kode,
        tanggal: tglBooking,
        jamMulai: timeSummary.jamMulai,
        jamSelesai: timeSummary.jamSelesai,
        slotMulai: timeSummary.slotMulaiNum,
        slotSelesai: timeSummary.slotSelesaiNum,
        jumlahPeserta: Number(jumlahPeserta),
        keperluan: keperluan.trim()
      };

      await onSubmitBooking(payload);
      showToast(`Pengajuan booking ${selectedRuangan.nama} berhasil diajukan!`);
      setSelectedSlots([]);
      setKeperluan('');
      if (setActiveTab) setActiveTab('riwayat');
    } catch (err) {
      showToast(err.message || 'Gagal mengajukan booking ruangan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* ========================================================= */}
      {/* 1. HEADER HALAMAN                                         */}
      {/* ========================================================= */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Booking Ruangan Kampus
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Pilih fasilitas ruangan, periksa ketersediaan papan 14 slot jam (07.00 – 21.00 WIB), dan ajukan pemesanan.
        </p>
      </div>

      {/* ========================================================= */}
      {/* 2. DAFTAR PILIHAN RUANGAN (CARDS SELECTION)               */}
      {/* ========================================================= */}
      <div className="mb-8">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          1. Pilih Fasilitas Ruangan:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ruanganList.map((r) => {
            const isSelected = selectedRuangan?.kode === r.kode;
            return (
              <div
                key={r.kode}
                onClick={() => {
                  setSelectedRuangan(r);
                  setSelectedSlots([]);
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50/60 border-blue-600 ring-2 ring-blue-600/20 shadow-sm'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {r.kode}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                        <Check size={12} strokeWidth={3} />
                        <span>Dipilih</span>
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 mb-1">
                    {r.nama}
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    {r.fasilitas || 'Fasilitas standar pertemuan'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Kapasitas Fisik:</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Users size={14} className="text-slate-500" />
                    {r.kapasitas} Orang
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. PANEL PEMILIH TANGGAL KEGIATAN                         */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar size={18} className="text-blue-600" />
            <span>2. Tentukan Tanggal Pemakaian</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Jadwal diperbarui otomatis sesuai pemesanan yang disetujui pada hari bersangkutan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Tombol Preset Cepat */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setQuickDate(3)}
              className="px-2.5 py-1 rounded-lg hover:bg-white text-slate-700 hover:shadow-2xs transition"
            >
              +3 Hari (H-3)
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(4)}
              className="px-2.5 py-1 rounded-lg hover:bg-white text-slate-700 hover:shadow-2xs transition"
            >
              +4 Hari
            </button>
            <button
              type="button"
              onClick={() => setQuickDate(7)}
              className="px-2.5 py-1 rounded-lg hover:bg-white text-slate-700 hover:shadow-2xs transition"
            >
              +1 Minggu
            </button>
          </div>

          {/* Input Tanggal Kalender */}
          <input
            type="date"
            value={tglBooking}
            min={minDate}
            onChange={(e) => {
              setTglBooking(e.target.value);
              setSelectedSlots([]);
            }}
            className="px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. GRID VISUALISASI 14 SLOT JAM (07.00 - 21.00 WIB)       */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              3. Papan Ketersediaan 14 Slot Jam (07.00 – 21.00 WIB)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ruangan: <b>{selectedRuangan?.nama || 'Pilih Ruangan'}</b> • Tanggal: <b>{formatTanggal(tglBooking)}</b>
            </p>
          </div>

          {/* Legenda Warna Slot */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300"></span>
              <span className="text-slate-600">Tersedia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-blue-600 border border-blue-700"></span>
              <span className="text-slate-600">Dipilih</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-slate-200 border border-slate-300"></span>
              <span className="text-slate-400">Terisi / Bentrok</span>
            </div>
          </div>
        </div>

        {/* 14 Slots Grid (7 Kolom pada Desktop) */}
        {loadingJadwal ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 py-6">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {jadwalSlots.map((s, idx) => {
              const isTerisi = s.status === 'TERISI';
              const isSelected = selectedSlots.some((sel) => sel.jamMulai === s.jamMulai);

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isTerisi}
                  onClick={() => handleSlotClick(s)}
                  className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-between min-h-[82px] cursor-pointer ${
                    isTerisi
                      ? 'bg-slate-100/90 border-slate-200/90 text-slate-400 cursor-not-allowed opacity-60 shadow-none'
                      : isSelected
                      ? 'bg-blue-600 border-blue-700 text-white shadow-md shadow-blue-600/20 ring-2 ring-blue-500/30'
                      : 'bg-white border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-slate-800 shadow-2xs'
                  }`}
                >
                  <span className={`text-[11px] font-bold tracking-tight ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                    Slot {idx + 1}
                  </span>
                  <span className={`text-xs font-black tracking-tight ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                    {s.jamMulai} - {s.jamSelesai}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isTerisi
                        ? 'bg-slate-200 text-slate-500'
                        : isSelected
                        ? 'bg-blue-700 text-white'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    }`}
                  >
                    {isTerisi ? 'Terisi' : isSelected ? 'Dipilih' : 'Tersedia'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 5. FORM DETAIL PEMESANAN & SUBMIT                         */}
      {/* ========================================================= */}
      {selectedSlots.length > 0 && timeSummary && (
        <form
          onSubmit={handleBookingSubmit}
          className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                4. Lengkapi Formulir Pengajuan Booking
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pastikan seluruh data sesuai dengan rencana kegiatan organisasi / akademik.
              </p>
            </div>
            <div className="bg-blue-50 text-blue-800 px-3.5 py-1.5 rounded-xl border border-blue-100 text-xs font-bold flex items-center gap-2">
              <Clock size={16} className="text-blue-600" />
              <span>
                {timeSummary.jamMulai} – {timeSummary.jamSelesai} ({timeSummary.durasiJam} Jam)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Jumlah Peserta */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Estimasi Jumlah Peserta (Orang)
                </label>
                <span className="text-xs text-slate-400">
                  Maksimal: <b>{selectedRuangan?.kapasitas || 0} Orang</b>
                </span>
              </div>
              <input
                type="number"
                min="1"
                max={selectedRuangan?.kapasitas}
                value={jumlahPeserta}
                onChange={(e) => setJumlahPeserta(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 focus:outline-none transition ${
                  isKapasitasExceeded
                    ? 'border-rose-400 bg-rose-50/30 focus:ring-2 focus:ring-rose-200 text-rose-800'
                    : 'border-slate-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-600'
                }`}
                required
              />
              {isKapasitasExceeded && (
                <p className="text-xs text-rose-600 mt-1 font-semibold flex items-center gap-1">
                  <AlertTriangle size={13} />
                  <span>
                    Jumlah peserta ({jumlahPeserta}) melebihi daya tampung fisik ruangan ({selectedRuangan?.kapasitas} orang)!
                  </span>
                </p>
              )}
            </div>

            {/* Pemohon Informasi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Penanggung Jawab / Pemohon
              </label>
              <div className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-slate-700 font-medium flex items-center justify-between">
                <span>{user?.nama || 'Mahasiswa'}</span>
                <span className="text-xs text-slate-400 font-mono">NIM: {user?.nim || '-'}</span>
              </div>
            </div>
          </div>

          {/* Textarea Keperluan Kegiatan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Deskripsi Keperluan Acara / Kegiatan
            </label>
            <textarea
              rows="3"
              value={keperluan}
              onChange={(e) => setKeperluan(e.target.value)}
              placeholder="Contoh: Pelaksanaan Rapat Kerja Tahunan Himpunan Mahasiswa Jurusan, membutuhkan fasilitas proyektor dan sound system..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition"
              required
            ></textarea>
          </div>

          {/* Alert Box Denda Pembatalan (Aturan Bisnis) */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900">
            <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <span className="font-bold">Ketentuan & Denda Pembatalan: </span>
              Pengajuan booking yang telah disetujui petugas wajib digunakan dengan penuh tanggung jawab. 
              Pembatalan sepihak yang dilakukan kurang dari <b>H-1 tanggal kegiatan</b> akan dikenakan 
              <b> denda administratif sebesar Rp50.000</b> sesuai SOP Sarpras Kampus.
            </div>
          </div>

          {/* Tombol Aksi Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSelectedSlots([])}
              className="px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Reset Pilihan Slot
            </button>
            <button
              type="submit"
              disabled={submitting || isKapasitasExceeded}
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3.5 px-7 rounded-xl text-sm transition-all shadow-md shadow-blue-700/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{submitting ? 'Mengirim...' : 'Ajukan Booking Ruangan'}</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
