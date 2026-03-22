"""
Script para convertir las entrevistas de discovery de Markdown a Word (.docx)
Genera archivos .docx con formato profesional para cada plantilla de entrevista.
"""

import re
from pathlib import Path
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH


def parse_md_and_create_docx(md_path, docx_path):
    """Lee un archivo .md de entrevista y genera un .docx con formato profesional."""
    text = Path(md_path).read_text(encoding="utf-8")
    doc = Document()

    # Estilos base
    style = doc.styles["Normal"]
    font = style.font
    font.name = "Calibri"
    font.size = Pt(11)

    lines = text.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Saltar líneas vacías y separadores
        if stripped == "" or stripped == "---":
            i += 1
            continue

        # Título principal (# )
        if stripped.startswith("# ") and not stripped.startswith("## ") and not stripped.startswith("### "):
            title = stripped[2:]
            p = doc.add_heading(title, level=0)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            i += 1
            continue

        # Subtítulo (## )
        if stripped.startswith("## ") and not stripped.startswith("### "):
            subtitle = stripped[3:]
            doc.add_heading(subtitle, level=1)
            i += 1
            continue

        # Sub-subtítulo (### )
        if stripped.startswith("### "):
            subsubtitle = stripped[4:]
            doc.add_heading(subsubtitle, level=2)
            i += 1
            continue

        # Cita/blockquote (> )
        if stripped.startswith("> "):
            quote_text = stripped[2:].strip('"').strip('"').strip('"')
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Inches(0.5)
            p.paragraph_format.right_indent = Inches(0.3)
            run = p.add_run(f'"{quote_text}"')
            run.italic = True
            run.font.color.rgb = RGBColor(0x33, 0x33, 0x99)
            run.font.size = Pt(11)
            i += 1
            continue

        # Checkbox (- [ ] )
        if stripped.startswith("- [ ] "):
            item_text = stripped[6:]
            p = doc.add_paragraph(style="List Bullet")
            run = p.add_run(f"☐  {item_text}")
            run.font.size = Pt(10)
            i += 1
            continue

        # Lista con viñeta (- )
        if stripped.startswith("- ") and not stripped.startswith("- [ ]"):
            item_text = stripped[2:]
            # Limpiar markdown bold
            item_text = re.sub(r"\*\*(.*?)\*\*", r"\1", item_text)
            p = doc.add_paragraph(style="List Bullet")
            run = p.add_run(item_text)
            run.font.size = Pt(11)
            i += 1
            continue

        # Preguntas con emoji (🔴, 🟡, ⚡, 🏗️, 🏠, 🪑, 🧱)
        emoji_match = re.match(r"^(🔴|🟡|⚡|🏗️|🏠|🪑|🧱)\s*(.*)", stripped)
        if emoji_match:
            emoji = emoji_match.group(1)
            content = emoji_match.group(2)

            # Limpiar markdown bold
            content = re.sub(r"\*\*(.*?)\*\*", r"\1", content)

            p = doc.add_paragraph()

            # Emoji con color según tipo
            emoji_run = p.add_run(f"{emoji}  ")
            emoji_run.font.size = Pt(12)

            # Extraer texto entre comillas si existe
            quote_match = re.search(r'"([^"]*)"', content)

            if quote_match:
                # Hay parte antes de la cita y la cita
                before = content[:content.index('"')].strip()
                quoted = quote_match.group(1)
                after = content[content.index('"') + len(quoted) + 2:].strip()

                if before:
                    r = p.add_run(before + " ")
                    r.font.size = Pt(11)
                    if emoji == "🔴":
                        r.bold = True

                r = p.add_run(f'"{quoted}"')
                r.italic = True
                r.font.size = Pt(11)
                if emoji == "🔴":
                    r.font.color.rgb = RGBColor(0xCC, 0x00, 0x00)
                elif emoji == "⚡":
                    r.font.color.rgb = RGBColor(0xCC, 0x88, 0x00)

                if after:
                    r = p.add_run(f" {after}")
                    r.font.size = Pt(11)
            else:
                r = p.add_run(content)
                r.font.size = Pt(11)
                if emoji == "🔴":
                    r.bold = True
                elif emoji == "⚡":
                    r.font.color.rgb = RGBColor(0xCC, 0x88, 0x00)

            i += 1
            continue

        # Texto con bold markdown
        if "**" in stripped:
            clean = re.sub(r"\*\*(.*?)\*\*", r"\1", stripped)
            p = doc.add_paragraph()
            # Split by bold markers
            parts = re.split(r"(\*\*.*?\*\*)", stripped)
            for part in parts:
                if part.startswith("**") and part.endswith("**"):
                    r = p.add_run(part[2:-2])
                    r.bold = True
                    r.font.size = Pt(11)
                else:
                    r = p.add_run(part)
                    r.font.size = Pt(11)
            i += 1
            continue

        # Texto normal (incluye "Escuchar.", "Dejar que cuente...", etc.)
        if stripped:
            p = doc.add_paragraph(stripped)
            p.style.font.size = Pt(11)

        i += 1

    doc.save(docx_path)
    print(f"  ✓ Generado: {docx_path}")


def main():
    base = Path("/home/user/liminaltech/discovery")
    src_dir = base / "v2-metodologia" / "entrevistas-listas"
    out_dir = base / "docx"
    out_dir.mkdir(exist_ok=True)

    files = sorted(src_dir.glob("*.md"))

    print(f"Convirtiendo {len(files)} entrevistas a .docx...\n")

    for md_file in files:
        docx_name = md_file.stem + ".docx"
        docx_path = out_dir / docx_name
        parse_md_and_create_docx(md_file, docx_path)

    print(f"\nListo. Los archivos están en: {out_dir}")


if __name__ == "__main__":
    main()
