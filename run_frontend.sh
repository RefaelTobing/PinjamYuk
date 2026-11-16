#!/usr/bin/env bash
set -e

cd frontend

if [ ! -d "node_modules" ]; then
    echo "============================================================"
    echo "  Folder node_modules belum ada."
    echo "  Mengunduh dan memasang dependensi frontend (npm install)..."
    echo "============================================================"
    npm install
fi

echo "============================================================"
echo "  Menjalankan Frontend Web SIPINJAM (Vite)..."
echo "  Buka di peramban: http://localhost:5173"
echo "  Tekan Ctrl+C untuk berhenti."
echo "============================================================"

exec npm run dev
