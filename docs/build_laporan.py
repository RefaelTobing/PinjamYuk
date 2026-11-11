"""Menyusun laporan Final Project PBO (BAB I, BAB II, Progress Minggu 1) untuk SIPINJAM."""
import os
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING, WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

BASE = os.path.dirname(os.path.abspath(__file__))
DIAG = os.path.join(BASE, "diagrams")
OUT = os.path.join(BASE, "LAPORAN_SIPINJAM_BAB1_BAB2.docx")

doc = Document()

# ---------------------------------------------------------------- setup
sec = doc.sections[0]
sec.page_width, sec.page_height = Cm(21), Cm(29.7)
sec.left_margin, sec.right_margin = Cm(4), Cm(3)
sec.top_margin, sec.bottom_margin = Cm(3), Cm(3)

st = doc.styles["Normal"]
st.font.name = "Times New Roman"
st.font.size = Pt(12)
st.element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
pf = st.paragraph_format
pf.line_spacing_rule = WD_LINE_SPACING.ONE_POINT_FIVE
pf.space_after = Pt(6)
pf.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

for name, size in (("Heading 1", 14), ("Heading 2", 12), ("Heading 3", 12)):
    s = doc.styles[name]
    s.font.name = "Times New Roman"
    s.font.size = Pt(size)
    s.font.bold = True
    s.font.italic = (name == "Heading 3")
    s.font.color.rgb = RGBColor(0, 0, 0)
    s.paragraph_format.space_before = Pt(14 if name == "Heading 1" else 10)
    s.paragraph_format.space_after = Pt(8 if name == "Heading 1" else 6)
    s.paragraph_format.keep_with_next = True


def _field(par, code):
    r = par.add_run()
    f1 = OxmlElement("w:fldChar"); f1.set(qn("w:fldCharType"), "begin")
    it = OxmlElement("w:instrText"); it.set(qn("xml:space"), "preserve"); it.text = code
    f2 = OxmlElement("w:fldChar"); f2.set(qn("w:fldCharType"), "end")
    r._r.append(f1); r._r.append(it); r._r.append(f2)


footer = sec.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
_field(footer, "PAGE")
for r in footer.runs:
    r.font.size = Pt(10)
    r.font.name = "Times New Roman"


def h1(text, page_break=True):
    if page_break:
        doc.add_page_break()
    p = doc.add_heading(text, level=1)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    return p


def h2(text):
    return doc.add_heading(text, level=2)


def h3(text):
    return doc.add_heading(text, level=3)


def p(text, first_indent=True, align="justify", size=None, italic=False, bold=False,
      space_after=6):
    par = doc.add_paragraph()
    par.paragraph_format.first_line_indent = Cm(1.25) if first_indent else Cm(0)
    par.paragraph_format.alignment = {"justify": WD_ALIGN_PARAGRAPH.JUSTIFY,
                                      "center": WD_ALIGN_PARAGRAPH.CENTER,
                                      "left": WD_ALIGN_PARAGRAPH.LEFT}[align]
    par.paragraph_format.space_after = Pt(space_after)
    r = par.add_run(text)
    r.italic, r.bold = italic, bold
    if size:
        r.font.size = Pt(size)
    return par


def note(text):
    """Catatan pengisian — harus dihapus sebelum dikumpulkan."""
    par = doc.add_paragraph()
    par.paragraph_format.left_indent = Cm(0.8)
    par.paragraph_format.space_before = Pt(6)
    par.paragraph_format.space_after = Pt(10)
    par.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    r = par.add_run("CATATAN PENGISIAN — " + text)
    r.italic = True
    r.font.size = Pt(10.5)
    r.font.color.rgb = RGBColor(0xB0, 0x30, 0x00)
    pPr = par._p.get_or_add_pPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear"); shd.set(qn("w:fill"), "FFF4E5")
    pPr.append(shd)


def items(lst, numbered=True):
    style = "List Number" if numbered else "List Bullet"
    for t in lst:
        par = doc.add_paragraph(t, style=style)
        par.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        par.paragraph_format.space_after = Pt(3)
        par.paragraph_format.left_indent = Cm(1.0)
        for r in par.runs:
            r.font.name = "Times New Roman"
            r.font.size = Pt(12)


def caption(text, before=6):
    par = doc.add_paragraph()
    par.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
    par.paragraph_format.space_before = Pt(before)
    par.paragraph_format.space_after = Pt(10)
    r = par.add_run(text)
    r.italic = True
    r.font.size = Pt(10.5)


def shade(cell, hexcolor):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear"); shd.set(qn("w:fill"), hexcolor)
    tcPr.append(shd)


def table(headers, rows, widths=None, font=10.5, cap=None, cap_first=True):
    if cap:
        caption(cap, before=10 if cap_first else 4)
    t = doc.add_table(rows=1, cols=len(headers))
    t.style = "Table Grid"
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = True
    hdr = t.rows[0]
    trPr = hdr._tr.get_or_add_trPr()
    th = OxmlElement("w:tblHeader"); th.set(qn("w:val"), "true"); trPr.append(th)
    for i, htxt in enumerate(headers):
        c = hdr.cells[i]
        c.text = ""
        par = c.paragraphs[0]
        par.alignment = WD_ALIGN_PARAGRAPH.CENTER
        par.paragraph_format.space_after = Pt(2)
        r = par.add_run(htxt)
        r.bold = True
        r.font.size = Pt(font)
        r.font.name = "Times New Roman"
        shade(c, "DCE6F1")
    for row in rows:
        cells = t.add_row().cells
        for i, val in enumerate(row):
            c = cells[i]
            c.text = ""
            par = c.paragraphs[0]
            par.alignment = WD_ALIGN_PARAGRAPH.LEFT if i else WD_ALIGN_PARAGRAPH.CENTER
            par.paragraph_format.space_after = Pt(2)
            par.paragraph_format.line_spacing_rule = WD_LINE_SPACING.SINGLE
            r = par.add_run(str(val))
            r.font.size = Pt(font)
            r.font.name = "Times New Roman"
    if widths:
        total = sum(widths)
        skala = 13.9 / total if total > 13.9 else 1.0
        for row in t.rows:
            for i, w in enumerate(widths):
                row.cells[i].width = Cm(w * skala)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    return t


def code(lines):
    import textwrap
    wrapped = []
    for line in lines:
        if len(line) <= 72:
            wrapped.append(line)
        else:
            wrapped.extend(textwrap.wrap(line, width=72, subsequent_indent="      ",
                                         break_long_words=True))
    lines = wrapped
    for i, line in enumerate(lines):
        par = doc.add_paragraph()
        par.paragraph_format.left_indent = Cm(1.0)
        par.paragraph_format.space_after = Pt(0)
        par.paragraph_format.space_before = Pt(0)
        par.paragraph_format.line_spacing_rule = WD_LINE_SPACING.SINGLE
        par.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
        r = par.add_run(line)
        r.font.name = "Consolas"
        r._element.rPr.rFonts.set(qn("w:eastAsia"), "Consolas")
        r.font.size = Pt(8.5)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)


def figure(path, width_cm, cap):
    par = doc.add_paragraph()
    par.alignment = WD_ALIGN_PARAGRAPH.CENTER
    par.paragraph_format.space_before = Pt(8)
    par.paragraph_format.space_after = Pt(2)
    par.add_run().add_picture(path, width=Cm(width_cm))
    caption(cap, before=2)


# ================================================================ COVER
for _ in range(2):
    doc.add_paragraph()
p("LAPORAN FINAL PROJECT", first_indent=False, align="center", size=16, bold=True, space_after=2)
p("PRAKTIKUM PEMROGRAMAN BERORIENTASI OBJEK", first_indent=False, align="center",
  size=14, bold=True, space_after=24)
p("SIPINJAM: SISTEM INFORMASI PEMINJAMAN INVENTARIS DAN SARANA PRASARANA KAMPUS "
  "OLEH MAHASISWA BERBASIS JAVA", first_indent=False, align="center", size=14, bold=True,
  space_after=30)
p("Diajukan untuk memenuhi tugas Final Project\nPraktikum Pemrograman Berorientasi Objek",
  first_indent=False, align="center", size=12, italic=True, space_after=36)
p("Disusun oleh:", first_indent=False, align="center", space_after=4)

