@echo off
setlocal enabledelayedexpansion

REM Pindah ke direktori skrip ini berada
cd /d "%~dp0"

REM ============================================================
REM  SIPINJAM (PinjamYuk) - Build Script (Windows)
REM  CATATAN PENTING (jangan diubah):
REM  1. Tiap path WAJIB diberi tanda kutip ("...") karena javac memecah
REM     isi @argfile berdasarkan SPASI.
REM  2. Tiap backslash WAJIB diubah jadi '/' karena di dalam @argfile
REM     javac memperlakukan '\' sebagai karakter ESCAPE. Kalau tidak,
REM     path "D:\Kuliah Semester 3\...\AplikasiServer.java" akan dibaca
REM     sebagai "D:Kuliah Semester 3...AplikasiServer.java" dan muncul
REM     error: file not found.
REM ============================================================

echo ============================================================
echo   Membersihkan folder out...
echo ============================================================
if exist out rmdir /s /q out
mkdir out

echo Mengompilasi seluruh sumber Java...
if exist sources.txt del /q sources.txt
for /r "%~dp0src" %%F in (*.java) do (
    set "JSRC=%%~fF"
    set "JSRC=!JSRC:\=/!"
    echo "!JSRC!">>sources.txt
)

if not exist sources.txt (
    echo [ERROR] Tidak ada berkas .java di folder src!
    pause
    exit /b 1
)

javac -encoding UTF-8 -d out @sources.txt
set COMPILE_STATUS=!ERRORLEVEL!
if exist sources.txt del /q sources.txt

if !COMPILE_STATUS! neq 0 (
    echo [ERROR] Kompilasi gagal! Periksa error di atas.
    pause
    exit /b !COMPILE_STATUS!
)

echo Membuat sipinjam.jar...
jar cfe sipinjam.jar sipinjam.AplikasiSipinjam -C out .

echo Membuat sipinjam-server.jar...
jar cfe sipinjam-server.jar sipinjam.AplikasiServer -C out .

echo ============================================================
echo   Kompilasi Sukses!
echo   - Backend REST API Server  : run_server.bat
echo   - Desktop GUI Lama (Swing) : run.bat
echo   - Frontend Web Reaktif     : cd frontend ^&^& npm run dev
echo ============================================================
pause
