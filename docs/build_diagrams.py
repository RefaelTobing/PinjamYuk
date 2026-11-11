"""Diagram SIPINJAM: use case (matplotlib, routing orthogonal + verifikasi) dan class diagram."""
import os
import math
import subprocess
import html

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Ellipse, Rectangle

OUT = os.path.dirname(os.path.abspath(__file__))
DIAG = os.path.join(OUT, "diagrams")
os.makedirs(DIAG, exist_ok=True)

# ============================================================ USE CASE
W, H = 2.85, 1.15
TRUNK_X = 16.25      # jalur vertikal di dalam boundary, di luar elips (elips berakhir 15.925)
UC = {
    "UC01": ("Login", 6.3, 12.4),
    "UC02": ("Registrasi akun\nmahasiswa", 6.3, 10.8),
    "UC07": ("Ajukan\npeminjaman", 6.3, 9.2),
    "UC08": ("Batalkan\npengajuan", 6.3, 7.6),
    "UC13": ("Lihat riwayat\ndan denda", 6.3, 6.0),
    "UC06": ("Cek ketersediaan\ndan jadwal", 6.3, 4.4),
    "UC16": ("Hitung denda\notomatis", 10.4, 6.0),
    "UC10": ("Persetujuan\npembina", 10.4, 2.2),
    "UC03": ("Kelola data\ninventaris", 14.5, 11.2),
    "UC04": ("Kelola kategori\nbarang", 14.5, 9.75),
    "UC05": ("Kelola data\nmahasiswa", 14.5, 8.3),
    "UC09": ("Verifikasi dan\nsetujui", 14.5, 6.85),
    "UC11": ("Catat serah\nterima", 14.5, 5.4),
    "UC12": ("Catat pengembalian\ndan kondisi", 14.5, 3.95),
    "UC15": ("Rekap dan\nlaporan", 14.5, 2.5),
    "UC14": ("Pantau jatuh\ntempo", 14.5, 1.05),
}
ACTORS = {"Mahasiswa": (1.7, 9.0), "PetugasSarpras": (18.7, 12.0), "DosenPembina": (1.7, 2.0)}
MAHASISWA = ("UC01", "UC02", "UC07", "UC08", "UC13", "UC06")
PETUGAS = ("UC03", "UC04", "UC05", "UC09", "UC11", "UC12", "UC15", "UC14")
DOSEN = ("UC10", "UC14")
deps = [("UC07", "UC06", "include", 2.2), ("UC13", "UC16", "include", 0.0),
        ("UC12", "UC16", "include", 0.0), ("UC08", "UC07", "extend", 0.0)]


def edge_point(cx, cy, tx, ty):
    dx, dy = tx - cx, ty - cy
    t = 1.0 / ((dx / (W / 2)) ** 2 + (dy / (H / 2)) ** 2) ** 0.5
    return cx + dx * t, cy + dy * t