table(["No", "Nama", "NIM", "Kelas"],
      [["1", "…………………………………", "……………………", "…………"],
       ["2", "…………………………………", "……………………", "…………"],
       ["3", "…………………………………", "……………………", "…………"]],
      widths=[1.2, 5.6, 4.2, 3.0], font=11)

p("PROGRAM STUDI D3 TEKNIK INFORMATIKA PSDKU LAMONGAN", first_indent=False,
  align="center", bold=True, space_after=2)
p("DOSEN PENGAMPU: …………………………………", first_indent=False, align="center", space_after=2)
p("TAHUN 2026", first_indent=False, align="center", bold=True)
note("Lengkapi nama anggota, NIM, kelas, dan nama dosen pengampu pada bagian ini dan "
     "pada Tabel 3.6 sebelum laporan diserahkan.")

# ================================================================ BAB I
h1("BAB I PENDAHULUAN")

h2("1.1 Latar Belakang")
p("Sarana dan prasarana kampus merupakan aset yang digunakan bersama oleh seluruh warga "
  "kampus. Barang seperti proyektor, pengeras suara, kursi lipat, meja, jas laboratorium, "
  "alat praktikum, serta ruangan kelas dan ruang rapat tidak hanya dipakai untuk perkuliahan, "
  "tetapi juga untuk kegiatan praktikum, rapat organisasi mahasiswa, seminar, lomba, dan "
  "kegiatan pengabdian. Pada praktiknya, permintaan peminjaman barang tersebut datang hampir "
  "setiap pekan dan harus dilayani oleh bagian sarana dan prasarana dengan sumber daya "
  "petugas yang terbatas.")
p("Proses peminjaman yang berjalan saat ini masih dilakukan secara manual. Mahasiswa mengisi "
  "formulir permohonan, meminta tanda tangan koordinator atau dosen pembina, kemudian "
  "menyerahkannya ke petugas sarana dan prasarana. Pencatatan barang keluar dan barang masuk "
  "dilakukan pada buku catatan. Cara kerja seperti ini menimbulkan beberapa permasalahan yang "
  "saling berkaitan.")
p("Pertama, ketersediaan barang tidak dapat diketahui tanpa bertanya langsung. Mahasiswa harus "
  "datang ke ruang sarana dan prasarana untuk memastikan apakah barang yang dibutuhkan tersedia "
  "pada tanggal kegiatan. Jika ternyata barang sedang dipinjam, mahasiswa harus kembali lagi di "
  "lain waktu atau mencari alternatif secara mendadak, sehingga kegiatan berisiko tertunda. "
  "Kedua, tidak ada mekanisme yang mencegah bentrok jadwal. Dua kegiatan yang berlangsung pada "
  "tanggal yang sama dapat meminjam barang yang sama karena pencatatan manual tidak memeriksa "
  "tumpang tindih tanggal secara otomatis.")
p("Ketiga, pengembalian barang tidak terkendali. Tanpa penagihan dan perhitungan sanksi yang "
  "konsisten, barang sering tertahan berhari-hari setelah tanggal yang dijanjikan, bahkan ada "
  "barang yang tidak dilaporkan kembali. Keempat, kondisi barang saat dikembalikan tidak "
  "diperiksa dan tidak dicatat, sehingga kerusakan atau kehilangan tidak dapat ditelusuri "
  "kepada peminjam yang bertanggung jawab dan biaya perbaikan harus ditanggung oleh kampus. "
  "Kelima, riwayat peminjaman tidak terpusat. Data pada buku catatan tidak dapat dicari kembali "
  "dengan cepat, tidak dapat diurutkan berdasarkan peminjam, dan tidak dapat diolah menjadi "
  "laporan bulanan untuk keperluan evaluasi aset.")
p("Berdasarkan kondisi tersebut, diperlukan sebuah aplikasi yang memusatkan seluruh proses "
  "peminjaman inventaris kampus dalam satu sistem, mampu memeriksa ketersediaan barang pada "
  "rentang tanggal tertentu secara otomatis, menerapkan aturan kelayakan peminjam, mencatat "
  "serah terima dan pengembalian beserta kondisi barang, serta menghitung denda keterlambatan "
  "sesuai jenis barang. Aplikasi dikembangkan menggunakan bahasa pemrograman Java dengan "
  "menerapkan konsep Object-Oriented Programming, yaitu encapsulation, inheritance, polymorphism, "
  "dan abstraction, serta dilengkapi exception handling, Collection Framework, dan file handling "
  "sebagai media penyimpanan data.")
note("Bagian ini sengaja tidak memuat angka statistik. Jangan menuliskan persentase atau jumlah "
     "kasus tanpa sumber. Cara mengisi data pendukung secara sah: (1) lakukan observasi pada buku "
     "catatan peminjaman di bagian sarana dan prasarana, lalu catat jumlah transaksi dan jumlah "
     "kasus keterlambatan selama satu bulan beserta tanggal observasinya; atau (2) sebar kuesioner "
     "singkat kepada mahasiswa satu angkatan, misalnya 25 responden, kemudian tuliskan hasilnya "
     "secara eksplisit (contoh: “berdasarkan kuesioner terhadap 25 mahasiswa pada 12 November 2026, "
     "19 responden pernah gagal memperoleh barang karena sudah dipinjam dan 11 responden "
     "menyatakan barang yang dipinjam kelompoknya terlambat dikembalikan”). Cantumkan instrumen "
     "dan hasilnya pada lampiran.")

h2("1.2 Rumusan Masalah")
items([
    "Bagaimana merancang aplikasi yang memusatkan proses peminjaman inventaris dan sarana "
    "prasarana kampus sehingga pencatatan tidak lagi dilakukan secara manual?",
    "Bagaimana memeriksa ketersediaan barang pada rentang tanggal tertentu secara otomatis "
    "agar bentrok jadwal peminjaman dapat dicegah?",
    "Bagaimana menerapkan aturan kelayakan peminjam dan perhitungan denda yang berbeda untuk "
    "setiap jenis barang secara konsisten?",
    "Bagaimana menerapkan encapsulation, inheritance, polymorphism, dan abstraction beserta "
    "exception handling, Collection Framework, dan file handling pada aplikasi yang dibangun?",
])

h2("1.3 Tujuan Pengembangan Aplikasi")
items([
    "Menghasilkan aplikasi Java yang memusatkan pengelolaan data inventaris, pengajuan "
    "peminjaman, serah terima, pengembalian, dan pelaporan peminjaman kampus.",
    "Menghasilkan mekanisme pemeriksaan ketersediaan barang yang memperhitungkan tumpang "
    "tindih rentang tanggal peminjaman sehingga bentrok jadwal dapat dicegah.",
    "Menghasilkan penerapan aturan kelayakan peminjam dan perhitungan denda otomatis yang "
    "berbeda sesuai jenis barang.",
    "Menerapkan seluruh konsep OOP yang dipersyaratkan pada struktur program yang modular "
    "dan terorganisasi.",
])

h2("1.4 Batasan Masalah")
items([
    "Aplikasi berbasis desktop dan dijalankan secara lokal (single user), tanpa jaringan "
    "maupun layanan daring.",
    "Data disimpan pada berkas lokal (file handling), belum menggunakan sistem basis data.",
    "Antarmuka berbasis console (Command Line Interface) dengan menu bernomor.",
    "Data inventaris, kategori, lokasi penyimpanan, dan tarif denda diinput oleh petugas; "
    "aplikasi tidak terhubung ke sistem informasi aset kampus.",
    "Pemeriksaan ketersediaan dilakukan berdasarkan stok dan rentang tanggal peminjaman, "
    "bukan berdasarkan pelacakan fisik barang.",
    "Denda dihitung secara otomatis, tetapi pembayaran denda dicatat sebagai status lunas atau "
    "belum lunas, tidak terhubung ke sistem pembayaran.",
    "Persetujuan pembina hanya diberikan untuk barang yang ditandai memerlukan persetujuan "
    "(ruangan dan alat laboratorium).",
    "Bukti serah terima berupa catatan tekstual, bukan tanda tangan digital atau berkas pindaian.",
    "Aplikasi tidak menyediakan notifikasi otomatis ke perangkat pengguna.",
])

h2("1.5 Manfaat")
items([
    "Bagi mahasiswa: menyediakan satu kanal resmi untuk mengetahui ketersediaan barang, "
    "mengajukan peminjaman, dan memantau status pengajuan serta denda.",
    "Bagi petugas sarana dan prasarana: mempermudah pendataan inventaris, pencegahan bentrok "
    "jadwal, pencatatan serah terima, dan penyusunan laporan bulanan.",
    "Bagi penulis: menjadi sarana penerapan langsung konsep OOP pada permasalahan nyata di "
    "lingkungan kampus.",
])

