@echo off
setlocal

REM ============================================================
REM  SIPINJAM (PinjamYuk) - Run Frontend Web (Windows)
REM ============================================================

cd /d "%~dp0frontend"

where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ============================================================
    echo [ERROR] 'npm' / Node.js tidak ditemukan di sistem Anda!
    echo Silakan unduh dan pasang Node.js terlebih dahulu di:
    echo https://nodejs.org/ (pilih versi LTS)
    echo ============================================================
    pause
    exit /b 1
)

if not exist node_modules (
    echo ============================================================
    echo   Folder node_modules belum ada.
    echo   Mengunduh dan memasang dependensi frontend (npm install)...
    echo ============================================================
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Gagal menjalankan npm install!
        pause
        exit /b %ERRORLEVEL%
    )
)

echo ============================================================
echo   Menjalankan Frontend Web SIPINJAM (Vite)...
echo   Buka di peramban: http://localhost:5173
echo   Tekan Ctrl+C untuk berhenti.
echo ============================================================

call npm run dev
if %ERRORLEVEL% neq 0 (
    pause
)
