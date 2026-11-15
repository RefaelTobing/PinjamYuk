#!/usr/bin/env bash
# Membangun SIPINJAM (PinjamYuk) menjadi berkas jar. Jalankan dari folder proyek.
set -e

rm -rf out
mkdir -p out

echo "Mengompilasi seluruh sumber Java..."
javac -encoding UTF-8 -d out $(find src -name "*.java")

echo "Membuat sipinjam.jar..."
jar cfe sipinjam.jar sipinjam.AplikasiSipinjam -C out .

echo "=========================================================="
echo "  Kompilasi Sukses!"
echo "  - Untuk Backend REST API Server : ./run_server.sh"
echo "  - Untuk Desktop GUI Lama (Swing): ./run.sh"
echo "  - Untuk Frontend Web Reaktif    : cd frontend && npm run dev"
echo "=========================================================="