# ================================================================ BAB II
h1("BAB II ANALISIS DAN PERANCANGAN SISTEM")

h2("2.1 Deskripsi Sistem")
p("SIPINJAM (Sistem Informasi Peminjaman Inventaris dan Sarana Prasarana Kampus) adalah "
  "aplikasi desktop berbasis Java yang mengelola siklus peminjaman inventaris kampus mulai dari "
  "pengajuan oleh mahasiswa, pemeriksaan ketersediaan dan kelayakan secara otomatis, verifikasi "
  "oleh petugas, persetujuan pembina untuk barang tertentu, serah terima barang, pengembalian "
  "beserta pencatatan kondisi, perhitungan denda, hingga penyusunan rekap peminjaman.")
table(["Atribut", "Keterangan"],
      [["Nama sistem", "SIPINJAM"],
       ["Jenis aplikasi", "Aplikasi desktop berbasis console"],
       ["Bahasa pemrograman", "Java (JDK 8 atau lebih baru)"],
       ["Media penyimpanan", "Berkas teks berpemisah (file handling)"],
       ["Pengguna", "Mahasiswa, Petugas Sarana dan Prasarana, Dosen Pembina"],
       ["Proses utama", "Pemeriksaan ketersediaan berbasis tumpang tindih tanggal, "
                        "validasi kelayakan peminjam, dan perhitungan denda per jenis barang"]],
      widths=[4.2, 9.8], font=10.5, cap="Tabel 2.1 Identitas Sistem")

h2("2.2 Aktor dan Hak Akses")
table(["Aktor", "Deskripsi", "Hak Akses Utama"],
      [["Mahasiswa",
        "Peminjam yang mengajukan permohonan penggunaan barang atau ruangan untuk kegiatan "
        "praktikum, organisasi, atau kegiatan akademik.",
        "Melihat ketersediaan barang; mengajukan dan membatalkan pengajuan; melihat status "
        "pengajuan; melihat riwayat peminjaman dan denda."],
       ["Petugas Sarana dan Prasarana",
        "Pengelola inventaris kampus yang memverifikasi pengajuan dan mencatat serah terima "
        "serta pengembalian barang.",
        "Mengelola data barang, kategori, dan pengguna; memverifikasi dan menyetujui atau "
        "menolak pengajuan; mencatat serah terima dan pengembalian; memantau jatuh tempo; "
        "menyusun rekap peminjaman."],
       ["Dosen Pembina",
        "Dosen atau koordinator yang memberikan persetujuan akhir untuk peminjaman barang "
        "tertentu, seperti ruangan dan alat laboratorium.",
        "Menyetujui atau menolak pengajuan yang memerlukan persetujuan pembina; memantau "
        "peminjaman yang belum dikembalikan."]],
      widths=[3.6, 5.4, 5.0], font=10.5, cap="Tabel 2.2 Aktor dan Hak Akses")

h2("2.3 Kebutuhan Fungsional")
table(["Kode", "Kebutuhan Fungsional", "Aktor"],
      [["FR-01", "Sistem dapat melakukan registrasi akun mahasiswa dan login dengan peran "
                 "(mahasiswa, petugas, dosen pembina).", "Semua"],
       ["FR-02", "Sistem dapat menampilkan, menambah, mengubah, dan menghapus data pengguna.",
        "Petugas"],
       ["FR-03", "Sistem dapat menampilkan, menambah, mengubah, dan menghapus data barang "
                 "inventaris beserta kategori, jumlah stok, harga satuan, dan tarif denda.",
        "Petugas"],
       ["FR-04", "Sistem dapat mengelola data kategori barang (elektronik, alat laboratorium, "
                 "furnitur, ruangan).", "Petugas"],
       ["FR-05", "Sistem dapat mencari dan memfilter barang berdasarkan kode, nama, kategori, "
                 "dan status ketersediaan.", "Semua"],
       ["FR-06", "Sistem dapat memeriksa ketersediaan barang pada rentang tanggal tertentu "
                 "berdasarkan stok dan peminjaman yang sudah disetujui atau sedang berjalan.",
        "Semua"],
       ["FR-07", "Sistem dapat menerima pengajuan peminjaman yang memuat satu atau lebih barang, "
                 "jumlah, tanggal mulai, tanggal selesai, keperluan, dan penanggung jawab.",
        "Mahasiswa"],
       ["FR-08", "Sistem dapat memvalidasi kelayakan peminjam berdasarkan status mahasiswa, "
                 "jumlah peminjaman aktif, tunggakan denda, batas waktu pengajuan, dan durasi "
                 "peminjaman.", "Sistem"],
       ["FR-09", "Sistem dapat membatalkan pengajuan yang belum diverifikasi oleh petugas.",
        "Mahasiswa"],
       ["FR-10", "Sistem dapat memverifikasi pengajuan dengan keputusan menyetujui atau menolak "
                 "beserta catatan alasan.", "Petugas"],
       ["FR-11", "Sistem dapat mencegah pengajuan berlanjut sebelum memperoleh persetujuan dosen "
                 "pembina untuk barang yang memerlukan persetujuan.", "Dosen Pembina"],
       ["FR-12", "Sistem dapat mencatat serah terima barang sehingga status peminjaman berubah "
                 "menjadi dipinjam.", "Petugas"],
       ["FR-13", "Sistem dapat mencatat pengembalian barang beserta kondisi akhir setiap barang "
                 "(baik, rusak ringan, rusak berat, hilang).", "Petugas"],
       ["FR-14", "Sistem dapat menghitung denda keterlambatan dan denda akibat kondisi barang "
                 "secara otomatis sesuai jenis barang.", "Sistem"],
       ["FR-15", "Sistem dapat menampilkan riwayat peminjaman dan total denda per mahasiswa.",
        "Mahasiswa, Petugas"],
       ["FR-16", "Sistem dapat menampilkan daftar peminjaman aktif dan peminjaman yang mendekati "
                 "atau melewati tanggal jatuh tempo.", "Petugas, Dosen Pembina"],
       ["FR-17", "Sistem dapat menyusun rekap peminjaman per kategori, per barang, tingkat "
                 "keterlambatan, dan barang paling sering dipinjam.", "Petugas"],
       ["FR-18", "Sistem dapat menyimpan seluruh data ke berkas dan memuatnya kembali saat "
                 "aplikasi dijalankan.", "Sistem"],
       ["FR-19", "Sistem dapat memvalidasi seluruh input dan menampilkan pesan kesalahan tanpa "
                 "menghentikan aplikasi.", "Sistem"],
       ["FR-20", "Sistem dapat membatasi akses menu berdasarkan peran pengguna yang login.",
        "Sistem"]],
      widths=[1.6, 10.2, 2.6], font=10, cap="Tabel 2.3 Kebutuhan Fungsional Sistem")

h2("2.4 Kebutuhan Non-Fungsional")
items([
    "Aplikasi berjalan pada JDK 8 atau lebih baru tanpa dependensi pustaka eksternal wajib.",
    "Struktur program modular dengan pemisahan lapisan model, layanan, penyimpanan, dan "
    "antarmuka sehingga perubahan pada satu lapisan tidak merusak lapisan lain.",
    "Data tetap tersimpan setelah aplikasi ditutup dan dapat dimuat kembali tanpa kehilangan data.",
    "Pesan kesalahan ditampilkan dalam bahasa Indonesia yang mudah dipahami pengguna.",
    "Seluruh atribut data dilindungi (private) dan hanya diakses melalui method yang disediakan.",
    "Pemeriksaan ketersediaan dan perhitungan denda selesai dalam waktu kurang dari satu detik "
    "untuk data uji minimal 50 barang dan 200 transaksi peminjaman.",
])

