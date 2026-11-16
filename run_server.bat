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
if "%~1"=="--port" (
    set PORT=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="--data" (
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

if not exist out mkdir out

REM Kumpulkan semua berkas .java ke file sementara
dir /s /b src\*.java > sources.txt
javac -encoding UTF-8 -d out @sources.txt
set COMPILE_STATUS=%ERRORLEVEL%
if exist sources.txt del sources.txt

if %COMPILE_STATUS% neq 0 (
    echo [ERROR] Kompilasi Java gagal! Pastikan JDK sudah terpasang dan ada di PATH.
    pause
    exit /b %COMPILE_STATUS%
)

echo ============================================================
echo   SIPINJAM Backend REST API Server Berjalan!
echo   Port     : %PORT%
echo   Base URL : http://localhost:%PORT%/api
echo   Data Dir : %DATA_DIR%
echo   Tekan Ctrl+C untuk menghentikan server.
echo ============================================================

java -Dfile.encoding=UTF-8 -cp out sipinjam.AplikasiServer --port %PORT% --data %DATA_DIR%

if %ERRORLEVEL% neq 0 (
    pause
)
