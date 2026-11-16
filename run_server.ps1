param (
    [int]$Port = 8080,
    [string]$DataDir = "data"
)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Menyusun (compile) backend Java SIPINJAM..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

if (-not (Test-Path "out")) {
    New-Item -ItemType Directory -Path "out" | Out-Null
}

$javaFiles = Get-ChildItem -Path "src" -Recurse -Filter "*.java" | ForEach-Object { $_.FullName }
if ($javaFiles.Count -eq 0) {
    Write-Host "[ERROR] Tidak ada berkas .java di folder src!" -ForegroundColor Red
    exit 1
}

$sourcesFile = "sources.txt"
$javaFiles | Out-File -FilePath $sourcesFile -Encoding ascii

javac -encoding UTF-8 -d out ("@" + $sourcesFile)
$compileExit = $LASTEXITCODE

if (Test-Path $sourcesFile) {
    Remove-Item -Path $sourcesFile
}

if ($compileExit -ne 0) {
    Write-Host "[ERROR] Kompilasi gagal! Periksa error di atas." -ForegroundColor Red
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
