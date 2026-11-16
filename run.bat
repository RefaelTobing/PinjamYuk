@echo off
setlocal

REM Pindah ke direktori skrip ini berada
cd /d "%~dp0"

REM ============================================================
REM  SIPINJAM (PinjamYuk) - Run Desktop GUI (Windows)
REM ============================================================

if exist sipinjam.jar (
    java -Dfile.encoding=UTF-8 -jar sipinjam.jar
) else (
    if not exist out (
        echo Folder out tidak ditemukan. Menjalankan build.bat...
        call build.bat
    )
    java -Dfile.encoding=UTF-8 -cp out sipinjam.AplikasiSipinjam
)