def build_routes():
    """Rute asosiasi aktor->use case sebagai polyline, agar tidak menembus elips lain."""
    routes = []
    # Mahasiswa: kipas lurus dari kiri ke tepi kiri elips
    ax_, ay_ = ACTORS["Mahasiswa"]
    for k in MAHASISWA:
        routes.append(("Mahasiswa", k, [(ax_, ay_), edge_point(UC[k][1], UC[k][2], ax_, ay_)]))
    # Petugas: trunk vertikal + stub horizontal
    px, py = ACTORS["PetugasSarpras"]
    ys = [UC[k][2] for k in PETUGAS] + [py]
    routes.append(("PetugasSarpras", "trunk", [(px, py), (TRUNK_X, py)]))
    trunk = [(TRUNK_X, min(ys)), (TRUNK_X, max(ys))]
    routes.append(("PetugasSarpras", "trunk-v", trunk))
    for k in PETUGAS:
        cx, cy = UC[k][1], UC[k][2]
        routes.append(("PetugasSarpras", k, [(TRUNK_X, cy), edge_point(cx, cy, TRUNK_X, cy)]))
    # Petugas -> Login (lewat trunk naik ke y=12.4, lalu horizontal di atas semua elips)
    cy = UC["UC01"][2]
    routes.append(("PetugasSarpras", "UC01",
                   [(TRUNK_X, cy), (TRUNK_X, py), (px, py)]))
    routes.append(("PetugasSarpras", "UC01-s", [(TRUNK_X, cy), edge_point(UC["UC01"][1], cy, TRUNK_X, cy)]))
    # Dosen: lurus untuk UC10/UC14; ke Login lewat trunk kiri (x=4.55, di luar elips kolom A)
    dx_, dy_ = ACTORS["DosenPembina"]
    for k in DOSEN:
        routes.append(("DosenPembina", k, [(dx_, dy_), edge_point(UC[k][1], UC[k][2], dx_, dy_)]))
    lt = 4.55
    cy = UC["UC01"][2]
    routes.append(("DosenPembina", "UC01",
                   [(dx_, dy_), (lt, dy_), (lt, cy), edge_point(UC["UC01"][1], cy, lt, cy)]))
    return routes


