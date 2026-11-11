"""Bangun DOCX dari DESKRIPSI_PROYEK_SIPINJAM.md (markdown sederhana -> Word).

Didukung: heading #/##/###, paragraf, daftar '-', daftar bernomor '1.',
tabel pipa, blok kode ```, kutipan '> ', tebal **...**, dan kode `...`.
"""

import os
import re
import textwrap

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, "DESKRIPSI_PROYEK_SIPINJAM.md")
OUT = os.path.join(BASE, "DESKRIPSI_PROYEK_SIPINJAM.docx")

TEXT_WIDTH_CM = 15.0
TABLE_MAX_CM = 14.6
BODY_FONT = "Times New Roman"
CODE_FONT = "Consolas"
BODY_SIZE = 11


def shade(cell, hex_color):
    el = OxmlElement("w:shd")
    el.set(qn("w:val"), "clear")
    el.set(qn("w:color"), "auto")
    el.set(qn("w:fill"), hex_color)
    cell._tc.get_or_add_tcPr().append(el)


def repeat_header(row):
    el = OxmlElement("w:tblHeader")
    el.set(qn("w:val"), "true")
    row._tr.get_or_add_trPr().append(el)


def add_inline(par, text, size=BODY_SIZE, font=BODY_FONT):
    """Tulis teks dengan penanda **tebal** dan `kode`."""
    token = re.compile(r"(\*\*.+?\*\*|`[^`]+`)")
    for part in token.split(text):
        if not part:
            continue
        if part.startswith("**") and part.endswith("**") and len(part) > 4:
            run = par.add_run(part[2:-2])
            run.bold = True
        elif part.startswith("`") and part.endswith("`") and len(part) > 2:
            run = par.add_run(part[1:-1])
            run.font.name = CODE_FONT
            run.font.size = Pt(size - 0.5)
            run._element.rPr.rFonts.set(qn("w:eastAsia"), CODE_FONT)
        else:
            run = par.add_run(part)
        if run.font.name is None:
            run.font.name = font
        if run.font.size is None:
            run.font.size = Pt(size)
    return par


def split_row(line):
    body = line.strip()
    if body.startswith("|"):
        body = body[1:]
    if body.endswith("|"):
        body = body[:-1]
    cells = re.split(r"(?<!\\)\|", body)
    return [c.strip().replace("\\|", "|") for c in cells]


def is_separator(line):
    return bool(re.fullmatch(r"\s*\|?[\s:\-|]+\|?\s*", line)) and "-" in line


def build_table(doc, header, rows):
    table = doc.add_table(rows=1, cols=len(header))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = True

    for i, text in enumerate(header):
        cell = table.rows[0].cells[i]
        cell.text = ""
        par = cell.paragraphs[0]
        add_inline(par, text, size=9)
        for run in par.runs:
            run.bold = True
        shade(cell, "DCE6F1")
    repeat_header(table.rows[0])

    for data in rows:
        cells = table.add_row().cells
        for i, text in enumerate(data[: len(header)]):
            cells[i].text = ""
            par = cells[i].paragraphs[0]
            add_inline(par, text, size=9)

    # lebar kolom proporsional terhadap isi terpanjang, total dibatasi
    longest = []
    for i in range(len(header)):
        length = max([len(header[i])] + [len(r[i]) for r in rows if i < len(r)])
        longest.append(max(1.6, min(9.0, length * 0.19)))
    scale = TABLE_MAX_CM / sum(longest)
    for row in table.rows:
        for i, width in enumerate(longest):
            row.cells[i].width = Cm(width * scale)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)
    return table


def build():
    doc = Document()
    sec = doc.sections[0]
    sec.page_width, sec.page_height = Cm(21.0), Cm(29.7)
    sec.top_margin = sec.bottom_margin = Cm(2.5)
    sec.left_margin = sec.right_margin = Cm(3.0)

    normal = doc.styles["Normal"]
    normal.font.name = BODY_FONT
    normal.font.size = Pt(BODY_SIZE)
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.15

    for name, size, color in (("Heading 1", 14, "1F3864"), ("Heading 2", 12.5, "2F5496"),
                              ("Heading 3", 11.5, "2F5496")):
        style = doc.styles[name]
        style.font.name = BODY_FONT
        style.font.size = Pt(size)
        style.font.bold = True
        style.font.color.rgb = RGBColor.from_string(color)
        style.paragraph_format.space_before = Pt(12)
        style.paragraph_format.space_after = Pt(6)
        style.paragraph_format.keep_with_next = True

    lines = open(SRC, encoding="utf-8").read().splitlines()
    i = 0
    code_buffer = None

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # blok kode
        if stripped.startswith("```"):
            if code_buffer is None:
                code_buffer = []
            else:
                for raw in code_buffer:
                    for piece in textwrap.wrap(raw, width=88, subsequent_indent="    ",
                                               break_long_words=True) or [""]:
                        par = doc.add_paragraph()
                        par.paragraph_format.space_after = Pt(0)
                        par.paragraph_format.line_spacing = 1.0
                        par.paragraph_format.left_indent = Cm(0.4)
                        run = par.add_run(piece)
                        run.font.name = CODE_FONT
                        run.font.size = Pt(8.5)
                        run._element.rPr.rFonts.set(qn("w:eastAsia"), CODE_FONT)
                code_buffer = None
            i += 1
            continue
        if code_buffer is not None:
            code_buffer.append(line)
            i += 1
            continue

        if not stripped:
            i += 1
            continue

        # tabel
        if stripped.startswith("|") and i + 1 < len(lines) and is_separator(lines[i + 1]):
            header = split_row(stripped)
            rows = []
            i += 2
            while i < len(lines) and lines[i].strip().startswith("|"):
                rows.append(split_row(lines[i]))
                i += 1
            build_table(doc, header, rows)
            continue

        # heading
        if stripped.startswith("#"):
            level = len(stripped) - len(stripped.lstrip("#"))
            text = stripped[level:].strip()
            par = doc.add_paragraph(style=f"Heading {min(level, 3)}")
            add_inline(par, text, size={1: 14, 2: 12.5, 3: 11.5}[min(level, 3)])
            for run in par.runs:
                run.bold = True
            i += 1
            continue

        # kutipan
        if stripped.startswith(">"):
            par = doc.add_paragraph()
            par.paragraph_format.left_indent = Cm(0.6)
            par.paragraph_format.space_after = Pt(8)
            add_inline(par, stripped.lstrip("> ").strip(), size=10)
            for run in par.runs:
                run.italic = True
                run.font.color.rgb = RGBColor.from_string("595959")
            i += 1
            continue

        # daftar butir dan bernomor
        bullet = re.match(r"^[-*]\s+(.*)$", stripped)
        numbered = re.match(r"^(\d+)\.\s+(.*)$", stripped)
        if bullet or numbered:
            text = bullet.group(1) if bullet else numbered.group(2)
            style = "List Bullet" if bullet else "List Number"
            par = doc.add_paragraph(style=style)
            par.paragraph_format.space_after = Pt(3)
            par.paragraph_format.line_spacing = 1.1
            add_inline(par, text)
            i += 1
            continue

        # paragraf biasa
        par = doc.add_paragraph()
        par.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        add_inline(par, stripped)
        i += 1

    doc.save(OUT)
    return OUT


if __name__ == "__main__":
    path = build()
    print("OK ->", path, "|", os.path.getsize(path), "byte")