h2("2.5 Proses Bisnis Sistem")
h3("2.5.1 Alur Utama Peminjaman")
items([
    "Mahasiswa login, mencari barang, dan memeriksa ketersediaan barang pada rentang tanggal "
    "kegiatan.",
    "Mahasiswa mengisi pengajuan peminjaman: barang dan jumlah, tanggal mulai, tanggal selesai, "
    "keperluan, dan nama penanggung jawab.",
    "Sistem menjalankan pemeriksaan kelayakan peminjam dan pemeriksaan ketersediaan stok pada "
    "rentang tanggal tersebut.",
    "Jika lolos pemeriksaan, pengajuan tersimpan dengan status DIAJUKAN. Jika tidak lolos, "
    "pengajuan ditolak dan sistem menampilkan alasan penolakan.",
    "Petugas memverifikasi pengajuan dan memutuskan DISETUJUI atau DITOLAK beserta catatan.",
    "Untuk barang yang memerlukan persetujuan pembina, pengajuan berstatus DISETUJUI belum dapat "
    "dilanjutkan sebelum dosen pembina memberikan persetujuan.",
    "Saat barang diambil, petugas mencatat serah terima dan status berubah menjadi DIPINJAM.",
    "Saat barang dikembalikan, petugas mencatat tanggal kembali dan kondisi setiap barang; "
    "sistem menghitung denda dan status berubah menjadi DIKEMBALIKAN.",
])

h3("2.5.2 Status Peminjaman")
table(["Status", "Makna", "Perubahan Status Berikutnya"],
      [["DIAJUKAN", "Pengajuan tersimpan dan menunggu verifikasi petugas",
        "DISETUJUI, DITOLAK, atau DIBATALKAN"],
       ["DISETUJUI", "Pengajuan disetujui petugas dan menunggu pengambilan barang",
        "DIPINJAM atau DIBATALKAN"],
       ["DITOLAK", "Pengajuan ditolak petugas beserta alasan", "Tidak ada (status akhir)"],
       ["DIBATALKAN", "Pengajuan dibatalkan mahasiswa sebelum barang diambil",
        "Tidak ada (status akhir)"],
       ["DIPINJAM", "Barang telah diserahterimakan kepada mahasiswa", "DIKEMBALIKAN"],
       ["DIKEMBALIKAN", "Barang telah dikembalikan dan kondisi dicatat",
        "Tidak ada (status akhir)"]],
      widths=[3.0, 7.0, 4.4], font=10, cap="Tabel 2.4 Status Peminjaman")
p("Status terlambat tidak disimpan sebagai status tersendiri, melainkan dihitung dari "
  "perbandingan tanggal selesai dengan tanggal kembali. Cara ini dipilih agar status tidak "
  "pernah bertentangan dengan tanggal yang tercatat.", first_indent=True)

h3("2.5.3 Aturan Pemeriksaan Ketersediaan")
p("Ketersediaan barang diperiksa dengan menghitung jumlah unit yang sudah terpakai pada rentang "
  "tanggal yang diminta. Dua rentang tanggal dinyatakan bertumpang tindih apabila tanggal mulai "
  "peminjaman pertama tidak melewati tanggal selesai peminjaman kedua dan sebaliknya.")
code(["terpakai(barang, mulai, selesai) = jumlah dari semua detail peminjaman",
      "    dengan status DISETUJUI atau DIPINJAM",
      "    yang memenuhi: (mulai1 <= selesai2) DAN (mulai2 <= selesai1)",
      "",
      "tersedia  jika  stokTotal - terpakai(barang, mulai, selesai) >= jumlahDiminta"])
p("Contoh: proyektor dengan stok 3 unit. Peminjaman A memakai 2 unit pada 10–12 November dan "
  "peminjaman B memakai 2 unit pada 11–13 November. Permintaan 1 unit pada 12 November ditolak "
  "karena pada tanggal tersebut seluruh unit sedang terpakai, meskipun pada 12 November hanya "
  "peminjaman A dan B yang bertumpang tindih dan total pemakaian mencapai 4 unit dari 3 unit "
  "yang tersedia.")

h3("2.5.4 Aturan Kelayakan Peminjam")
table(["Kode", "Aturan", "Ketentuan"],
      [["R1", "Status mahasiswa", "Hanya mahasiswa berstatus aktif yang boleh mengajukan "
                                   "peminjaman."],
       ["R2", "Batas peminjaman aktif", "Maksimal dua peminjaman aktif (berstatus DIAJUKAN, "
                                         "DISETUJUI, atau DIPINJAM) dalam satu waktu."],
       ["R3", "Tunggakan denda", "Pengajuan ditolak apabila mahasiswa masih memiliki denda yang "
                                  "belum dibayar."],
       ["R4", "Batas waktu pengajuan", "Pengajuan paling lambat satu hari sebelum tanggal mulai; "
                                        "khusus ruangan paling lambat tiga hari sebelum."],
       ["R5", "Durasi peminjaman", "Maksimal tujuh hari untuk barang; satu hari untuk ruangan."]],
      widths=[1.4, 4.0, 9.0], font=10, cap="Tabel 2.5 Aturan Kelayakan Peminjam")
p("Setiap aturan diimplementasikan sebagai kelas terpisah yang menerapkan satu antarmuka yang "
  "sama. Pemeriksaan dilakukan dengan mengulang seluruh aturan yang terdaftar, sehingga aturan "
  "baru dapat ditambahkan tanpa mengubah kode pemeriksa utama.")

h3("2.5.5 Perhitungan Denda")
p("Denda dihitung dari dua komponen, yaitu denda keterlambatan yang dikalikan jumlah hari "
  "terlambat dan denda akibat kondisi barang saat dikembalikan. Tarif berbeda untuk setiap jenis "
  "barang karena nilai dan risiko kerusakannya berbeda.")
table(["Jenis Barang", "Denda per Hari", "Rusak Ringan", "Rusak Berat", "Hilang"],
      [["BarangElektronik", "Rp10.000", "Rp100.000", "40% harga satuan", "100% harga satuan"],
       ["AlatLaboratorium", "Rp15.000", "Rp75.000", "50% harga satuan", "100% harga satuan"],
       ["BarangFurnitur", "Rp5.000", "Rp25.000", "30% harga satuan", "100% harga satuan"],
       ["Ruangan", "Tidak ada", "Tidak ada", "Tidak ada",
        "Tidak ada (denda pembatalan Rp50.000 jika dibatalkan kurang dari H-1)"]],
      widths=[3.6, 2.4, 2.6, 3.0, 3.0], font=9.5, cap="Tabel 2.6 Ketentuan Denda per Jenis Barang")
code(["denda = (tarifHarian x hariTerlambat) + biayaKondisi(kondisiAkhir)",
      "hariTerlambat = maksimum(0, tanggalKembali - tanggalSelesai)",
      "",
      "Contoh: proyektor (elektronik) terlambat 3 hari dan kembali dalam kondisi rusak ringan:",
      "denda = (10.000 x 3) + 100.000 = Rp130.000"])

h2("2.6 Use Case Diagram")
table(["Kode", "Use Case", "Aktor", "Keterangan"],
      [["UC-01", "Login", "Semua", "Autentikasi dan penentuan hak akses berdasarkan peran"],
       ["UC-02", "Registrasi akun mahasiswa", "Mahasiswa", "Pembuatan akun baru"],
       ["UC-03", "Kelola data inventaris", "Petugas", "Tambah, ubah, hapus, tampil data barang"],
       ["UC-04", "Kelola kategori barang", "Petugas", "Data induk kategori dan tarif denda"],
       ["UC-05", "Kelola data mahasiswa", "Petugas", "Data induk peminjam"],
       ["UC-06", "Cek ketersediaan dan jadwal", "Mahasiswa, Petugas",
        "Pemeriksaan stok pada rentang tanggal"],
       ["UC-07", "Ajukan peminjaman", "Mahasiswa",
        "Menyertakan pemeriksaan ketersediaan dan kelayakan"],
       ["UC-08", "Batalkan pengajuan", "Mahasiswa", "Memperluas UC-07 sebelum diverifikasi"],
       ["UC-09", "Verifikasi dan setujui", "Petugas", "Keputusan setuju atau tolak beserta alasan"],
       ["UC-10", "Persetujuan pembina", "Dosen Pembina", "Untuk ruangan dan alat laboratorium"],
       ["UC-11", "Catat serah terima", "Petugas", "Status berubah menjadi DIPINJAM"],
       ["UC-12", "Catat pengembalian dan kondisi", "Petugas",
        "Menyertakan perhitungan denda otomatis"],
       ["UC-13", "Lihat riwayat dan denda", "Mahasiswa",
        "Menyertakan perhitungan denda otomatis"],
       ["UC-14", "Pantau jatuh tempo", "Petugas, Dosen Pembina",
        "Daftar peminjaman yang mendekati atau melewati tenggat"],
       ["UC-15", "Rekap dan laporan", "Petugas", "Rekap per kategori, barang, dan keterlambatan"],
       ["UC-16", "Hitung denda otomatis", "Sistem",
        "Use case yang disertakan (include) oleh UC-12 dan UC-13"]],
      widths=[1.6, 5.2, 3.2, 5.0], font=9.5, cap="Tabel 2.7 Daftar Use Case")
