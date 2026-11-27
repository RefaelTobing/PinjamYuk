import React, { useState } from 'react';
import { Box, ShoppingCart, LogOut, ChevronDown } from 'lucide-react';

export default function Navbar({
  user,
  activeTab,
  setActiveTab,
  cartCount = 0,
  onCartClick,
  onLogout
}) {
  const [profileOpen, setProfileOpen] = useState(false);

  // Fallback defaults if user is not yet set
  const peran = user?.peran || 'MAHASISWA';
  const nama = user?.nama || 'Pengguna';
  const inisial = (nama.charAt(0) || 'U').toUpperCase();

  // Role Theme Configuration
  const roleConfig = {
    MAHASISWA: {
      badgeText: 'Kampus',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-100',
      activeTabClass: 'bg-blue-50 text-blue-700 font-semibold',
      tabs: [
        { id: 'katalog', label: 'Katalog Barang' },
        { id: 'booking', label: 'Booking Ruangan' },
        { id: 'riwayat', label: 'Riwayat' }
      ]
    },
    PETUGAS: {
      badgeText: 'Petugas',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      activeTabClass: 'bg-emerald-100 text-emerald-900 font-semibold',
      logoBgClass: 'bg-emerald-700 shadow-emerald-500/20',
      tabs: [
        { id: 'verifikasi', label: 'Verifikasi & Sirkulasi' },
        { id: 'master', label: 'Master Data' },
        { id: 'laporan', label: 'Laporan & Monitoring' }
      ]
    },
    PEMBINA: {
      badgeText: 'Dosen Pembina',
      badgeClass: 'bg-amber-50 text-amber-900 border-amber-200',
      activeTabClass: 'bg-amber-100 text-amber-900 font-semibold',
      logoBgClass: 'bg-amber-700 shadow-amber-500/20',
      tabs: [
        { id: 'verifikasi', label: 'Antrean Persetujuan' },
        { id: 'riwayat', label: 'Riwayat' }
      ]
    }
  };

  const currentTheme = roleConfig[peran] || roleConfig.MAHASISWA;

  const roleLabel = 
    peran === 'MAHASISWA' ? 'Mahasiswa' : 
    peran === 'PETUGAS' ? 'Sarpras' : 'Dosen Pembina';

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* ========================================================= */}
        {/* KIRI: Logo 3D Box + SIPINJAM + Role Badge                 */}
        {/* ========================================================= */}
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs ${currentTheme.logoBgClass || 'bg-blue-600 shadow-blue-500/20'}`}>
            <Box size={19} strokeWidth={2.2} />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900">
            SIPINJAM
          </span>
          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${currentTheme.badgeClass}`}>
            {currentTheme.badgeText}
          </span>
        </div>

        {/* ========================================================= */}
        {/* TENGAH: Segmented Pill Navigation Tabs                    */}
        {/* ========================================================= */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-200/60">
          {currentTheme.tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 text-xs sm:text-sm rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? `${currentTheme.activeTabClass} shadow-xs`
                    : 'text-slate-500 hover:text-slate-800 font-medium hover:bg-slate-100/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* ========================================================= */}
        {/* KANAN: Keranjang (Khusus Mahasiswa) + Profil Kapsul       */}
        {/* ========================================================= */}
        <div className="flex items-center gap-3">
          {/* Tombol Keranjang Belanja */}
          {peran === 'MAHASISWA' && (
            <button
              type="button"
              onClick={onCartClick}
              className="relative p-2 text-slate-700 hover:text-blue-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Keranjang Pengajuan"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#1d4ed8] text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Kapsul Profil Pengguna */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                {inisial}
              </div>
              <span className="text-xs font-medium text-slate-700">
                {nama.split(' ')[0]} • {roleLabel}
              </span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {/* Dropdown Menu Logout */}
            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{nama}</p>
                    <p className="text-[11px] text-slate-500 truncate">@{user?.username || 'user'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Keluar dari Akun</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Tabs Bar */}
      <div className="md:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-slate-100 gap-1 bg-slate-50/50">
        {currentTheme.tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? `${currentTheme.activeTabClass} shadow-xs`
                  : 'text-slate-500 font-medium'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
