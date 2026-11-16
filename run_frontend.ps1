# ============================================================
#  SIPINJAM (PinjamYuk) - Run Frontend Web (PowerShell)
# ============================================================

Set-Location -Path "$PSScriptRoot\frontend"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host "[ERROR] 'npm' / Node.js tidak ditemukan di komputer Anda!" -ForegroundColor Red
    Write-Host "Silakan unduh dan pasang Node.js di: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "============================================================" -ForegroundColor Red
    Read-Host "Tekan Enter untuk keluar..."
    exit 1
}

if (-not (Test-Path "node_modules")) {
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "  Folder node_modules belum ada." -ForegroundColor Cyan
    Write-Host "  Mengunduh dan memasang dependensi frontend (npm install)..." -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Gagal menjalankan npm install!" -ForegroundColor Red
        Read-Host "Tekan Enter untuk keluar..."
        exit $LASTEXITCODE
    }
}

Write-Host "============================================================" -ForegroundColor Green
Write-Host "  Menjalankan Frontend Web SIPINJAM (Vite)..." -ForegroundColor Green
Write-Host "  Buka di peramban: http://localhost:5173" -ForegroundColor Green
Write-Host "  Tekan Ctrl+C untuk berhenti." -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Green

npm run dev