figure(os.path.join(DIAG, "usecase_sipinjam.png"), 13.6,
       "Gambar 2.1 Use Case Diagram Sistem SIPINJAM")
p("Hubungan include ditunjukkan pada UC-07 terhadap UC-06 (pengajuan wajib memeriksa "
  "ketersediaan), UC-09 terhadap UC-06 (verifikasi menampilkan ulang ketersediaan), serta UC-12 "
  "dan UC-13 terhadap UC-16 (pengembalian dan riwayat menampilkan denda). Hubungan extend "
  "ditunjukkan oleh UC-08 terhadap UC-07 karena pembatalan hanya mungkin dilakukan pada "
  "pengajuan yang belum diverifikasi.")

h2("2.7 Skenario Use Case UC-07 Ajukan Peminjaman")
table(["Bagian", "Uraian"],
      [["Aktor", "Mahasiswa"],
       ["Prakondisi",
        "Pengguna sudah login sebagai mahasiswa; data barang, kategori, dan tarif denda sudah "
        "tersedia."],
       ["Alur Utama",
        "1. Mahasiswa memilih menu ajukan peminjaman.\n"
        "2. Sistem menampilkan daftar barang beserta stok pada tanggal yang diminta.\n"
        "3. Mahasiswa memilih barang dan jumlah, lalu mengisi tanggal mulai, tanggal selesai, "
        "keperluan, dan penanggung jawab.\n"
        "4. Sistem memvalidasi kelengkapan dan format input.\n"
        "5. Sistem menjalankan seluruh aturan kelayakan peminjam (R1–R5).\n"
        "6. Sistem memeriksa ketersediaan stok pada rentang tanggal yang diminta.\n"
        "7. Sistem menyimpan pengajuan dengan status DIAJUKAN dan menampilkan nomor pengajuan."],
       ["Alur Alternatif",
        "4a. Input tidak lengkap atau tanggal selesai lebih awal dari tanggal mulai — sistem "
        "menampilkan pesan kesalahan dan pengajuan tidak disimpan.\n"
        "5a. Salah satu aturan kelayakan tidak terpenuhi — sistem menampilkan aturan yang "
        "dilanggar beserta alasannya, misalnya “masih memiliki denda belum dibayar”.\n"
        "6a. Stok tidak mencukupi pada rentang tanggal tersebut — sistem menampilkan jumlah "
        "yang tersedia dan menyarankan tanggal alternatif.\n"
        "3a. Mahasiswa menekan batal — pengajuan dibatalkan dan tidak ada data yang disimpan."],
       ["Pascakondisi",
        "Pengajuan tersimpan dengan status DIAJUKAN dan muncul pada daftar pengajuan petugas."]],
      widths=[3.2, 11.8], font=10, cap="Tabel 2.8 Skenario Use Case UC-07")

h2("2.8 Perancangan Kelas")
h3("2.8.1 Daftar Kelas")
table(["No", "Kelas / Interface", "Jenis", "Tanggung Jawab"],
      [["1", "Pengguna", "abstract class",
        "Identitas dasar pengguna; method abstrak getPeran() dan tampilkanProfil()"],
       ["2", "Mahasiswa", "class", "NIM, program studi, angkatan; menghitung peminjaman aktif"],
       ["3", "PetugasSarpras", "class", "NIP dan unit kerja; melakukan verifikasi dan pencatatan"],
       ["4", "DosenPembina", "class", "NIDN dan jabatan; memberikan persetujuan pembina"],
       ["5", "KategoriBarang", "class", "Data induk kategori dan tarif denda dasar"],
       ["6", "Barang", "abstract class",
        "Data inventaris dan stok; method abstrak hitungDenda(), perluPersetujuanPembina()"],
       ["7", "BarangElektronik", "class", "Tarif denda dan ketentuan pengembalian barang elektronik"],
       ["8", "AlatLaboratorium", "class", "Tarif denda dan ketentuan alat laboratorium"],
       ["9", "BarangFurnitur", "class", "Tarif denda dan ketentuan furnitur"],
       ["10", "Ruangan", "class", "Kapasitas dan batas peminjaman ruangan; tanpa denda harian"],
       ["11", "DetailPeminjaman", "class", "Barang, jumlah, dan kondisi awal pada satu pengajuan"],
       ["12", "Peminjaman", "class",
        "Data pengajuan, status, tanggal, dan perhitungan keterlambatan"],
       ["13", "Pengembalian", "class", "Tanggal kembali, kondisi akhir, dan total denda"],
       ["14", "AturanPeminjaman", "interface", "Kontrak pemeriksaan kelayakan peminjam"],
       ["15", "AturanStatusMahasiswa", "class", "Memeriksa status aktif mahasiswa"],
       ["16", "AturanMaksimalAktif", "class", "Memeriksa jumlah peminjaman aktif"],
       ["17", "AturanTunggakanDenda", "class", "Memeriksa denda yang belum dibayar"],
       ["18", "AturanBatasWaktu", "class", "Memeriksa jarak hari antara pengajuan dan tanggal mulai"],
       ["19", "AturanDurasiMaksimal", "class", "Memeriksa durasi peminjaman"],
       ["20", "ValidatorPeminjaman", "class", "Menjalankan seluruh aturan yang terdaftar"],
       ["21", "LayananKetersediaan", "class",
        "Menghitung stok terpakai pada rentang tanggal dan menentukan ketersediaan"],
       ["22", "KalkulatorDenda", "class", "Menghitung dan merinci denda peminjaman"],
       ["23", "LayananPeminjaman", "class",
        "Mengatur alur bisnis pengajuan, verifikasi, serah terima, dan pengembalian"],
       ["24", "RepositoriBarang", "class", "Mengelola koleksi barang (ArrayList)"],
       ["25", "RepositoriPeminjaman", "class", "Mengelola koleksi peminjaman (ArrayList)"],
       ["26", "RepositoriPengguna", "class", "Mengelola koleksi pengguna dan autentikasi"],
       ["27", "PenyimpananData", "class", "Menyimpan dan memuat seluruh data ke/dari berkas"],
       ["28", "RekapPeminjaman", "class", "Menghitung rekap dan statistik peminjaman"],
       ["29", "AplikasiSipinjam", "class", "Kelas utama, menu, dan penanganan masukan pengguna"]],
      widths=[1.2, 4.4, 2.6, 6.8], font=9.5, cap="Tabel 2.9 Daftar Kelas dan Tanggung Jawab")
p("Selain kelas di atas, sistem memiliki tiga enum (StatusPeminjaman, KondisiBarang, dan "
  "PeranPengguna) serta enam kelas exception (StokTidakTersediaException, "
  "AturanDilanggarException, DataTidakDitemukanException, AksesDitolakException, "
  "TanggalTidakValidException, dan FormatBerkasException).")

h3("2.8.2 Atribut dan Method Kelas Inti")
p("Kelas abstrak Barang")
code(["public abstract class Barang {",
      "    private String kodeBarang;",
      "    private String nama;",
      "    private KategoriBarang kategori;",
      "    private int stokTotal;",
      "    private double hargaSatuan;",
      "",
      "    public Barang(String kodeBarang, String nama, KategoriBarang kategori,",
      "                  int stokTotal, double hargaSatuan) { ... }",
      "",
      "    public abstract String getJenisBarang();",
      "    public abstract double hitungDenda(long hariTerlambat, KondisiBarang kondisi);",
      "    public abstract boolean perluPersetujuanPembina();",
      "",
      "    public int getStokTotal() { return stokTotal; }",
      "    public String getNama()   { return nama; }",
      "}"])
