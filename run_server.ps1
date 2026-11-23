param (
    [int]$Port = 8080,
    [string]$DataDir = "data"
)

# 0. Selalu jalankan dari folder skrip ini (PowerShell tidak otomatis cd)
Set-Location -Path $PSScriptRoot

# 1. Cek ketersediaan javac di PATH
if (-not (Get-Command javac -ErrorAction SilentlyContinue)) {
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host "[ERROR] 'javac' (Java Development Kit / JDK) tidak ditemukan!" -ForegroundColor Red
    Write-Host "Penyebab: JDK belum terpasang atau PATH belum disetel." -ForegroundColor Yellow
    Write-Host "Unduh JDK di: https://adoptium.net/ atau https://www.oracle.com/java/" -ForegroundColor Yellow
    Write-Host "============================================================" -ForegroundColor Red
    Read-Host "Tekan Enter untuk keluar..."
    exit 1
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Menyusun (compile) backend Java SIPINJAM..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

if (-not (Test-Path "out")) {
    New-Item -ItemType Directory -Path "out" | Out-Null
}

# PENTING: setiap path WAJIB dibungkus tanda kutip karena javac memecah
# isi @argfile berdasarkan SPASI. Path proyek ini mengandung spasi
# ("Semester 3", "Prak PBO", "Final Project"), jadi tanpa kutip akan
# muncul error "invalid flag".
$srcDir = Join-Path $PSScriptRoot "src"
$javaFiles = Get-ChildItem -Path $srcDir -Recurse -Filter "*.java" |
    ForEach-Object { '"' + $_.FullName + '"' }

if ($javaFiles.Count -eq 0) {
    Write-Host "[ERROR] Tidak ada berkas .java di folder src!" -ForegroundColor Red
    exit 1
}

$sourcesFile = Join-Path $PSScriptRoot "sources.txt"
$javaFiles | Out-File -FilePath $sourcesFile -Encoding ascii

javac -encoding UTF-8 -d out ("@" + $sourcesFile)
$compileExit = $LASTEXITCODE

if (Test-Path $sourcesFile) {
    Remove-Item -Path $sourcesFile
}

if ($compileExit -ne 0) {
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host "[ERROR] Kompilasi gagal! Periksa error di atas." -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Red
    exit $compileExit
}

Write-Host "============================================================" -ForegroundColor Green
Write-Host "  SIPINJAM Backend REST API Server Berjalan!" -ForegroundColor Green
Write-Host "  Port     : $Port" -ForegroundColor Green
Write-Host "  Base URL : http://localhost:$Port/api" -ForegroundColor Green
Write-Host "  Data Dir : $DataDir" -ForegroundColor Green
Write-Host "  Tekan Ctrl+C untuk menghentikan server." -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Green

java "-Dfile.encoding=UTF-8" -cp out sipinjam.AplikasiServer --port $Port --data $DataDir
