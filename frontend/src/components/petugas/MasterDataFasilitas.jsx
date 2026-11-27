import React, { useState, useMemo } from 'react';
import {
  Plus, Package, Building2, Search, Download, Pencil, Trash2,
  ShieldCheck, CreditCard, QrCode, X, ChevronLeft, ChevronRight,
  AlertCircle, Users
} from 'lucide-react';
import { formatRupiah } from '../../services/api';

const OOP_RULES = {
  ELEKTRONIK: {
    label: 'BarangElektronik',
    kategoriKode: 'ELK',
    tarifHarian: 'Rp10.000/hari',
    rusakRingan: 'Rp100.000',
    rusakBerat: '40% harga satuan'
  },
  ALAT_LAB: {
    label: 'AlatLaboratorium',
    kategoriKode: 'LAB',
    tarifHarian: 'Rp15.000/hari',
    rusakRingan: 'Rp75.000',
    rusakBerat: '50% harga satuan'
  },
  FURNITUR: {
    label: 'BarangFurnitur',
    kategoriKode: 'FUR',
    tarifHarian: 'Rp5.000/hari',
    rusakRingan: 'Rp25.000',
    rusakBerat: '30% harga satuan'
  }
};

export default function MasterDataFasilitas({
  barangList = [],
  ruanganList = [],
  peminjamanList = [],
  onAddBarang,
  onEditBarang,
  onAddRuangan,
  showToast
}) {
  const [subTab, setSubTab] = useState('BARANG'); // 'BARANG' | 'RUANGAN'
  const [searchQuery, setSearchQuery] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('ALL'); // 'ALL' | 'Elektronik' | 'Alat Laboratorium' | 'Furnitur'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals
  const [barangModal, setBarangModal] = useState(null); // { mode: 'ADD' | 'EDIT', data }
  const [ruanganModal, setRuanganModal] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [ruanganForm, setRuanganForm] = useState({
    kode: '',
    nama: '',
    kapasitas: 30,
    fasilitas: 'Proyektor, AC, Papan Tulis'
  });

  // Hitung unit sedang terpinjam per kodeBarang dari transaksi aktif (DISETUJUI / DIPINJAM)
  const borrowedCountMap = useMemo(() => {
    const map = {};
    peminjamanList
      .filter((p) => p.status === 'DISETUJUI' || p.status === 'DIPINJAM')
      .forEach((p) => {
        p.items?.forEach((it) => {
          map[it.kodeBarang] = (map[it.kodeBarang] || 0) + (it.jumlah || 0);
        });
      });
    return map;
  }, [peminjamanList]);

  // Ringkasan cepat unit siap pakai vs sedang terpinjam
  const summaryStats = useMemo(() => {
    let totalStok = 0;
    let totalDipinjam = 0;
    barangList.forEach((b) => {
      totalStok += b.stok || 0;
      const dipinjam = b.terpakai !== undefined ? b.terpakai : borrowedCountMap[b.kode] || 0;
      totalDipinjam += dipinjam;
    });
    return {
      siapPakai: Math.max(0, totalStok - totalDipinjam),
      terpinjam: totalDipinjam
    };
  }, [barangList, borrowedCountMap]);

  // Filter barang
  const filteredBarang = useMemo(() => {
    return barangList.filter((b) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchKode = b.kode?.toLowerCase().includes(q);
        const matchNama = b.nama?.toLowerCase().includes(q);
        const matchKat = b.kategori?.toLowerCase().includes(q);
        if (!matchKode && !matchNama && !matchKat) return false;
      }

      if (kategoriFilter !== 'ALL') {
        const jenisMatch =
          (kategoriFilter === 'Elektronik' && b.jenis === 'ELEKTRONIK') ||
          (kategoriFilter === 'Alat Laboratorium' && b.jenis === 'ALAT_LAB') ||
          (kategoriFilter === 'Furnitur' && b.jenis === 'FURNITUR');
        const katMatch = b.kategori?.toLowerCase().includes(kategoriFilter.toLowerCase());
        if (!jenisMatch && !katMatch) return false;
      }

      return true;
    });
  }, [barangList, searchQuery, kategoriFilter]);

  // Filter ruangan
  const filteredRuangan = useMemo(() => {
    return ruanganList.filter((r) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.kode?.toLowerCase().includes(q) ||
        r.nama?.toLowerCase().includes(q) ||
        r.fasilitas?.toLowerCase().includes(q)
      );
    });
  }, [ruanganList, searchQuery]);

  // Pagination barang
  const totalPages = Math.max(1, Math.ceil(filteredBarang.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedBarang = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredBarang.slice(start, start + pageSize);
  }, [filteredBarang, safePage]);

  const handleOpenAddModal = () => {
    if (subTab === 'BARANG') {
      setBarangModal({
        mode: 'ADD',
        data: {
          kode: '',
          nama: '',
          kategori: 'ELK',
          jenis: 'ELEKTRONIK',
          stok: 5,
          hargaSatuan: 1500000,
          perluPersetujuan: false
        }
      });
    } else {
      setRuanganForm({
        kode: '',
        nama: '',
        kapasitas: 30,
        fasilitas: 'Proyektor, AC, Papan Tulis'
      });
      setRuanganModal(true);
    }
  };

  const handleOpenEditBarang = (b) => {
    setBarangModal({
      mode: 'EDIT',
      data: {
        kode: b.kode,
        nama: b.nama,
        kategori: b.kodeKategori || b.kategori || 'ELK',
        jenis: b.jenis || 'ELEKTRONIK',
        stok: b.stok,
        hargaSatuan: b.hargaSatuan,
        perluPersetujuan: Boolean(b.perluPersetujuan)
      }
    });
  };

  const handleBarangSubmit = async (e) => {
    e.preventDefault();
    if (!barangModal) return;
    const d = barangModal.data;
    if (!d.kode.trim() || !d.nama.trim()) {
      showToast('Kode dan nama barang wajib diisi', 'error');
      return;
    }
    if (Number(d.stok) < 0 || Number(d.hargaSatuan) < 0) {
      showToast('Stok dan harga satuan tidak boleh bernilai negatif', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        kode: d.kode.trim().toUpperCase(),
        nama: d.nama.trim(),
        kategori: d.kategori,
        jenis: d.jenis,
        stok: Number(d.stok),
        hargaSatuan: Number(d.hargaSatuan),
        perluPersetujuan: Boolean(d.perluPersetujuan)
      };

      if (barangModal.mode === 'ADD') {
        await onAddBarang(payload);
      } else {
        await onEditBarang(payload);
      }
      setBarangModal(null);
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan data barang', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRuanganSubmit = async (e) => {
    e.preventDefault();
    if (!ruanganForm.kode.trim() || !ruanganForm.nama.trim()) {
      showToast('Kode dan nama ruangan wajib diisi', 'error');
      return;
    }
    if (Number(ruanganForm.kapasitas) <= 0) {
      showToast('Kapasitas ruangan harus lebih dari 0', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await onAddRuangan({
        kode: ruanganForm.kode.trim().toUpperCase(),
        nama: ruanganForm.nama.trim(),
        kapasitas: Number(ruanganForm.kapasitas),
        fasilitas: ruanganForm.fasilitas.trim() || '-'
      });
      setRuanganModal(false);
    } catch (err) {
      showToast(err.message || 'Gagal menambah ruangan', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivateBarang = async () => {
    if (!deactivateTarget) return;
    setSubmitting(true);
    try {
      await onEditBarang({
        kode: deactivateTarget.kode,
        nama: deactivateTarget.nama,
        stok: 0,
        hargaSatuan: deactivateTarget.hargaSatuan,
        perluPersetujuan: deactivateTarget.perluPersetujuan
      });
      setDeactivateTarget(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCsv = () => {
    let csvContent = '';
    const filename =
      subTab === 'BARANG' ? 'master_inventaris_sipinjam.csv' : 'master_ruangan_sipinjam.csv';

    if (subTab === 'BARANG') {
      csvContent += 'Kode,Nama Barang,Kategori,Jenis OOP,Stok Total,Harga Satuan,Tarif Denda Harian,Perlu Pembina\n';
      filteredBarang.forEach((b) => {
        csvContent += `"${b.kode}","${b.nama}","${b.kategori}","${b.jenis}",${b.stok},${b.hargaSatuan},${b.tarifHarian},${b.perluPersetujuan ? 'Ya' : 'Tidak'}\n`;
      });
    } else {
      csvContent += 'Kode,Nama Ruangan,Kapasitas,Fasilitas\n';
      filteredRuangan.forEach((r) => {
        csvContent += `"${r.kode}","${r.nama}",${r.kapasitas},"${r.fasilitas || '-'}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Data berhasil diekspor ke ${filename}`);
  };

  const activeOopRule = barangModal ? OOP_RULES[barangModal.data.jenis] || OOP_RULES.ELEKTRONIK : null;

  return (
    <div className="w-full">
      {/* ========================================================= */}
      {/* 1. HEADER HALAMAN                                         */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Master Data Fasilitas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola katalog inventaris aset fisik, spesifikasi alat, tarif denda, dan kapasitas ruangan kampus.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition cursor-pointer self-start md:self-auto"
        >
          <Plus size={18} />
          Tambah Data
        </button>
      </div>

      {/* ========================================================= */}
      {/* 2. TAB NAVIGASI FASILITAS & RINGKASAN CEPAT               */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
        <div className="inline-flex items-center bg-white border border-slate-200/90 p-1 rounded-xl shadow-2xs self-start">
          <button
            type="button"
            onClick={() => {
              setSubTab('BARANG');
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              subTab === 'BARANG'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Package size={15} />
            Inventaris Barang ({barangList.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setSubTab('RUANGAN');
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              subTab === 'RUANGAN'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Building2 size={15} />
            Ruangan Kampus ({ruanganList.length})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
          <span className="inline-flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <strong className="text-slate-900">{summaryStats.siapPakai} Unit</strong> Siap Pakai
          </span>
          <span className="text-slate-300">&bull;</span>
          <span className="inline-flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <strong className="text-slate-900">{summaryStats.terpinjam} Unit</strong> Sedang Terpinjam
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. BILAH FILTER & PENCARIAN                               */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={
                subTab === 'BARANG'
                  ? 'Cari kode, nama barang, kategori...'
                  : 'Cari kode, nama ruangan, fasilitas...'
              }
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/15 transition"
            />
          </div>

          {/* Kategori Pill Filter (khusus Tab Barang) */}
          {subTab === 'BARANG' && (
            <div className="flex flex-wrap items-center gap-1.5">
              {['ALL', 'Elektronik', 'Alat Laboratorium', 'Furnitur'].map((kat) => {
                const active = kategoriFilter === kat;
                return (
                  <button
                    key={kat}
                    type="button"
                    onClick={() => {
                      setKategoriFilter(kat);
                      setCurrentPage(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                      active
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    {kat === 'ALL' ? 'Semua' : kat}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Tombol Export Excel */}
        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer self-start xl:self-auto"
        >
          <Download size={15} />
          Export Excel
        </button>
      </div>

      {/* ========================================================= */}
      {/* 4. TABEL MASTER DATA FASILITAS                            */}
      {/* ========================================================= */}
      {subTab === 'BARANG' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70">
                  <th className="py-3.5 px-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Kode
                  </th>
                  <th className="py-3.5 px-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Nama Barang
                  </th>
                  <th className="py-3.5 px-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="py-3.5 px-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Stok Total
                  </th>
                  <th className="py-3.5 px-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Harga Satuan / Denda
                  </th>
                  <th className="py-3.5 px-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedBarang.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 px-6 text-center">
                      <p className="text-sm font-bold text-slate-700">
                        Tidak ada barang yang cocok
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Ubah kata kunci pencarian atau pilih kategori lain.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedBarang.map((b) => {
                    const dipinjam = b.terpakai !== undefined ? b.terpakai : borrowedCountMap[b.kode] || 0;
                    const tersedia = Math.max(0, (b.stok || 0) - dipinjam);

                    return (
                      <tr key={b.kode} className="hover:bg-slate-50/70 transition">
                        {/* KODE */}
                        <td className="py-4 px-5 align-middle whitespace-nowrap">
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/70 font-mono text-xs font-bold">
                            {b.kode}
                          </span>
                        </td>

                        {/* NAMA BARANG */}
                        <td className="py-4 px-5 align-middle">
                          <p className="text-sm font-bold text-slate-900">{b.nama}</p>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            Subtipe OOP: {OOP_RULES[b.jenis]?.label || b.jenis}
                          </p>
                        </td>

                        {/* KATEGORI */}
                        <td className="py-4 px-5 align-middle">
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-xs font-semibold text-slate-700">
                              {b.kategori || b.jenis}
                            </span>
                            {b.perluPersetujuan && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                                Perlu Pembina
                              </span>
                            )}
                          </div>
                        </td>

                        {/* STOK TOTAL */}
                        <td className="py-4 px-5 align-middle whitespace-nowrap">
                          <p className="text-sm font-extrabold text-slate-900">
                            {b.stok} Unit
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            <span className="text-emerald-700 font-semibold">{tersedia} Tersedia</span>
                            {' • '}
                            <span>{dipinjam} Dipinjam</span>
                          </p>
                        </td>

                        {/* HARGA SATUAN / DENDA */}
                        <td className="py-4 px-5 align-middle whitespace-nowrap">
                          <p className="text-xs font-bold text-slate-900">
                            {formatRupiah(b.hargaSatuan)}
                          </p>
                          <p className="text-[11px] font-bold text-rose-600 mt-0.5">
                            Denda {formatRupiah(b.tarifHarian)}/hari
                          </p>
                        </td>

                        {/* AKSI */}
                        <td className="py-4 px-5 align-middle text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditBarang(b)}
                              title="Edit Barang"
                              className="p-2 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeactivateTarget(b)}
                              title="Nonaktifkan / Nolkan Stok"
                              className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            >
                              <Trash2 size={15} />
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

          {/* Pagination Bawah */}
          <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs font-medium text-slate-500">
              Menampilkan{' '}
              <strong className="text-slate-800">{paginatedBarang.length}</strong> dari{' '}
              <strong className="text-slate-800">{filteredBarang.length}</strong> barang
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronLeft size={14} />
                Sebelumnya
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer ${
                    pageNum === safePage
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Selanjutnya
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* TABEL RUANGAN KAMPUS */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70">
                  <th className="py-3.5 px-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Kode
                  </th>
                  <th className="py-3.5 px-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Nama Ruangan
                  </th>
                  <th className="py-3.5 px-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Kapasitas
                  </th>
                  <th className="py-3.5 px-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Fasilitas Tersedia
                  </th>
                  <th className="py-3.5 px-5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider text-right">
                    Operasional
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRuangan.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 px-6 text-center">
                      <p className="text-sm font-bold text-slate-700">
                        Tidak ada ruangan ditemukan
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredRuangan.map((r) => (
                    <tr key={r.kode} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-5 align-middle whitespace-nowrap">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/70 font-mono text-xs font-bold">
                          {r.kode}
                        </span>
                      </td>
                      <td className="py-4 px-5 align-middle">
                        <p className="text-sm font-bold text-slate-900">{r.nama}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">14 Slot (07:00 – 21:00 WIB)</p>
                      </td>
                      <td className="py-4 px-5 align-middle whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <Users size={14} className="text-emerald-700" />
                          {r.kapasitas} Orang
                        </span>
                      </td>
                      <td className="py-4 px-5 align-middle">
                        <span className="text-xs text-slate-600 font-medium">
                          {r.fasilitas || '-'}
                        </span>
                      </td>
                      <td className="py-4 px-5 align-middle text-right whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                          Aktif • Per Slot
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. TIGA KARTU WAWASAN OPERASIONAL DI BAGIAN BAWAH         */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Validasi Pembina</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Barang berisiko tinggi dan aset laboratorium bernilai besar wajib melewati persetujuan Dosen Pembina sebelum diverifikasi loket.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <CreditCard size={20} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Tarif &amp; Kompensasi</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Denda keterlambatan dihitung otomatis setiap kelipatan 1x24 jam sesuai subtipe OOP aset, ditambah biaya kerusakan fisik jika ada.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <QrCode size={20} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Sinkronisasi Kode Aset</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Setiap kode barang terhubung langsung dengan label fisik gudang dan daftar periksa inspeksi pengembalian sarpras.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL TAMBAH / EDIT BARANG (SUBTIPE OOP)                  */}
      {/* ========================================================= */}
      {barangModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">
                {barangModal.mode === 'ADD'
                  ? 'Tambah Barang Inventaris Baru'
                  : `Edit Barang (${barangModal.data.kode})`}
              </h3>
              <button
                type="button"
                onClick={() => setBarangModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBarangSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kode Barang</label>
                  <input
                    type="text"
                    required
                    disabled={barangModal.mode === 'EDIT'}
                    value={barangModal.data.kode}
                    onChange={(e) =>
                      setBarangModal({
                        ...barangModal,
                        data: { ...barangModal.data, kode: e.target.value }
                      })
                    }
                    placeholder="Contoh: PROY-02"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-600 disabled:bg-slate-100 disabled:text-slate-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subtipe OOP</label>
                  <select
                    disabled={barangModal.mode === 'EDIT'}
                    value={barangModal.data.jenis}
                    onChange={(e) => {
                      const jenis = e.target.value;
                      setBarangModal({
                        ...barangModal,
                        data: {
                          ...barangModal.data,
                          jenis,
                          kategori: OOP_RULES[jenis]?.kategoriKode || 'ELK'
                        }
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white outline-none focus:border-emerald-600 disabled:bg-slate-100"
                  >
                    <option value="ELEKTRONIK">BarangElektronik</option>
                    <option value="ALAT_LAB">AlatLaboratorium</option>
                    <option value="FURNITUR">BarangFurnitur</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Barang</label>
                <input
                  type="text"
                  required
                  value={barangModal.data.nama}
                  onChange={(e) =>
                    setBarangModal({
                      ...barangModal,
                      data: { ...barangModal.data, nama: e.target.value }
                    })
                  }
                  placeholder="Contoh: Proyektor Epson EB-X400"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                />
              </div>

              {/* Preview Aturan Tarif OOP */}
              {activeOopRule && (
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 space-y-1">
                  <p className="font-extrabold text-[11px] uppercase tracking-wide">
                    Aturan Tarif {activeOopRule.label}
                  </p>
                  <p className="text-[11px]">
                    Denda Telat: <strong>{activeOopRule.tarifHarian}</strong> &bull; Rusak Ringan:{' '}
                    <strong>{activeOopRule.rusakRingan}</strong> &bull; Rusak Berat:{' '}
                    <strong>{activeOopRule.rusakBerat}</strong>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stok Fisik</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={barangModal.data.stok}
                    onChange={(e) =>
                      setBarangModal({
                        ...barangModal,
                        data: { ...barangModal.data, stok: Number(e.target.value) }
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={barangModal.data.hargaSatuan}
                    onChange={(e) =>
                      setBarangModal({
                        ...barangModal,
                        data: { ...barangModal.data, hargaSatuan: Number(e.target.value) }
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={barangModal.data.perluPersetujuan}
                  onChange={(e) =>
                    setBarangModal({
                      ...barangModal,
                      data: { ...barangModal.data, perluPersetujuan: e.target.checked }
                    })
                  }
                  className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                />
                <span className="font-bold text-slate-700">
                  Wajib Persetujuan Dosen Pembina (Barang Khusus / Bernilai Tinggi)
                </span>
              </label>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBarangModal(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold transition disabled:opacity-50"
                >
                  {submitting
                    ? 'Menyimpan...'
                    : barangModal.mode === 'ADD'
                      ? 'Simpan Barang'
                      : 'Perbarui Barang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL TAMBAH RUANGAN                                      */}
      {/* ========================================================= */}
      {ruanganModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Tambah Ruangan Kampus</h3>
              <button
                type="button"
                onClick={() => setRuanganModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRuanganSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Ruangan</label>
                <input
                  type="text"
                  required
                  value={ruanganForm.kode}
                  onChange={(e) => setRuanganForm({ ...ruanganForm, kode: e.target.value })}
                  placeholder="Contoh: R-204"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Ruangan</label>
                <input
                  type="text"
                  required
                  value={ruanganForm.nama}
                  onChange={(e) => setRuanganForm({ ...ruanganForm, nama: e.target.value })}
                  placeholder="Contoh: Lab Multimedia Lantai 2"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kapasitas Maksimum (Orang)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={ruanganForm.kapasitas}
                  onChange={(e) =>
                    setRuanganForm({ ...ruanganForm, kapasitas: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fasilitas Tersedia</label>
                <textarea
                  rows={2}
                  value={ruanganForm.fasilitas}
                  onChange={(e) => setRuanganForm({ ...ruanganForm, fasilitas: e.target.value })}
                  placeholder="Proyektor, AC, Sound System, Papan Tulis"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-600 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRuanganModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold transition disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Ruangan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL KONFIRMASI NONAKTIFKAN STOK BARANG                  */}
      {/* ========================================================= */}
      {deactivateTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Nolkan Stok Barang ({deactivateTarget.kode})?
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Untuk menjaga integritas riwayat transaksi, data master tidak dihapus permanen. Anda dapat menonaktifkan peminjaman <strong>{deactivateTarget.nama}</strong> dengan mengubah stok menjadi <strong>0</strong>.
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeactivateTarget(null)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeactivateBarang}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition"
              >
                {submitting ? 'Memproses...' : 'Nolkan Stok'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