p("Kelas Peminjaman")
code(["public class Peminjaman {",
      "    private String idPeminjaman;",
      "    private Mahasiswa mahasiswa;",
      "    private List<DetailPeminjaman> detail;",
      "    private LocalDate tanggalMulai, tanggalSelesai;",
      "    private String keperluan, penanggungJawab;",
      "    private StatusPeminjaman status;",
      "    private Pengembalian pengembalian;",
      "",
      "    public void ajukan()            { status = StatusPeminjaman.DIAJUKAN; }",
      "    public void setujui(PetugasSarpras p) { status = StatusPeminjaman.DISETUJUI; }",
      "    public void serahkanBarang(PetugasSarpras p) { status = StatusPeminjaman.DIPINJAM; }",
      "    public boolean isTerlambat()   { return lamaTerlambat() > 0; }",
      "    public long lamaTerlambat() {",
      "        LocalDate acuan = (pengembalian == null) ? LocalDate.now()",
      "                                                 : pengembalian.getTanggalKembali();",
      "        return Math.max(0, ChronoUnit.DAYS.between(tanggalSelesai, acuan));",
      "    }",
      "}"])
p("Antarmuka AturanPeminjaman dan penerapannya")
code(["public interface AturanPeminjaman {",
      "    String getNamaAturan();",
      "    void periksa(Mahasiswa m, Peminjaman p) throws AturanDilanggarException;",
      "}",
      "",
      "public class AturanMaksimalAktif implements AturanPeminjaman {",
      "    private static final int BATAS = 2;",
      "    public String getNamaAturan() { return \"Batas peminjaman aktif\"; }",
      "    public void periksa(Mahasiswa m, Peminjaman p) throws AturanDilanggarException {",
      "        if (m.hitungPeminjamanAktif() >= BATAS)",
      "            throw new AturanDilanggarException(",
      "                \"mahasiswa sudah memiliki \" + BATAS + \" peminjaman aktif\");",
      "    }",
      "}"])
p("Layanan Ketersediaan")
code(["public class LayananKetersediaan {",
      "    public int stokTerpakai(Barang b, LocalDate mulai, LocalDate selesai) {",
      "        int terpakai = 0;",
      "        for (Peminjaman p : repoPeminjaman.cariAktif()) {",
      "            if (p.getStatus() != StatusPeminjaman.DISETUJUI",
      "                    && p.getStatus() != StatusPeminjaman.DIPINJAM) continue;",
      "            boolean tumpangTindih = !p.getTanggalMulai().isAfter(selesai)",
      "                                 && !mulai.isAfter(p.getTanggalSelesai());",
      "            if (!tumpangTindih) continue;",
      "            for (DetailPeminjaman d : p.getDetail())",
      "                if (d.getBarang().getKodeBarang().equals(b.getKodeBarang()))",
      "                    terpakai += d.getJumlah();",
      "        }",
      "        return terpakai;",
      "    }",
      "}"])

h3("2.8.3 Class Diagram")
p("Class diagram disajikan dalam tiga gambar terpisah menurut paket agar teks tetap terbaca. "
  "Gambar 2.2 memuat paket model (pengguna, inventaris, dan transaksi), Gambar 2.3 memuat paket "
  "aturan validasi dan layanan, sedangkan Gambar 2.4 memuat paket penyimpanan, pelaporan, dan "
  "antarmuka.")
figure(os.path.join(DIAG, "class_model_sipinjam.png"), 13.6,
       "Gambar 2.2 Class Diagram Paket Model (Pengguna, Inventaris, Transaksi)")
figure(os.path.join(DIAG, "class_aturan_sipinjam.png"), 13.6,
       "Gambar 2.3 Class Diagram Paket Aturan Validasi dan Layanan")
figure(os.path.join(DIAG, "class_penyimpanan_sipinjam.png"), 13.6,
       "Gambar 2.4 Class Diagram Paket Penyimpanan, Pelaporan, dan Antarmuka")

h3("2.8.4 Relasi Antar Kelas")
items([
    "Generalisasi: Pengguna diturunkan menjadi Mahasiswa, PetugasSarpras, dan DosenPembina; "
    "Barang diturunkan menjadi BarangElektronik, AlatLaboratorium, BarangFurnitur, dan Ruangan.",
    "Realisasi: AturanPeminjaman diimplementasikan oleh AturanStatusMahasiswa, "
    "AturanMaksimalAktif, AturanTunggakanDenda, AturanBatasWaktu, dan AturanDurasiMaksimal.",
    "Agregasi: Peminjaman memiliki satu atau lebih DetailPeminjaman; ValidatorPeminjaman "
    "memiliki kumpulan AturanPeminjaman; setiap Repositori memiliki kumpulan objek model.",
    "Asosiasi: Peminjaman berhubungan dengan Mahasiswa sebagai peminjam, dengan PetugasSarpras "
    "sebagai pemroses, dan dengan satu Pengembalian; DetailPeminjaman menunjuk ke satu Barang; "
    "Barang termasuk dalam satu KategoriBarang.",
    "Ketergantungan: LayananPeminjaman menggunakan ValidatorPeminjaman, LayananKetersediaan, "
    "KalkulatorDenda, repositori, dan PenyimpananData; AplikasiSipinjam menggunakan "
    "LayananPeminjaman dan RekapPeminjaman.",
], numbered=False)

h2("2.9 Pemetaan Konsep OOP ke Implementasi")
table(["Konsep", "Ketentuan Instruksi", "Implementasi pada SIPINJAM", "Alasan Pemakaian"],
      [["Class dan Object", "Minimal 5 kelas saling berinteraksi",
        "29 kelas, 3 enum, dan 6 kelas exception; LayananPeminjaman menjadi pengatur interaksi",
        "Setiap kelas mewakili satu entitas atau satu tanggung jawab tunggal"],
       ["Constructor berparameter", "Wajib",
        "Seluruh kelas model memiliki constructor berparameter; Peminjaman memiliki constructor "
        "untuk pengajuan baru dan untuk pemuatan data",
        "Objek tidak dapat berada dalam keadaan tidak valid"],
       ["Encapsulation", "Atribut private dan getter/setter",
        "Seluruh atribut model private; setter hanya untuk atribut yang boleh berubah dan "
        "memuat validasi; status hanya dapat diubah melalui method ajukan(), setujui(), "
        "serahkanBarang()",
        "Mencegah perubahan status secara sembarang dari luar kelas"],
       ["Inheritance", "Minimal satu pewarisan",
        "Pengguna → Mahasiswa, PetugasSarpras, DosenPembina; Barang → BarangElektronik, "
        "AlatLaboratorium, BarangFurnitur, Ruangan",
        "Dua kelompok objek berbagi data dan perilaku yang sama, tetapi berbeda pada atribut "
        "khusus dan cara perhitungan denda"],
       ["Polymorphism", "Overriding atau interface secara polimorfik",
        "Overriding hitungDenda(), perluPersetujuanPembina(), dan getJenisBarang(); satu "
        "perulangan memanggil periksa() pada List<AturanPeminjaman>",
        "Penambahan jenis barang atau aturan baru tidak mengubah kode pemanggil"],
       ["Abstraction", "Minimal satu abstract class atau interface",
        "Abstract class Pengguna dan Barang; interface AturanPeminjaman",
        "Objek Barang generik tidak boleh berdiri sendiri karena tarif dendanya bergantung "
        "pada jenis barang"],
       ["Exception Handling", "try-catch yang sesuai",
        "StokTidakTersediaException, AturanDilanggarException, TanggalTidakValidException, "
        "DataTidakDitemukanException, AksesDitolakException, FormatBerkasException",
        "Kesalahan input dan kesalahan berkas ditangani tanpa menghentikan aplikasi"],
       ["Collection", "ArrayList atau Collection lain",
        "ArrayList<Barang>, ArrayList<Peminjaman>, ArrayList<Pengguna>, "
        "ArrayList<AturanPeminjaman>, dan Map<String, Integer> untuk rekap",
        "Data bersifat dinamis, perlu diiterasi, dan perlu diurutkan"],
       ["File Handling", "Simpan dan baca data",
        "Berkas teks berpemisah pada folder data/, dimuat saat aplikasi mulai dan disimpan "
        "setelah setiap perubahan",
        "Data tetap tersedia setelah aplikasi ditutup"]],
      widths=[2.8, 3.4, 5.6, 4.2], font=9.5, cap="Tabel 2.10 Pemetaan Konsep OOP")
p("Pola perancangan yang dipakai sebagai pendukung struktur program: Strategy pada antarmuka "
  "AturanPeminjaman (algoritma pemeriksaan dapat diganti atau ditambah), Facade pada "
  "LayananPeminjaman (menyederhanakan akses antarmuka ke repositori dan layanan lain), dan "
  "Repository pada kelas Repositori untuk memisahkan penyimpanan koleksi dari logika bisnis.")

