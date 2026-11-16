@echo off
setlocal enabledelayedexpansion

REM Pindah ke direktori skrip ini berada
cd /d "%~dp0"

REM ============================================================
REM  SIPINJAM (PinjamYuk) - Build Script (Windows)
REM ============================================================

echo ============================================================
echo   Membersihkan folder out...
echo ============================================================
if exist out rmdir /s /q out
mkdir out

echo Mengompilasi seluruh sumber Java...
dir /s /b src\*.java > sources.txt
javac -encoding UTF-8 -d out @sources.txt
set COMPILE_STATUS=%ERRORLEVEL%
if exist sources.txt del sources.txt

if %COMPILE_STATUS% neq 0 (
    echo [ERROR] Kompilasi gagal! Periksa error di atas.
    pause
    exit /b %COMPILE_STATUS%
)

echo Membuat sipinjam.jar...
jar cfe sipinjam.jar sipinjam.AplikasiSipinjam -C out .

echo ============================================================
echo   Kompilasi Sukses!
echo   - Backend REST API Server  : run_server.bat
echo   - Desktop GUI Lama (Swing) : run.bat
echo   - Frontend Web Reaktif     : cd frontend ^&^& npm run dev
echo ============================================================
pause
