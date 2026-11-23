import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const jarPath = path.join(rootDir, 'sipinjam-server.jar');
const outDir = path.join(rootDir, 'out');

console.log('============================================================');
console.log('  Memulai SIPINJAM Backend Server (Java)...');
console.log('============================================================');

let command = 'java';
let args = [];

if (fs.existsSync(jarPath)) {
  args = ['-Dfile.encoding=UTF-8', '-jar', 'sipinjam-server.jar'];
} else if (fs.existsSync(outDir)) {
  args = ['-Dfile.encoding=UTF-8', '-cp', 'out', 'sipinjam.AplikasiServer'];
} else {
  console.error('[ERROR] Berkas sipinjam-server.jar maupun folder out belum ada!');
  console.error('Silakan jalankan build.bat (Windows) atau ./build.sh (Linux) terlebih dahulu.');
  process.exit(1);
}

const proc = spawn(command, args, {
  cwd: rootDir,
  stdio: 'inherit',
  shell: false,
});

proc.on('error', (err) => {
  console.error('[ERROR] Gagal mengeksekusi Java:', err.message);
  console.error('Pastikan Java (JRE / JDK) sudah terpasang dan ada di PATH sistem.');
});
