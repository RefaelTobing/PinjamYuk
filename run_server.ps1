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

# 1b. Cek apakah port sudah dipakai proses lain
#     Ini penyebab paling sering dari "Port XXXX SUDAH DIGUNAKAN" (BindException):
#     server lama masih hidup di background (java.exe tidak mati saat jendela ditutup).
if (Get-Command Get-NetTCPConnection -ErrorAction SilentlyContinue) {
    $pemakai = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
        Select-Object -First 1
    if ($pemakai) {
        $namaProses = "tidak diketahui"
        try { $namaProses = (Get-Process -Id $pemakai.OwningProcess -ErrorAction Stop).ProcessName } catch { }
        Write-Host "============================================================" -ForegroundColor Red
        Write-Host "[ERROR] Port $Port sudah dipakai proses lain!" -ForegroundColor Red
        Write-Host "        PID $($pemakai.OwningProcess) ($namaProses)" -ForegroundColor Yellow
        Write-Host "Solusi:" -ForegroundColor Yellow
        Write-Host "  1. Hentikan proses itu  : Stop-Process -Id $($pemakai.OwningProcess) -Force" -ForegroundColor Yellow
        Write-Host "  2. Atau pakai port lain : ./run_server.ps1 -Port 8081" -ForegroundColor Yellow
        Write-Host "     (kalau ganti port, frontend harus ikut: VITE_API_BASE_URL=http://localhost:8081/api)" -ForegroundColor Yellow
        Write-Host "============================================================" -ForegroundColor Red
        Read-Host "Tekan Enter untuk keluar..."
        exit 1
    }
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Menyusun (compile) backend Java SIPINJAM..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$outDir = Join-Path $PSScriptRoot "out"
if (-not (Test-Path -LiteralPath $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

# ------------------------------------------------------------------
# PENTING - ini penyebab error:
#   error: file not found: D:Kuliah Semester 3PBOFINAL PROJECTPinjamYuksrc...
#
# javac membaca isi @argfile dengan '\' sebagai KARAKTER ESCAPE. Jadi path
# Windows   D:\Kuliah Semester 3\PBO\...\AplikasiServer.java
# dibaca javac sebagai
#           D:Kuliah Semester 3PBO...AplikasiServer.java   <- semua '\' hilang
#
# Solusinya: tulis path di argfile memakai '/' (javac di Windows menerima
# '/' sebagai pemisah folder). Tanda kutip tetap wajib karena path proyek
# ini mengandung spasi ("Semester 3", "Prak PBO", "Final Project").
# ------------------------------------------------------------------
$srcDir = Join-Path $PSScriptRoot "src"
$javaFiles = @(Get-ChildItem -LiteralPath $srcDir -Recurse -Filter "*.java" -File |
    Sort-Object FullName)

if ($javaFiles.Count -eq 0) {
    Write-Host "[ERROR] Tidak ada berkas .java di folder src!" -ForegroundColor Red
    exit 1
}

$sourceLines = $javaFiles | ForEach-Object { '"' + ($_.FullName -replace '\\', '/') + '"' }

# Argfile diletakkan di folder temp supaya path argfile-nya sendiri bebas spasi
$sourcesFile = Join-Path ([System.IO.Path]::GetTempPath()) ("sipinjam-sources-{0}.txt" -f $PID)
$sourceLines | Out-File -FilePath $sourcesFile -Encoding ascii

Write-Host ("  {0} berkas .java -> {1}" -f $javaFiles.Count, $outDir) -ForegroundColor Cyan

# Setiap argumen dikirim sebagai elemen terpisah (array), bukan satu string
# command, supaya spasi di dalam path tidak dipecah.
& javac "-encoding" "UTF-8" "-d" $outDir "@$sourcesFile"
$compileExit = $LASTEXITCODE

if (Test-Path -LiteralPath $sourcesFile) {
    Remove-Item -LiteralPath $sourcesFile -Force
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

& java "-Dfile.encoding=UTF-8" "-cp" $outDir "sipinjam.AplikasiServer" "--port" $Port "--data" $DataDir
