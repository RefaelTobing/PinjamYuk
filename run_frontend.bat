@echo off
setlocal

REM ============================================================
REM  SIPINJAM (PinjamYuk) - Run Frontend Web (Windows)
REM ============================================================

cd frontend

if not exist node_modules (
    echo ============================================================
    echo   Folder node_modules belum ada.
    echo   Mengunduh dan memasang dependensi frontend (npm install)...
    echo ============================================================
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Gagal menjalankan npm install! Pastikan Node.js terpasang.
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
