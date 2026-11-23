#!/usr/bin/env bash
# Membangun SIPINJAM (PinjamYuk) menjadi berkas jar. Jalankan dari folder proyek.
set -e

# Target bytecode 17 agar jar bisa dijalankan di JDK 17, 21, dan 25 sekaligus.
# Tanpa --release, jar hasil build di JDK 25 tidak bisa dibuka di JDK 17/21
# (UnsupportedClassVersionError).
RELEASE=17

rm -rf out
mkdir -p out

echo "Mengompilasi seluruh sumber Java (release ${RELEASE})..."
javac --release "${RELEASE}" -encoding UTF-8 -d out $(find src -name "*.java")

echo "Membuat sipinjam.jar..."
jar cfe sipinjam.jar sipinjam.AplikasiSipinjam -C out .

echo "Membuat sipinjam-server.jar..."
jar cfe sipinjam-server.jar sipinjam.AplikasiServer -C out .

echo "========================================================"
echo "  Kompilasi Sukses!"
echo "  - Untuk Backend REST API Server : ./run_server.sh"
echo "  - Untuk Desktop GUI Lama (Swing): ./run.sh"
echo "  - Untuk Frontend Web Reaktif    : cd frontend && npm run dev"
echo "========================================================"
