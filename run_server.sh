#!/usr/bin/env bash
set -e

PORT=8080
DATA_DIR="data"

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --port) PORT="$2"; shift ;;
        --data) DATA_DIR="$2"; shift ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

echo "Menyusun (compile) backend Java SIPINJAM..."
mkdir -p out
javac -encoding UTF-8 -d out $(find src -name "*.java")

echo "Menjalankan SIPINJAM Backend Server pada port ${PORT}..."
exec java -cp out sipinjam.AplikasiServer --port "${PORT}" --data "${DATA_DIR}"
