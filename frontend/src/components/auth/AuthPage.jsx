import React, { useState } from 'react';
import { Box, Eye, EyeOff, ArrowRight, Lock } from 'lucide-react';
import { api } from '../../services/api';

export default function AuthPage({ onLoginSuccess, showToast }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [loginUsername, setLoginUsername] = useState('mahasiswa');
  const [loginPassword, setLoginPassword] = useState('mahasiswa123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // Register Form State
  const [regData, setRegData] = useState({
    nim: '',
    nama: '',
    programStudi: 'D3 Teknik Informatika',
    noTelepon: '',
    username: '',
    password: ''
  });
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Handle Login Execution
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!loginUsername.trim() || !loginPassword.trim()) {
      showToast('Username dan kata sandi wajib diisi', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login(loginUsername.trim(), loginPassword);
      if (res.sukses && res.data) {
        showToast(`Selamat datang kembali, ${res.data.nama}!`);
        onLoginSuccess(res.data);
      } else {
        showToast(res.pesan || 'Login gagal, periksa kredensial Anda', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Gagal terhubung ke server', 'error');
    } finally {
      setLoading(false);
    }
  };

  // One-Click Demo Login
  const executeDemoLogin = async (username, password) => {
    setLoginUsername(username);
    setLoginPassword(password);
    setLoading(true);
    try {
      const res = await api.login(username, password);
      if (res.sukses && res.data) {
        showToast(`Masuk sebagai ${res.data.peran}: ${res.data.nama}`);
        onLoginSuccess(res.data);
      } else {
        showToast(res.pesan || 'Gagal masuk dengan akun demo', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Koneksi ke backend gagal', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Register Execution
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regData.nim.trim() || !regData.nama.trim() || !regData.username.trim() || !regData.password.trim()) {
      showToast('NIM, nama, username, dan kata sandi wajib diisi', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register(regData);
      if (res.sukses) {
        showToast('Registrasi mahasiswa berhasil! Silakan masuk dengan akun baru Anda.');
        setLoginUsername(regData.username);
        setLoginPassword(regData.password);
        setAuthMode('login');
      } else {
        showToast(res.pesan || 'Registrasi gagal', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Gagal mendaftarkan akun mahasiswa', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] bg-dot-grid flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900 relative">
      {/* ======================================================== */}
      {/* 1. TOP BAR HEADER                                       */}
      {/* ======================================================== */}
      <header className="w-full px-6 sm:px-10 py-5 flex items-center justify-between z-10">
        {/* Kiri: Brand Logo, Title & Version Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Box size={20} strokeWidth={2.2} />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900">
            SIPINJAM
          </span>
          <span className="px-2.5 py-0.5 text-[11px] font-bold text-blue-600 bg-blue-50/90 rounded-full border border-blue-100">
            V2.4
          </span>
        </div>

        {/* Kanan: SSO System Health Indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-slate-500 hidden sm:inline">
            Sistem Aktif & Terintegrasi SSO
          </span>
          <span className="text-xs font-medium text-slate-500 sm:hidden">
            SSO Aktif
          </span>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. FLOATING CENTER LOGIN CARD                            */}
      {/* ======================================================== */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-10 z-10">
        <div className="w-full max-w-[440px] bg-white rounded-3xl p-7 sm:p-9 shadow-xl shadow-slate-100 border border-slate-200/80 transition-all">
          {/* Center Cube Icon */}
          <div className="w-14 h-14 bg-blue-50/80 rounded-2xl flex items-center justify-center mx-auto mb-3.5 border border-blue-100/60">
            <Box size={28} className="text-blue-600" strokeWidth={2} />
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl font-black text-slate-900 text-center tracking-tight">
            SIPINJAM
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 text-center mt-1 mb-6">
            Sistem Peminjaman Inventaris & Ruangan Kampus
          </p>

          {/* Segmented Pill Tab Switcher */}
          <div className="bg-slate-100 p-1.5 rounded-xl flex items-center mb-6">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`w-1/2 py-2 text-center text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`w-1/2 py-2 text-center text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Daftar Mahasiswa
            </button>
          </div>

          {/* Form Content */}
          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Field: Username */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="nadia.rahmawati@ui.ac.id"
                  className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                  required
                  disabled={loading}
                />
              </div>

              {/* Field: Kata Sandi */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs sm:text-sm font-medium text-slate-700">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => showToast('Gunakan opsi akun demo di bawah atau hubungi Unit Sarpras Kampus.', 'info')}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 transition cursor-pointer"
                  >
                    Lupa sandi?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition pr-11"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    title={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Checkbox: Ingat Sesi */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
                />
                <label htmlFor="rememberMe" className="text-xs text-slate-600 cursor-pointer select-none">
                  Ingat sesi di perangkat ini
                </label>
              </div>

              {/* Tombol Masuk */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-semibold py-3 sm:py-3.5 rounded-xl text-sm transition-all shadow-md shadow-blue-700/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
              >
                <span>{loading ? 'Memproses...' : 'Masuk'}</span>
                <ArrowRight size={16} />
              </button>

              {/* Pembatas AKUN DEMO */}
              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[10px] tracking-widest font-bold text-slate-400 uppercase">
                  AKUN DEMO
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* 3 Tombol Card Demo */}
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => executeDemoLogin('mahasiswa', 'mahasiswa123')}
                  className="bg-slate-50/80 hover:bg-blue-50/60 hover:border-blue-300 border border-slate-200/80 rounded-xl py-2.5 px-2 text-center transition cursor-pointer group disabled:opacity-50"
                >
                  <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition">
                    Mahasiswa
                  </div>
                  <div className="text-[11px] text-slate-400 group-hover:text-blue-600 transition">
                    Peminjam
                  </div>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => executeDemoLogin('petugas', 'petugas123')}
                  className="bg-slate-50/80 hover:bg-emerald-50/60 hover:border-emerald-300 border border-slate-200/80 rounded-xl py-2.5 px-2 text-center transition cursor-pointer group disabled:opacity-50"
                >
                  <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition">
                    Petugas
                  </div>
                  <div className="text-[11px] text-slate-400 group-hover:text-emerald-600 transition">
                    Sarpras
                  </div>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => executeDemoLogin('pembina', 'pembina123')}
                  className="bg-slate-50/80 hover:bg-amber-50/60 hover:border-amber-300 border border-slate-200/80 rounded-xl py-2.5 px-2 text-center transition cursor-pointer group disabled:opacity-50"
                >
                  <div className="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition">
                    Pembina
                  </div>
                  <div className="text-[11px] text-slate-400 group-hover:text-amber-600 transition">
                    Dosen
                  </div>
                </button>
              </div>
            </form>
          ) : (
            /* Mode Form Registrasi Mahasiswa */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  NIM (Nomor Induk Mahasiswa)
                </label>
                <input
                  type="text"
                  value={regData.nim}
                  onChange={(e) => setRegData({ ...regData, nim: e.target.value })}
                  placeholder="Contoh: 220411100055"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={regData.nama}
                  onChange={(e) => setRegData({ ...regData, nama: e.target.value })}
                  placeholder="Contoh: Nadia Rahmawati"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Program Studi
                  </label>
                  <select
                    value={regData.programStudi}
                    onChange={(e) => setRegData({ ...regData, programStudi: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                    disabled={loading}
                  >
                    <option value="D3 Teknik Informatika">D3 Teknik Informatika</option>
                    <option value="S1 Sistem Informasi">S1 Sistem Informasi</option>
                    <option value="S1 Teknik Komputer">S1 Teknik Komputer</option>
                    <option value="S1 Sains Data">S1 Sains Data</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    No. Telepon / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={regData.noTelepon}
                    onChange={(e) => setRegData({ ...regData, noTelepon: e.target.value })}
                    placeholder="081234567890"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Username Akun
                </label>
                <input
                  type="text"
                  value={regData.username}
                  onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                  placeholder="nadia_rahma"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition pr-10"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-md shadow-blue-700/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-3"
              >
                <span>{loading ? 'Mendaftarkan...' : 'Daftar Mahasiswa'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>

        {/* SSO Under-Card Security Badge */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-6">
          <Lock size={13} className="text-slate-400" />
          <span>Terkoneksi aman dengan Single Sign-On (SSO) Kampus Merdeka</span>
        </div>
      </main>

      {/* ======================================================== */}
      {/* 3. PAGE FOOTER                                          */}
      {/* ======================================================== */}
      <footer className="w-full py-5 text-center text-xs text-slate-400 z-10 flex items-center justify-center gap-3">
        <span>© 2025 SIPINJAM Kampus Merdeka</span>
        <span>•</span>
        <button
          type="button"
          onClick={() => showToast('Pusat Bantuan: Hubungi ext 1404 atau email sarpras@univ.ac.id', 'info')}
          className="hover:text-slate-600 transition cursor-pointer"
        >
          Bantuan
        </button>
        <span>•</span>
        <button
          type="button"
          onClick={() => showToast('SOP Sarpras: Seluruh aset kampus wajib dirawat dan dikembalikan tepat waktu.', 'info')}
          className="hover:text-slate-600 transition cursor-pointer"
        >
          SOP Sarpras
        </button>
      </footer>
    </div>
  );
}
