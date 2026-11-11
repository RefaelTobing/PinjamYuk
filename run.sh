#!/usr/bin/env bash
# Menjalankan SIPINJAM dari hasil kompilasi (folder out/) atau dari jar.
set -e

if [ -f sipinjam.jar ]; then
    java -Dfile.encoding=UTF-8 -jar sipinjam.jar
else
    java -Dfile.encoding=UTF-8 -cp out sipinjam.AplikasiSipinjam
fi
