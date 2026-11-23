# ============================================================
#  SIPINJAM (PinjamYuk) - Run Frontend Web (PowerShell)
# ============================================================
#  Pakai: ./run_frontend.ps1            -> backend dianggap di port 8080
#         ./run_frontend.ps1 -ApiPort 8081 -> backend di port 8081
# ============================================================
param (
    [int]$ApiPort = 8080
)

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

# Alamat backend disuntikkan lewat environment variable yang dibaca
# frontend/src/services/api.js (import.meta.env.VITE_API_BASE_URL).
# Jadi port backend dan port yang dipanggil frontend tidak mungkin beda.
$env:VITE_API_BASE_URL = "http://localhost:$ApiPort/api"

Write-Host "============================================================" -ForegroundColor Green
Write-Host "  Menjalankan Frontend Web SIPINJAM (Vite)..." -ForegroundColor Green
Write-Host "  Buka di peramban : http://localhost:5173" -ForegroundColor Green
Write-Host "  Backend dipanggil: $env:VITE_API_BASE_URL" -ForegroundColor Green
Write-Host "  Tekan Ctrl+C untuk berhenti." -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Green

npm run dev