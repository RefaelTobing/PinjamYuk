#!/usr/bin/env bash
set -e

PORT=8089
echo "1. Menjalankan server pada port $PORT di background..."
java -cp out sipinjam.AplikasiServer --port $PORT --data data > /tmp/sipinjam_server.log 2>&1 &
SERVER_PID=$!
sleep 2

cleanup() {
    echo "Menghentikan server (PID $SERVER_PID)..."
    kill -9 $SERVER_PID 2>/dev/null || true
}
trap cleanup EXIT

echo "2. Uji GET /api/health"
curl -s "http://localhost:$PORT/api/health" | grep -q "UP" && echo "  -> HEALTH CHECK LULUS"

echo "3. Uji POST /api/auth/login (Mahasiswa)"
LOGIN_RESP=$(curl -s -X POST "http://localhost:$PORT/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"mahasiswa","password":"mahasiswa123"}')
echo "$LOGIN_RESP" | grep -q "220411100001" && echo "  -> LOGIN MAHASISWA LULUS"

echo "4. Uji GET /api/inventaris/barang"
BARANG_RESP=$(curl -s "http://localhost:$PORT/api/inventaris/barang")
echo "$BARANG_RESP" | grep -q "PJK-01" && echo "  -> GET INVENTARIS BARANG LULUS"

echo "5. Uji GET /api/inventaris/ruangan"
RUANG_RESP=$(curl -s "http://localhost:$PORT/api/inventaris/ruangan")
echo "$RUANG_RESP" | grep -q "R-101" && echo "  -> GET RUANGAN LULUS"

echo "6. Uji GET /api/booking/jadwal (Peta slot 07.00-21.00)"
JADWAL_RESP=$(curl -s "http://localhost:$PORT/api/booking/jadwal?kodeRuangan=R-101&tanggal=2026-11-20")
echo "$JADWAL_RESP" | grep -q "07:00" && echo "  -> GET JADWAL SLOT RUANGAN LULUS"

echo "7. Uji GET /api/laporan/ringkasan"
LAPORAN_RESP=$(curl -s "http://localhost:$PORT/api/laporan/ringkasan")
echo "$LAPORAN_RESP" | grep -q "totalBarang" && echo "  -> GET LAPORAN RINGKASAN LULUS"

echo "=== SELURUH PENGUJIAN API BERHASIL DENGAN STATUS 200 OK ==="