h2("2.10 Rancangan Penyimpanan Data")
p("Data disimpan pada folder data/ dalam bentuk berkas teks dengan pemisah karakter pipa (|), "
  "satu baris untuk satu data.")
code(["data/pengguna.txt   -> id|nama|username|password|peran|nim_atau_nip",
      "data/kategori.txt   -> kodeKategori|namaKategori",
      "data/barang.txt     -> kode|nama|kodeKategori|stok|harga|jenis|atributKhusus",
      "data/peminjaman.txt -> id|nim|tanggalMulai|tanggalSelesai|keperluan|penanggungJawab|status",
      "data/detail.txt     -> idPeminjaman|kodeBarang|jumlah|kondisiAwal",
      "data/pengembalian.txt -> idPeminjaman|tanggalKembali|catatanKondisi|totalDenda|statusBayar"])
p("Saat memuat data, program membaca kolom jenis pada berkas barang lebih dahulu untuk menentukan "
  "kelas yang akan dibuat (BarangElektronik, AlatLaboratorium, BarangFurnitur, atau Ruangan), "
  "kemudian mengisi atribut khusus sesuai jenis tersebut. Baris yang formatnya tidak sesuai "
  "dilewati dan dicatat sebagai kesalahan berkas, sehingga satu baris rusak tidak menggagalkan "
  "seluruh proses pemuatan.")

h2("2.11 Rancangan Antarmuka")
h3("2.11.1 Menu Mahasiswa")
items(["Login atau registrasi akun", "Cari dan lihat ketersediaan barang",
       "Ajukan peminjaman", "Batalkan pengajuan", "Lihat status pengajuan",
       "Lihat riwayat peminjaman dan denda", "Lihat detail denda yang belum dibayar",
       "Ubah profil", "Keluar"], numbered=True)
h3("2.11.2 Menu Petugas Sarana dan Prasarana")
items(["Login", "Kelola data barang", "Kelola data kategori", "Kelola data mahasiswa",
       "Verifikasi pengajuan", "Catat serah terima barang", "Catat pengembalian dan kondisi barang",
       "Pantau jatuh tempo", "Rekap dan laporan", "Keluar"], numbered=True)
h3("2.11.3 Menu Dosen Pembina")
items(["Login", "Daftar pengajuan yang menunggu persetujuan pembina",
       "Setujui atau tolak pengajuan", "Pantau peminjaman aktif", "Keluar"], numbered=True)

h2("2.12 Rencana Pengujian")
table(["Kode", "Skenario Uji", "Masukan", "Hasil yang Diharapkan"],
      [["TC-01", "Jumlah barang tidak valid",
        "Jumlah diisi 0 atau bilangan negatif",
        "Muncul pesan validasi, pengajuan tidak tersimpan"],
       ["TC-02", "Tanggal tidak logis",
        "Tanggal selesai lebih awal daripada tanggal mulai",
        "Pengajuan ditolak dengan pesan kesalahan tanggal"],
       ["TC-03", "Stok tidak mencukupi", "Seluruh unit sedang dipinjam pada tanggal tersebut",
        "Muncul StokTidakTersediaException beserta jumlah yang tersedia"],
       ["TC-04", "Bentrok jadwal",
        "Dua pengajuan pada stok terbatas dengan tanggal yang bertumpang tindih",
        "Pengajuan kedua ditolak karena stok pada rentang tersebut tidak cukup"],
       ["TC-05", "Batas peminjaman aktif", "Mahasiswa sudah memiliki dua peminjaman aktif",
        "Aturan MaksimalAktif menolak pengajuan dengan pesan yang jelas"],
       ["TC-06", "Tunggakan denda", "Mahasiswa memiliki denda belum dibayar",
        "Pengajuan ditolak dan denda yang belum dibayar ditampilkan"],
       ["TC-07", "Pengajuan mendadak", "Diajukan pada hari yang sama dengan tanggal mulai",
        "Ditolak karena melanggar batas waktu pengajuan"],
       ["TC-08", "Durasi melebihi batas", "Durasi peminjaman 10 hari",
        "Ditolak dengan pesan durasi maksimal tujuh hari"],
       ["TC-09", "Penolakan oleh petugas", "Petugas menolak dengan catatan alasan",
        "Status berubah menjadi DITOLAK dan alasan tampil pada riwayat mahasiswa"],
       ["TC-10", "Serah terima barang", "Petugas mencatat serah terima",
        "Status berubah menjadi DIPINJAM dan stok pada rentang tanggal berkurang"],
       ["TC-11", "Pengembalian tepat waktu", "Dikembalikan sebelum tanggal selesai",
        "Total denda Rp0 dan status berubah menjadi DIKEMBALIKAN"],
       ["TC-12", "Denda keterlambatan",
        "BarangElektronik dikembalikan tiga hari setelah tanggal selesai",
        "Denda Rp30.000 dan rincian denda ditampilkan"],
       ["TC-13", "Denda kondisi barang",
        "Dikembalikan dengan kondisi rusak berat",
        "Denda keterlambatan ditambah 40% harga satuan barang"],
       ["TC-14", "Hak akses", "Mahasiswa membuka menu kelola data barang",
        "Akses ditolak dengan pesan bahwa menu hanya untuk petugas"],
       ["TC-15", "Simpan dan muat data",
        "Menambah data, menutup aplikasi, lalu menjalankan ulang",
        "Seluruh data tampil lengkap termasuk jenis barang dan atribut khususnya"],
       ["TC-16", "Berkas data rusak", "Satu baris pada berkas data diubah formatnya",
        "Muncul pesan kesalahan berkas, baris yang rusak dilewati, aplikasi tetap berjalan"]],
      widths=[1.4, 3.6, 5.0, 6.0], font=9.5, cap="Tabel 2.11 Rencana Pengujian")

# ================================================================ PROGRESS
h1("PROGRESS PELAKSANAAN MINGGU 1")

h2("3.1 Ringkasan Capaian Minggu 1")
p("Minggu 1 pada instruksi Final Project menargetkan tersedianya dokumen analisis kebutuhan dan "
  "desain sistem, yang meliputi penentuan judul dan studi kasus, identifikasi permasalahan, "
  "penyusunan kebutuhan fungsional, penentuan aktor dan proses bisnis, pembuatan use case diagram, "
  "pembuatan class diagram, serta pembagian tugas anggota kelompok. Tabel 3.1 memuat status "
  "setiap aktivitas tersebut.")
table(["No", "Aktivitas Minggu 1", "Status", "Keluaran / Bukti"],
      [["1", "Menentukan judul dan studi kasus", "Selesai",
        "Judul SIPINJAM dan studi kasus peminjaman inventaris kampus oleh mahasiswa"],
       ["2", "Mengidentifikasi permasalahan", "Selesai",
        "Enam permasalahan pada subbab 1.1 (ketersediaan tidak diketahui, bentrok jadwal, "
        "keterlambatan, kondisi barang tidak tercatat, riwayat tidak terpusat, persetujuan lambat)"],
       ["3", "Menentukan kebutuhan fungsional", "Selesai",
        "20 kebutuhan fungsional (FR-01 s.d. FR-20) pada Tabel 2.3 dan enam kebutuhan "
        "non-fungsional pada subbab 2.4"],
       ["4", "Menentukan aktor dan proses bisnis", "Selesai",
        "Tiga aktor pada Tabel 2.2; delapan langkah proses bisnis (2.5.1); enam status "
        "peminjaman (Tabel 2.4); lima aturan kelayakan (Tabel 2.5); ketentuan denda (Tabel 2.6)"],
       ["5", "Membuat UML Use Case Diagram", "Selesai",
        "16 use case pada Tabel 2.7 dan Gambar 2.1 (berkas diagrams/usecase_sipinjam.png)"],
       ["6", "Membuat UML Class Diagram", "Selesai",
        "29 kelas pada Tabel 2.9 dan tiga gambar class diagram (Gambar 2.2, 2.3, 2.4)"],
       ["7", "Menentukan pembagian tugas anggota", "Selesai",
        "Tabel 3.6 (nama anggota masih perlu dilengkapi)"]],
      widths=[1.2, 4.4, 2.2, 7.2], font=9.5, cap="Tabel 3.1 Status Aktivitas Minggu 1")
p("Target Minggu 1 berupa dokumen analisis kebutuhan dan desain sistem telah tercapai. Seluruh "
  "aktivitas pada instruksi telah dikerjakan, dengan dua catatan yang diuraikan pada subbab 3.3: "
  "data pendukung latar belakang belum diisi dan persetujuan dosen pengampu belum diperoleh.")

