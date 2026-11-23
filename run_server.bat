@echo off
setlocal enabledelayedexpansion

REM Pindah ke direktori skrip ini berada
cd /d "%~dp0"

REM ============================================================
REM  SIPINJAM (PinjamYuk) - Backend Server Runner (Windows)
REM ============================================================

set PORT=8080
set DATA_DIR=data

:parse_args
if "%~1"=="" goto after_args
if /I "%~1"=="--port" (
    set PORT=%~2
    shift
    shift
    goto parse_args
)
if /I "%~1"=="--data" (
    set DATA_DIR=%~2
    shift
    shift
    goto parse_args
)
shift
goto parse_args

:after_args
echo ============================================================
echo   Menyusun (compile) backend Java SIPINJAM...
echo ============================================================

REM 1. Cek apakah javac tersedia di PATH
where javac >nul 2>&1
if !ERRORLEVEL! neq 0 (
    echo ============================================================
    echo [ERROR] 'javac' (Java Development Kit / JDK) tidak ditemukan!
    echo Kemungkinan penyebab:
    echo 1. JDK belum terpasang di komputer Anda.
    echo 2. JDK sudah terpasang, tetapi folder 'bin' belum masuk ke PATH.
    echo.
    echo Solusi:
    echo - Unduh JDK di: https://adoptium.net/ atau https://www.oracle.com/java/
    echo - Pastikan mencentang "Set JAVA_HOME" dan "Add to PATH" saat instalasi.
    echo ============================================================
    pause
    exit /b 1
)

REM 2. Cek apakah port sudah dipakai proses lain (penyebab BindException)
set "PID_PORT="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /r /c:":%PORT% .*LISTENING"') do set "PID_PORT=%%P"
if defined PID_PORT (
    echo ============================================================
    echo [ERROR] Port %PORT% sudah dipakai proses lain ^(PID !PID_PORT!^)!
    echo Solusi:
    echo   1. Hentikan proses itu  : taskkill /PID !PID_PORT! /F
    echo   2. Atau pakai port lain : run_server.bat --port 8081
    echo      ^(kalau ganti port, frontend harus ikut: VITE_API_BASE_URL=http://localhost:8081/api^)
    echo ============================================================
    pause
    exit /b 1
)

if not exist out mkdir out

REM 3. Kumpulkan semua berkas .java ke argfile.
REM  CATATAN PENTING (jangan diubah):
REM  1. Tiap path WAJIB diberi tanda kutip ("...") karena javac memecah
REM     isi @argfile berdasarkan SPASI.
REM  2. Tiap backslash WAJIB diubah jadi '/' karena di dalam @argfile
REM     javac memperlakukan '\' sebagai karakter ESCAPE. Kalau tidak,
REM     path "D:\Kuliah Semester 3\...\AplikasiServer.java" akan dibaca
REM     sebagai "D:Kuliah Semester 3...AplikasiServer.java" dan muncul
REM     error: file not found.
if exist sources.txt del /q sources.txt
for /r "%~dp0src" %%F in (*.java) do (
    set "JSRC=%%~fF"
    set "JSRC=!JSRC:\=/!"
    echo "!JSRC!">>sources.txt
)

if not exist sources.txt (
    echo ============================================================
    echo [ERROR] Tidak ada berkas .java di folder src!
    echo ============================================================
    pause
    exit /b 1
)

javac -encoding UTF-8 -d out @sources.txt
set COMPILE_STATUS=!ERRORLEVEL!
if exist sources.txt del /q sources.txt

if !COMPILE_STATUS! neq 0 (
    echo ============================================================
    echo [ERROR] Kompilasi Java gagal! Periksa pesan error di atas.
    echo ============================================================
    pause
    exit /b !COMPILE_STATUS!
)

echo ============================================================
echo   SIPINJAM Backend REST API Server Berjalan!
echo   Port     : %PORT%
echo   Base URL : http://localhost:%PORT%/api
echo   Data Dir : %DATA_DIR%
echo   Tekan Ctrl+C untuk menghentikan server.
echo ============================================================

java -Dfile.encoding=UTF-8 -cp out sipinjam.AplikasiServer --port %PORT% --data %DATA_DIR%

echo.
echo [INFO] Server backend telah berhenti.
pause