def verify(routes):
    """Pastikan tidak ada segmen yang menembus elips lain atau badan aktor."""
    def sample(p0, p1, n=250):
        return [(p0[0] + (p1[0] - p0[0]) * i / n, p0[1] + (p1[1] - p0[1]) * i / n)
                for i in range(n + 1)]

    def inside(p, cx, cy, s=0.98):
        return ((p[0] - cx) / (W / 2 * s)) ** 2 + ((p[1] - cy) / (H / 2 * s)) ** 2 < 1

    errs = []
    for aktor, kode, pts in routes:
        target = kode.split("-")[0]
        for p0, p1 in zip(pts, pts[1:]):
            for k, (nm, cx, cy) in UC.items():
                if k == target:
                    continue
                if any(inside(p, cx, cy) for p in sample(p0, p1)):
                    errs.append(f"{aktor}->{kode} menembus {k} ({nm.splitlines()[0]})")
            for a, (x, y) in ACTORS.items():
                if a == aktor:
                    continue
                if any(math.hypot(p[0] - x, p[1] - y) < 0.80 for p in sample(p0, p1)[1:-1]):
                    errs.append(f"{aktor}->{kode} melewati aktor {a}")
    # dependensi (busur/lurus)
    for src, dst, jenis, rad in deps:
        p1 = edge_point(UC[src][1], UC[src][2], UC[dst][1], UC[dst][2])
        p2 = edge_point(UC[dst][1], UC[dst][2], UC[src][1], UC[src][2])
        if rad:
            (x0, y0), (x1, y1) = p1, p2
            mx, my = (x0 + x1) / 2, (y0 + y1) / 2
            cx, cy = mx + rad * (y1 - y0) / 2, my - rad * (x1 - x0) / 2
            pts = [((1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1,
                    (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1)
                   for t in [i / 250 for i in range(251)]]
            segs = list(zip(pts, pts[1:]))
        else:
            segs = [(p1, p2)]
        for s0, s1 in segs:
            for k, (nm, cx, cy) in UC.items():
                if k in (src, dst):
                    continue
                if any(inside(p, cx, cy) for p in sample(s0, s1)):
                    errs.append(f"dep {src}->{dst} menembus {k}")
        for a, (x, y) in ACTORS.items():
            if any(math.hypot(p[0] - x, p[1] - y) < 0.80 for p in pts[1:-1]):
                errs.append(f"dep {src}->{dst} melewati aktor {a}")
    return errs


def draw_actor(ax, name, x, y):
    c = "#8a5a1c"
    ax.add_patch(plt.Circle((x, y + 0.62), 0.22, fill=False, lw=1.6, color=c))
    ax.plot([x, x], [y + 0.40, y - 0.18], lw=1.6, color=c)
    ax.plot([x - 0.42, x + 0.42], [y + 0.20, y + 0.20], lw=1.6, color=c)
    ax.plot([x, x - 0.34], [y - 0.18, y - 0.70], lw=1.6, color=c)
    ax.plot([x, x + 0.34], [y - 0.18, y - 0.70], lw=1.6, color=c)
    ax.text(x, y - 0.95, name, ha="center", va="top", fontsize=12.5, fontweight="bold")


def build_usecase():
    routes = build_routes()
    errs = verify(routes)
    if errs:
        print("PERINGATAN geometri use case:")
        for e in sorted(set(errs)):
            print("   -", e)

    fig, ax = plt.subplots(figsize=(19, 14), dpi=120)
    ax.set_xlim(0, 21)
    ax.set_ylim(0, 14.2)
    ax.axis("off")
    ax.add_patch(Rectangle((3.9, 0.4), 12.7, 13.0, facecolor="#fbfcfe",
                           edgecolor="#7d8fa5", ls=(0, (6, 4)), lw=1.4))
    ax.text(10.25, 13.15, "Sistem SIPINJAM", ha="center", va="center",
            fontsize=15, fontweight="bold", color="#2f4a63")
    for aktor, (x, y) in ACTORS.items():
        draw_actor(ax, aktor, x, y)
    for pts in [r[2] for r in routes]:
        ax.plot([p[0] for p in pts], [p[1] for p in pts], lw=1.1, color="#3d3d3d", zorder=1)
    for kode, (label, x, y) in UC.items():
        ax.add_patch(Ellipse((x, y), W, H, facecolor="#e8f1fb", edgecolor="#3f6d9e", lw=1.4))
        ax.text(x, y + 0.13, label, ha="center", va="center", fontsize=10.2, color="#16324a",
                linespacing=1.25)
        ax.text(x, y - 0.38, kode, ha="center", va="center", fontsize=8.5, color="#6b7b8c")
    for src, dst, jenis, rad in deps:
        p1 = edge_point(UC[src][1], UC[src][2], UC[dst][1], UC[dst][2])
        p2 = edge_point(UC[dst][1], UC[dst][2], UC[src][1], UC[src][2])
        ax.annotate("", xy=p2, xytext=p1,
                    arrowprops=dict(arrowstyle="-|>", lw=1.3, color="#7a4b9b", ls="dashed",
                                    connectionstyle=f"arc3,rad={rad}", mutation_scale=15), zorder=2)
        mx = (p1[0] + p2[0]) / 2 + rad * (p2[1] - p1[1]) * 0.52
        my = (p1[1] + p2[1]) / 2 - rad * (p2[0] - p1[0]) * 0.52
        ax.text(mx, my, f"\u00ab{jenis}\u00bb", ha="center", va="center", fontsize=9,
                color="#6d3f8f", style="italic",
                bbox=dict(boxstyle="round,pad=0.18", fc="white", ec="none", alpha=0.92))
    path = os.path.join(DIAG, "usecase_sipinjam.png")
    fig.savefig(path, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    return path, errs


# ============================================================ CLASS DIAGRAM
ABS, IFACE, SVC, REPO, UI, LIGHT, GREY = ("#c9dcf2", "#e0d3ef", "#d7ecdd", "#f6e6c8",
                                          "#f7d9d9", "#e8f1fb", "#f2f2f2")


def node(name, stereo, fields, methods, color):
    rows = [f'<tr><td bgcolor="{color}" align="center"><b>{html.escape(name)}</b>'
            + (f'<br/><i>{html.escape(stereo)}</i>' if stereo else "") + "</td></tr>"]
    if fields:
        rows.append('<tr><td align="left">' + "<br/>".join(html.escape(x) for x in fields) + "</td></tr>")
    if methods:
        rows.append('<tr><td align="left">' + "<br/>".join(html.escape(x) for x in methods) + "</td></tr>")
    return (f'  {name} [shape=plaintext, label=<<table border="0" cellborder="1" cellspacing="0" '
            f'cellpadding="5">' + "".join(rows) + "</table>>];")


MODEL = [
    ("Pengguna", "\u00ababstract\u00bb", ["- id, username"], ["+ getPeran(): String",
                                                              "+ tampilkanProfil()"], ABS),
    ("Mahasiswa", "", ["- nim, prodi"], ["+ getPeran(): String", "+ peminjamanAktif(): int"], LIGHT),
    ("PetugasSarpras", "", ["- nip, unit"], ["+ getPeran(): String"], LIGHT),
    ("DosenPembina", "", ["- nidn, jabatan"], ["+ getPeran(): String"], LIGHT),
    ("KategoriBarang", "", ["- kode, nama"], ["+ getNama(): String"], GREY),
    ("Barang", "\u00ababstract\u00bb", ["- kode, nama, stok"], ["+ getJenisBarang(): String",
                                                               "+ hitungDenda(): double",
                                                               "+ perluPersetujuan()"], ABS),
    ("BarangElektronik", "", ["- masaGaransi"], ["+ hitungDenda(): double"], LIGHT),
    ("AlatLaboratorium", "", ["- laboratorium"], ["+ hitungDenda(): double"], LIGHT),
    ("BarangFurnitur", "", ["- bahan"], ["+ hitungDenda(): double"], LIGHT),
    ("Ruangan", "", ["- kapasitas"], ["+ hitungDenda(): double"], LIGHT),
    ("DetailPeminjaman", "", ["- jumlah, kondisiAwal"], ["+ subtotalDenda(): double"], GREY),
    ("Peminjaman", "", ["- id, tanggalMulai", "- tanggalSelesai, status"],
     ["+ ajukan(), setujui()", "+ serahkanBarang()", "+ isTerlambat(): boolean"], GREY),
    ("Pengembalian", "", ["- tanggalKembali, denda"], ["+ hitungDenda(): double"], GREY),
]
SERVICE = [
    ("AturanPeminjaman", "\u00abinterface\u00bb", [], ["+ getNamaAturan(): String",
                                                      "+ periksa(m, p): void"], IFACE),
    ("AturanStatusMahasiswa", "", [], ["+ periksa(m, p): void"], IFACE),
    ("AturanMaksimalAktif", "", [], ["+ periksa(m, p): void"], IFACE),
    ("AturanTunggakanDenda", "", [], ["+ periksa(m, p): void"], IFACE),
    ("AturanBatasWaktu", "", [], ["+ periksa(m, p): void"], IFACE),
    ("AturanDurasiMaksimal", "", [], ["+ periksa(m, p): void"], IFACE),
    ("ValidatorPeminjaman", "", ["- daftarAturan"], ["+ validasi(m, p): void"], SVC),
    ("LayananKetersediaan", "", [], ["+ cekKetersediaan(b, jml,", "  mulai, selesai): boolean"], SVC),
    ("KalkulatorDenda", "", [], ["+ hitung(p): double", "+ rincian(p): String"], SVC),
    ("LayananPeminjaman", "", [],
     ["+ ajukanPeminjaman(...)", "+ verifikasi(id, setuju)", "+ serahTerima(id)",
      "+ catatPengembalian(...)", "+ daftarJatuhTempo()"], SVC),
    ("RepositoriBarang", "", ["- daftarBarang"], ["+ tambah(b), cari(kode)"], REPO),
    ("RepositoriPeminjaman", "", ["- daftarPeminjaman"], ["+ tambah(p), cariAktif()"], REPO),
    ("RepositoriPengguna", "", ["- daftarPengguna"], ["+ login(u, s): Pengguna"], REPO),
    ("PenyimpananData", "", ["- folderData"], ["+ simpanSemua(), muatSemua()"], REPO),
    ("RekapPeminjaman", "", [], ["+ jumlahPerKategori()", "+ tingkatKeterlambatan()"], UI),
    ("AplikasiSipinjam", "", [], ["+ main(args)", "+ tampilkanMenu(peran)"], UI),
]
LEGEND = ('  Legenda [shape=plaintext, label=<<table border="1" cellborder="0" cellspacing="0" '
          'cellpadding="5" bgcolor="#ffffff">'
          '<tr><td align="left"><b>Legenda</b></td></tr>'
          '<tr><td align="left">&#9651; garis penuh = generalisasi</td></tr>'
          '<tr><td align="left">&#9651; garis putus = realisasi interface</td></tr>'
          '<tr><td align="left">&#9671; belah ketupat = agregasi</td></tr>'
          '<tr><td align="left">garis tanpa panah = asosiasi</td></tr>'
          "</table>>];")


def build_class(name, specs, clusters, gen=(), assoc=(), agg=(), refs=(), legend=True):
    out = ["digraph G {",
           '  graph [fontname="DejaVu Sans", rankdir=LR, nodesep=0.25, ranksep=0.45,',
           '         splines=true, pad=0.2, bgcolor="white"];',
           '  node  [fontname="DejaVu Sans", fontsize=13];',
           '  edge  [fontname="DejaVu Sans", fontsize=12, color="#3a3a3a"];']
    defs = {s[0]: node(*s) for s in specs}
    for rname, _c in refs:
        defs[rname] = (f'  {rname} [shape=box, style="dashed", fontsize=12, color="#8a8a8a", '
                       f'label="{rname}\\n(di gambar lain)"];')
    for i, (label, members) in enumerate(clusters.items()):
        out += [f"  subgraph cluster_{i} {{",
                f'    label=<<B>{label}</B>>; fontsize=14; fontcolor="#3d3d3d";',
                '    style="rounded,dashed"; color="#9a9a9a"; margin=8;']
        out += ["    " + defs[m] for m in members]
        out.append("  }")
    if legend:
        out.append(LEGEND)
    for a, b, style in gen:
        out.append(f'  {a} -> {b} [arrowhead=onormal, style={style}];')
    for a, b, la, lb in assoc:
        lab = f', headlabel=" {lb}", taillabel="{la} "' if (la or lb) else ""
        out.append(f'  {a} -> {b} [arrowhead=none, style=solid{lab}];')
    for a, b, la, lb in agg:
        out.append(f'  {a} -> {b} [arrowhead=odiamond, style=solid, '
                   f'headlabel=" {lb}", taillabel="{la} "];')
    out.append("}")
    dot = os.path.join(DIAG, name + ".dot")
    open(dot, "w").write("\n".join(out))
    png = os.path.join(DIAG, name + ".png")
    r = subprocess.run(["dot", "-Tpng", "-Gdpi=200", dot, "-o", png], capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError(r.stderr)
    return png


def build_model():
    gen = [("Pengguna", x, "solid") for x in ("Mahasiswa", "PetugasSarpras", "DosenPembina")]
    gen += [("Barang", x, "solid") for x in ("BarangElektronik", "AlatLaboratorium",
                                              "BarangFurnitur", "Ruangan")]
    assoc = [("Barang", "KategoriBarang", "1", "1"),
             ("DetailPeminjaman", "Barang", "0..*", "1"),
             ("Peminjaman", "Mahasiswa", "0..*", "1"),
             ("Peminjaman", "Pengembalian", "1", "0..1")]
    agg = [("Peminjaman", "DetailPeminjaman", "1", "1..*")]
    cl = {"Paket Pengguna": ["Pengguna", "Mahasiswa", "PetugasSarpras", "DosenPembina"],
          "Paket Inventaris": ["KategoriBarang", "Barang", "BarangElektronik",
                                "AlatLaboratorium", "BarangFurnitur", "Ruangan"],
          "Paket Transaksi": ["DetailPeminjaman", "Peminjaman", "Pengembalian"]}
    return build_class("class_model_sipinjam", MODEL, cl, gen, assoc, agg)


def _svc(names, extra=()):
    return [s for s in SERVICE if s[0] in names] + list(extra)


def build_aturan():
    names = ["AturanPeminjaman", "AturanStatusMahasiswa", "AturanMaksimalAktif",
             "AturanTunggakanDenda", "AturanBatasWaktu", "AturanDurasiMaksimal",
             "ValidatorPeminjaman", "LayananKetersediaan", "KalkulatorDenda", "LayananPeminjaman"]
    gen = [("AturanPeminjaman", x, "dashed") for x in
           ("AturanStatusMahasiswa", "AturanMaksimalAktif", "AturanTunggakanDenda",
            "AturanBatasWaktu", "AturanDurasiMaksimal")]
    assoc = [("ValidatorPeminjaman", "Peminjaman", "", ""),
             ("KalkulatorDenda", "Peminjaman", "", ""),
             ("LayananPeminjaman", "ValidatorPeminjaman", "", ""),
             ("LayananPeminjaman", "LayananKetersediaan", "", ""),
             ("LayananPeminjaman", "KalkulatorDenda", "", "")]
    agg = [("ValidatorPeminjaman", "AturanPeminjaman", "1", "1..*")]
    cl = {"Paket Aturan Validasi": ["AturanPeminjaman", "AturanStatusMahasiswa", "AturanMaksimalAktif",
                                     "AturanTunggakanDenda", "AturanBatasWaktu", "AturanDurasiMaksimal",
                                     "ValidatorPeminjaman"],
          "Paket Layanan": ["LayananKetersediaan", "KalkulatorDenda", "LayananPeminjaman"],
          "Kelas rujukan": ["Peminjaman"]}
    return build_class("class_aturan_sipinjam", _svc(names), cl, gen, assoc, agg,
                       [("Peminjaman", "#f7f7f7")])


def build_penyimpanan():
    names = ["RepositoriBarang", "RepositoriPeminjaman", "RepositoriPengguna", "PenyimpananData",
             "RekapPeminjaman", "AplikasiSipinjam"]
    extra = [("LayananPeminjaman", "", [], ["+ ajukanPeminjaman(...)", "+ verifikasi(...)",
                                            "+ daftarJatuhTempo()"], SVC)]
    assoc = [("LayananPeminjaman", "RepositoriBarang", "", ""),
             ("LayananPeminjaman", "RepositoriPeminjaman", "", ""),
             ("LayananPeminjaman", "PenyimpananData", "", ""),
             ("RekapPeminjaman", "RepositoriPeminjaman", "", ""),
             ("AplikasiSipinjam", "LayananPeminjaman", "", ""),
             ("AplikasiSipinjam", "RekapPeminjaman", "", "")]
    agg = [("RepositoriBarang", "Barang", "1", "0..*"),
           ("RepositoriPeminjaman", "Peminjaman", "1", "0..*"),
           ("RepositoriPengguna", "Pengguna", "1", "0..*")]
    cl = {"Paket Penyimpanan": ["RepositoriBarang", "RepositoriPeminjaman", "RepositoriPengguna",
                                 "PenyimpananData"],
          "Paket Layanan": ["LayananPeminjaman"],
          "Paket Pelaporan dan Antarmuka": ["RekapPeminjaman", "AplikasiSipinjam"],
          "Kelas rujukan": ["Barang", "Peminjaman", "Pengguna"]}
    return build_class("class_penyimpanan_sipinjam", _svc(names, extra), cl, (), assoc, agg,
                       [("Barang", "#f7f7f7"), ("Peminjaman", "#f7f7f7"), ("Pengguna", "#f7f7f7")])


if __name__ == "__main__":
    from PIL import Image
    uc, errs = build_usecase()
    print("use case:", "OK" if not errs else f"{len(set(errs))} masalah")
    for p in (uc, build_model(), build_aturan(), build_penyimpanan()):
        im = Image.open(p)
        cm = im.width / 200 * 2.54
        print(f"{os.path.basename(p):30s} {im.width}x{im.height}px  lebar~{cm:5.1f}cm  "
              f"font efektif A4(16cm)~{13 * (16 / cm):4.1f}pt")