h2("3.2 Artefak yang Dihasilkan")
table(["No", "Artefak", "Berkas", "Keterangan"],
      [["1", "Dokumen analisis dan desain", "LAPORAN_SIPINJAM_BAB1_BAB2.docx",
        "BAB I, BAB II, dan progress Minggu 1"],
       ["2", "Use case diagram", "diagrams/usecase_sipinjam.png",
        "16 use case, 3 aktor, relasi include dan extend"],
       ["3", "Class diagram paket model", "diagrams/class_model_sipinjam.png",
        "13 kelas: pengguna, inventaris, dan transaksi"],
       ["4", "Class diagram paket aturan dan layanan", "diagrams/class_aturan_sipinjam.png",
        "10 kelas: antarmuka aturan, lima aturan, validator, dan tiga layanan"],
       ["5", "Class diagram paket penyimpanan dan antarmuka",
        "diagrams/class_penyimpanan_sipinjam.png",
        "9 kelas: repositori, penyimpanan, rekap, dan kelas utama"],
       ["6", "Berkas sumber diagram", "diagrams/*.dot dan build_diagrams.py",
        "Dapat dijalankan ulang bila rancangan berubah"]],
      widths=[1.2, 5.0, 5.0, 4.8], font=9.5, cap="Tabel 3.2 Artefak Minggu 1")
p("Seluruh gambar diagram dihasilkan dari berkas sumber, bukan digambar manual, sehingga apabila "
  "ada perubahan rancangan kelas, gambar dapat diperbarui dengan menjalankan kembali skrip "
  "pembangkit diagram.")

h2("3.3 Pekerjaan yang Belum Selesai")
table(["No", "Pekerjaan", "Alasan Belum Selesai", "Rencana Penyelesaian"],
      [["1", "Data pendukung latar belakang (jumlah transaksi dan kasus keterlambatan)",
        "Data berada pada buku catatan bagian sarana dan prasarana dan belum diperoleh",
        "Meminta izin observasi pada pekan ke-2, atau menggantinya dengan hasil kuesioner "
        "mahasiswa satu angkatan"],
       ["2", "Persetujuan judul dan studi kasus oleh dosen pengampu",
        "Wajib menurut poin 3 instruksi, jadwal konsultasi belum tersedia",
        "Mengajukan judul pada konsultasi bimbingan pertama sebelum implementasi dimulai"],
       ["3", "Nama anggota dan pembagian tugas yang definitif",
        "Nama anggota belum diisi pada dokumen",
        "Melengkapi Tabel 3.6 dan halaman judul"],
       ["4", "Data awal inventaris untuk pengujian",
        "Data aset belum diterima dari petugas",
        "Menyiapkan data contoh minimal 20 barang dengan empat kategori"]],
      widths=[1.2, 4.8, 5.0, 5.0], font=9.5, cap="Tabel 3.3 Pekerjaan yang Belum Selesai")

h2("3.4 Kendala dan Solusi")
table(["No", "Kendala", "Dampak", "Solusi"],
      [["1", "Data peminjaman manual tidak terdokumentasi rapi",
        "Latar belakang belum dapat dilengkapi angka",
        "Melakukan observasi langsung dan mencatat periode pengamatan secara eksplisit"],
       ["2", "Aturan denda belum memiliki dasar resmi",
        "Tarif denda pada Tabel 2.6 masih usulan",
        "Mengajukan tarif sebagai usulan pada dosen pengampu dan menuliskannya pada batasan "
        "masalah"],
       ["3", "Kemampuan anggota berbeda-beda pada Collection dan file handling",
        "Risiko keterlambatan pada Minggu 2",
        "Membagi tugas berdasarkan lapisan (model, layanan, penyimpanan) dan melakukan "
        "pemeriksaan kode bersama setiap akhir pekan"],
       ["4", "Antarmuka console dinilai kurang menarik saat demonstrasi",
        "Nilai presentasi berisiko turun",
        "Menata menu dan tampilan tabel pada console secara rapi; antarmuka Swing dapat "
        "ditambahkan tanpa mengubah rancangan kelas"]],
      widths=[1.2, 4.6, 4.0, 6.2], font=9.5, cap="Tabel 3.4 Kendala dan Solusi Minggu 1")

h2("3.5 Rencana Minggu 2")
p("Minggu 2 pada instruksi berfokus pada implementasi konsep OOP. Rencana kerja disusun agar "
  "seluruh persyaratan teknis selesai sebelum masuk ke pengembangan fitur pada Minggu 3.")
table(["No", "Aktivitas Minggu 2", "Keluaran"],
      [["1", "Membuat struktur project Java (paket model, layanan, repositori, penyimpanan, "
             "antarmuka)", "Struktur folder dan berkas kelas kosong"],
       ["2", "Membuat kelas dan object sesuai Tabel 2.9", "29 kelas dan 3 enum terkompilasi"],
       ["3", "Menerapkan constructor berparameter dan encapsulation",
        "Atribut private, getter/setter bervalidasi"],
       ["4", "Menerapkan inheritance", "Pengguna dan Barang beserta seluruh subkelasnya"],
       ["5", "Menerapkan polymorphism", "Overriding hitungDenda() dan perulangan aturan pada "
                                        "ValidatorPeminjaman"],
       ["6", "Menerapkan abstraction", "Abstract class Pengguna dan Barang; interface "
                                       "AturanPeminjaman"],
       ["7", "Mengembangkan logika utama", "Pengajuan, validasi kelayakan, dan pemeriksaan "
                                           "ketersediaan berjalan pada console"],
       ["8", "Menerapkan exception handling dasar", "Enam kelas exception dan penanganannya"]],
      widths=[1.2, 7.6, 6.2], font=9.5, cap="Tabel 3.5 Rencana Kerja Minggu 2")

h2("3.6 Pembagian Tugas Anggota Kelompok")
table(["No", "Nama Anggota", "Fokus Utama", "Kelas / Berkas yang Dikerjakan"],
      [["1", "…………………………………",
        "Model dan relasi kelas",
        "Pengguna, Mahasiswa, PetugasSarpras, DosenPembina, KategoriBarang, Barang, "
        "BarangElektronik, AlatLaboratorium, BarangFurnitur, Ruangan, DetailPeminjaman, "
        "Peminjaman, Pengembalian"],
       ["2", "…………………………………",
        "Aturan, layanan, dan penyimpanan",
        "AturanPeminjaman beserta lima penerapannya, ValidatorPeminjaman, "
        "LayananKetersediaan, KalkulatorDenda, LayananPeminjaman, Repositori, PenyimpananData"],
       ["3", "…………………………………",
        "Antarmuka, rekap, dokumentasi, dan pengujian",
        "AplikasiSipinjam, RekapPeminjaman, menu console, 16 skenario pengujian, laporan, "
        "dan video demonstrasi"]],
      widths=[1.2, 3.6, 4.2, 6.0], font=9.5, cap="Tabel 3.6 Pembagian Tugas Anggota")
p("Seluruh anggota tetap wajib memahami alur sistem secara keseluruhan karena nilai pemahaman "
  "individu memiliki bobot 10% dan dosen dapat menunjuk anggota secara acak untuk menjelaskan "
  "bagian kode tertentu.")

h2("3.7 Checklist Serah Terima Minggu 1")
table(["No", "Butir Pemeriksaan", "Status"],
      [["1", "Judul dan studi kasus ditetapkan", "Selesai"],
       ["2", "Permasalahan, kebutuhan fungsional, aktor, dan proses bisnis terdokumentasi",
        "Selesai"],
       ["3", "Use case diagram tersedia dalam bentuk gambar", "Selesai"],
       ["4", "Class diagram tersedia dalam bentuk gambar", "Selesai"],
       ["5", "Pembagian tugas anggota tercantum", "Selesai (nama perlu dilengkapi)"],
       ["6", "Data pendukung latar belakang diisi", "Belum"],
       ["7", "Persetujuan dosen pengampu atas judul", "Belum"],
       ["8", "Nama anggota, NIM, kelas, dan dosen pengampu diisi pada halaman judul", "Belum"]],
      widths=[1.2, 8.6, 5.2], font=9.5, cap="Tabel 3.7 Checklist Minggu 1")

doc.save(OUT)
print("OK ->", OUT)
print("ukuran:", os.path.getsize(OUT), "byte")