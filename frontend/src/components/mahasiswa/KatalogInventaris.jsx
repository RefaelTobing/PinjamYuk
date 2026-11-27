import React, { useState, useMemo } from 'react';
import { 
  Search, Calendar, ChevronDown, Plus, Tv, 
  Microscope, Speaker, Armchair, Mic, Camera, Package, 
  Check, X
} from 'lucide-react';
import { formatRupiah, formatRentang } from '../../services/api';

/**
 * Resolusi Ikon Visual Berdasarkan Kode / Kategori / Nama Barang
 */
function getBarangIcon(barang) {
  const str = `${barang.kode} ${barang.nama} ${barang.kategori} ${barang.jenis}`.toLowerCase();
  if (str.includes('proy') || str.includes('projector') || str.includes('layar') || str.includes('tv')) {
    return <Tv size={26} strokeWidth={2} className="text-blue-600" />;
  }
  if (str.includes('mikro') || str.includes('lab') || str.includes('jas')) {
    return <Microscope size={26} strokeWidth={2} className="text-blue-600" />;
  }
  if (str.includes('pengeras') || str.includes('speaker') || str.includes('sound')) {
    return <Speaker size={26} strokeWidth={2} className="text-blue-600" />;
  }
  if (str.includes('kursi') || str.includes('meja') || str.includes('furnitur')) {
    return <Armchair size={26} strokeWidth={2} className="text-blue-600" />;
  }
  if (str.includes('mic') || str.includes('audio') || str.includes('suara')) {
    return <Mic size={26} strokeWidth={2} className="text-blue-600" />;
  }
  if (str.includes('kamera') || str.includes('camera') || str.includes('foto') || str.includes('video')) {
    return <Camera size={26} strokeWidth={2} className="text-blue-600" />;
  }
  return <Package size={26} strokeWidth={2} className="text-blue-600" />;
}

