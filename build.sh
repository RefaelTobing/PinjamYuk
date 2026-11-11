#!/usr/bin/env bash
# Membangun SIPINJAM menjadi berkas jar. Jalankan dari folder proyek.
set -e

rm -rf out
mkdir -p out

echo "Mengompilasi sumber..."
javac -encoding UTF-8 -d out $(find src -name "*.java")

echo "Membuat sipinjam.jar..."
jar cfe sipinjam.jar sipinjam.AplikasiSipinjam -C out .

echo "Selesai. Jalankan dengan: ./run.sh"