export default function KatalogInventaris({
  barangList = [],
  tglMulai,
  tglSelesai,
  onDateChange,
  cart = [],
  onAddToCart,
  onUpdateCartQuantity,
  loading = false
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('ALL');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Temporary date state for date picker popover
  const [tempMulai, setTempMulai] = useState(tglMulai);
  const [tempSelesai, setTempSelesai] = useState(tglSelesai);

  // Ambil daftar kategori unik dari inventaris barang
  const kategoriOptions = useMemo(() => {
    const set = new Set();
    barangList.forEach((b) => {
      if (b.kategori) set.add(b.kategori);
      if (b.jenis) set.add(b.jenis);
    });
    return Array.from(set);
  }, [barangList]);

  // Filter barang secara lokal dan reaktif
  const filteredBarang = useMemo(() => {
    return barangList.filter((b) => {
      // Kecualikan tipe RUANGAN jika ada dalam daftar barang
      if (b.jenis === 'RUANGAN' || b.dikelolaPerSlot) return false;

      // Filter Pencarian
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchNama = b.nama?.toLowerCase().includes(query);
        const matchKode = b.kode?.toLowerCase().includes(query);
        const matchKat = b.kategori?.toLowerCase().includes(query);
        if (!matchNama && !matchKode && !matchKat) return false;
      }

      // Filter Kategori
      if (kategoriFilter !== 'ALL') {
        const matchKat = b.kategori?.toLowerCase() === kategoriFilter.toLowerCase();
        const matchJenis = b.jenis?.toLowerCase() === kategoriFilter.toLowerCase();
        if (!matchKat && !matchJenis) return false;
      }

      return true;
    });
  }, [barangList, searchQuery, kategoriFilter]);

  // Handler simpan tanggal baru
  const handleApplyDate = (e) => {
    e.preventDefault();
    if (tempMulai && tempSelesai) {
      if (new Date(tempSelesai) < new Date(tempMulai)) {
        alert('Tanggal selesai tidak boleh sebelum tanggal mulai!');
        return;
      }
      onDateChange(tempMulai, tempSelesai);
      setIsDatePickerOpen(false);
    }
  };

  return (
    <div className="w-full">
      {/* ========================================================= */}
      {/* 1. JUDUL HALAMAN                                          */}
      {/* ========================================================= */}
      <h1 className="text-3xl font-extrabold text-slate-900 mb-6 tracking-tight">
        Katalog Inventaris
      </h1>

      {/* ========================================================= */}
      {/* 2. BILAH FILTER TERPADU (FILTER BAR CARD)                 */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-3.5 shadow-xs mb-8 flex flex-col md:flex-row items-center gap-3">
        {/* Kontrol 1: Pencarian Nama atau Kode */}
        <div className="flex-1 w-full relative flex items-center">
          <Search size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau kode barang..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Kontrol 2: Pemilih Rentang Tanggal Interaktif */}
        <div className="w-full md:w-auto relative">
          <button
            type="button"
            onClick={() => {
              setTempMulai(tglMulai);
              setTempSelesai(tglSelesai);
              setIsDatePickerOpen(!isDatePickerOpen);
            }}
            className="w-full md:w-auto px-4 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-sm font-medium text-slate-700 flex items-center justify-between md:justify-start gap-2.5 hover:bg-slate-100/70 transition cursor-pointer whitespace-nowrap"
          >
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-slate-400" />
              <span>{formatRentang(tglMulai, tglSelesai)}</span>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {/* Popover Form Ubah Rentang Tanggal */}
          {isDatePickerOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsDatePickerOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-30 animate-fade-in">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Pilih Rentang Peminjaman
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsDatePickerOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                </div>
                <form onSubmit={handleApplyDate} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tanggal Mulai Pinjam
                    </label>
                    <input
                      type="date"
                      value={tempMulai}
                      onChange={(e) => setTempMulai(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tanggal Batas Selesai
                    </label>
                    <input
                      type="date"
                      value={tempSelesai}
                      onChange={(e) => setTempSelesai(e.target.value)}
                      min={tempMulai}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsDatePickerOpen(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1.5"
                    >
                      <Check size={14} />
                      <span>Terapkan</span>
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Kontrol 3: Dropdown Kategori */}
        <div className="w-full md:w-56 relative flex items-center">
          <select
            value={kategoriFilter}
            onChange={(e) => setKategoriFilter(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200/80 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition cursor-pointer appearance-none pr-10"
          >
            <option value="ALL">Semua Kategori</option>
            {kategoriOptions.map((kat) => (
              <option key={kat} value={kat}>
                {kat}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. KARTU INVENTARIS (3-COLUMN RESPONSIVE GRID)             */}
      {/* ========================================================= */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs animate-pulse">
              <div className="bg-slate-100 rounded-2xl h-44 mb-4"></div>
              <div className="h-5 bg-slate-100 rounded-md w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-100 rounded-md w-1/2 mb-4"></div>
              <div className="h-10 bg-slate-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredBarang.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto shadow-xs">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Barang Tidak Ditemukan
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Tidak ada inventaris yang cocok dengan kriteria pencarian atau kategori yang dipilih.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setKategoriFilter('ALL');
            }}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-xs transition"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBarang.map((b) => {
            // Sisa stok riil dinamis yang diperhitungkan oleh backend
            const sisaStok = b.stokTersedia !== undefined ? b.stokTersedia : b.stok;
            const totalStok = b.stok || 1;
            const unitLabel = b.jenis === 'FURNITUR' || b.kategori === 'FUR' ? 'Unit' : (b.kategori === 'AUD' ? 'Set' : 'Unit');

            // Cek apakah item sudah berada dalam keranjang
            const cartItem = cart.find((c) => c.barang.kode === b.kode);
            const qtyInCart = cartItem ? cartItem.jumlah : 0;

            return (
              <div
                key={b.kode}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Area Ilustrasi Perangkat */}
                  <div className="bg-slate-50 rounded-2xl h-44 flex items-center justify-center relative mb-4 border border-slate-100/80 overflow-hidden">
                    {/* Badge Pojok Kanan Atas: Perlu Pembina */}
                    {b.perluPersetujuan && (
                      <span className="absolute top-3.5 right-3.5 bg-amber-50 text-amber-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-amber-200/60 shadow-2xs">
                        Perlu Pembina
                      </span>
                    )}

                    {/* Ikon Perangkat Pusat Dalam Squircle Putih */}
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-xs border border-slate-200/60 flex items-center justify-center">
                      {getBarangIcon(b)}
                    </div>
                  </div>

                  {/* Metadata Barang */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1 mb-1">
                    {b.nama}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mb-4">
                    {b.kode} • {b.kategori || b.jenis || 'Umum'}
                  </p>

                  {/* Informasi Stok & Denda */}
                  <div className="space-y-1.5 text-xs mb-5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Sisa Stok:</span>
                      <span
                        className={`font-bold ${
                          sisaStok > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {sisaStok} / {totalStok} {unitLabel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Denda Telat:</span>
                      <span className="text-slate-700 font-medium">
                        {formatRupiah(b.tarifHarian || 10000)}/hari
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi: + Tambah ATAU Stepper [- X Unit +] */}
                <div>
                  {qtyInCart === 0 ? (
                    sisaStok <= 0 ? (
                      <button
                        type="button"
                        disabled
                        className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 font-semibold text-sm cursor-not-allowed text-center"
                      >
                        Stok Habis
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onAddToCart(b)}
                        className="w-full py-2.5 rounded-xl border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Plus size={16} />
                        <span>Tambah</span>
                      </button>
                    )
                  ) : (
                    /* Kontrol Stepper Sesuai Mockup */
                    <div className="w-full flex items-center justify-between border border-blue-600 rounded-xl overflow-hidden text-sm font-semibold shadow-2xs">
                      {/* Tombol Kurangi Kuantitas */}
                      <button
                        type="button"
                        onClick={() => onUpdateCartQuantity(b.kode, qtyInCart - 1)}
                        className="px-4 py-2 text-blue-600 hover:bg-blue-50 transition font-bold text-base cursor-pointer"
                        title="Kurangi Kuantitas"
                      >
                        －
                      </button>

                      {/* Display Kuantitas Saat Ini */}
                      <span className="text-slate-800 text-sm font-semibold">
                        {qtyInCart} {unitLabel}
                      </span>

                      {/* Tombol Tambah Kuantitas */}
                      <button
                        type="button"
                        disabled={qtyInCart >= sisaStok}
                        onClick={() => onUpdateCartQuantity(b.kode, qtyInCart + 1)}
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white transition font-bold text-base cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        title={qtyInCart >= sisaStok ? 'Maksimal kuantitas tercapai' : 'Tambah Kuantitas'}
                      >
                        ＋
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
