from pathlib import Path
import re
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import (
    Flowable,
    PageBreak,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "LifeOS-Agent-PRD.md"
OUTPUT = ROOT / "LifeOS-Agent-PRD.pdf"


pdfmetrics.registerFont(UnicodeCIDFont("STSong-Light"))
FONT = "STSong-Light"


class HorizontalRule(Flowable):
    def __init__(self, width=160 * mm, color=colors.HexColor("#D9DDE7")):
        super().__init__()
        self.width = width
        self.height = 1
        self.color = color

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(0.7)
        self.canv.line(0, 0, self.width, 0)


def clean_inline(text: str) -> str:
    text = text.strip()
    text = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"`([^`]+)`", r"<font backColor='#EEF2FF'>\1</font>", text)
    text = escape(text, entities={"<b>": "<b>", "</b>": "</b>"})
    text = text.replace("&lt;b&gt;", "<b>").replace("&lt;/b&gt;", "</b>")
    text = text.replace("&lt;font backColor='#EEF2FF'&gt;", "<font backColor='#EEF2FF'>")
    text = text.replace("&lt;/font&gt;", "</font>")
    return text


def is_table_separator(line: str) -> bool:
    cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
    return bool(cells) and all(re.fullmatch(r":?-{3,}:?", cell or "") for cell in cells)


def build_styles():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="CoverTitle",
            parent=styles["Title"],
            fontName=FONT,
            fontSize=28,
            leading=36,
            textColor=colors.HexColor("#20263A"),
            alignment=TA_CENTER,
            spaceAfter=14,
        )
    )
    styles.add(
        ParagraphStyle(
            name="CoverSubtitle",
            parent=styles["Normal"],
            fontName=FONT,
            fontSize=12,
            leading=19,
            textColor=colors.HexColor("#596074"),
            alignment=TA_CENTER,
            spaceAfter=20,
        )
    )
    styles.add(
        ParagraphStyle(
            name="H1CJK",
            parent=styles["Heading1"],
            fontName=FONT,
            fontSize=18,
            leading=25,
            textColor=colors.HexColor("#24304F"),
            spaceBefore=16,
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="H2CJK",
            parent=styles["Heading2"],
            fontName=FONT,
            fontSize=14,
            leading=21,
            textColor=colors.HexColor("#2F3B63"),
            spaceBefore=12,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="H3CJK",
            parent=styles["Heading3"],
            fontName=FONT,
            fontSize=12,
            leading=18,
            textColor=colors.HexColor("#445071"),
            spaceBefore=10,
            spaceAfter=4,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BodyCJK",
            parent=styles["BodyText"],
            fontName=FONT,
            fontSize=10.5,
            leading=17,
            textColor=colors.HexColor("#252A36"),
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BulletCJK",
            parent=styles["BodyCJK"],
            leftIndent=13,
            firstLineIndent=-9,
            bulletIndent=0,
        )
    )
    styles.add(
        ParagraphStyle(
            name="QuoteCJK",
            parent=styles["BodyCJK"],
            leftIndent=10,
            borderColor=colors.HexColor("#C9D1E5"),
            borderWidth=1,
            borderPadding=7,
            backColor=colors.HexColor("#F7F8FC"),
            textColor=colors.HexColor("#434A5D"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="CodeCJK",
            parent=styles["Code"],
            fontName=FONT,
            fontSize=8.5,
            leading=12,
            leftIndent=5,
            rightIndent=5,
            borderColor=colors.HexColor("#D7DCEB"),
            borderWidth=0.6,
            borderPadding=6,
            backColor=colors.HexColor("#F6F8FC"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="TableCell",
            parent=styles["BodyCJK"],
            fontSize=8.5,
            leading=12,
            spaceAfter=0,
        )
    )
    return styles


def add_paragraph(buffer, story, styles):
    if not buffer:
        return
    text = " ".join(line.strip() for line in buffer).strip()
    if text:
        story.append(Paragraph(clean_inline(text), styles["BodyCJK"]))
    buffer.clear()


def add_table(table_lines, story, styles):
    rows = []
    for line in table_lines:
        if is_table_separator(line):
            continue
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        rows.append([Paragraph(clean_inline(cell), styles["TableCell"]) for cell in cells])
    if not rows:
        return

    available_width = A4[0] - 36 * mm
    col_count = max(len(row) for row in rows)
    col_widths = [available_width / col_count] * col_count
    table = Table(rows, colWidths=col_widths, hAlign="LEFT", repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), FONT),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EDF2FF")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#263454")),
                ("GRID", (0, 0), (-1, -1), 0.45, colors.HexColor("#CFD6E6")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 7))


def parse_markdown(markdown: str, styles):
    lines = markdown.splitlines()
    story = []
    paragraph = []
    table_lines = []
    code_lines = []
    in_code = False

    for raw in lines:
        line = raw.rstrip()

        if line.startswith("```"):
            add_paragraph(paragraph, story, styles)
            if table_lines:
                add_table(table_lines, story, styles)
                table_lines = []
            if in_code:
                story.append(Preformatted("\n".join(code_lines), styles["CodeCJK"]))
                story.append(Spacer(1, 7))
                code_lines = []
                in_code = False
            else:
                in_code = True
            continue

        if in_code:
            code_lines.append(line)
            continue

        if line.strip().startswith("|") and "|" in line.strip()[1:]:
            add_paragraph(paragraph, story, styles)
            table_lines.append(line)
            continue
        if table_lines:
            add_table(table_lines, story, styles)
            table_lines = []

        stripped = line.strip()
        if not stripped:
            add_paragraph(paragraph, story, styles)
            continue

        if stripped == "---":
            add_paragraph(paragraph, story, styles)
            story.append(HorizontalRule())
            story.append(Spacer(1, 7))
            continue

        heading = re.match(r"^(#{1,3})\s+(.*)$", stripped)
        if heading:
            add_paragraph(paragraph, story, styles)
            level = len(heading.group(1))
            text = clean_inline(heading.group(2))
            story.append(Paragraph(text, styles[{1: "H1CJK", 2: "H2CJK", 3: "H3CJK"}[level]]))
            continue

        bullet = re.match(r"^[-*]\s+(.*)$", stripped)
        if bullet:
            add_paragraph(paragraph, story, styles)
            story.append(Paragraph("• " + clean_inline(bullet.group(1)), styles["BulletCJK"]))
            continue

        ordered = re.match(r"^(\d+)\.\s+(.*)$", stripped)
        if ordered:
            add_paragraph(paragraph, story, styles)
            story.append(Paragraph(f"{ordered.group(1)}. {clean_inline(ordered.group(2))}", styles["BulletCJK"]))
            continue

        quote = re.match(r"^>\s+(.*)$", stripped)
        if quote:
            add_paragraph(paragraph, story, styles)
            story.append(Paragraph(clean_inline(quote.group(1)), styles["QuoteCJK"]))
            continue

        paragraph.append(stripped)

    add_paragraph(paragraph, story, styles)
    if table_lines:
        add_table(table_lines, story, styles)
    return story


def draw_page(canvas, doc):
    canvas.saveState()
    canvas.setFont(FONT, 8.5)
    canvas.setFillColor(colors.HexColor("#7A8297"))
    canvas.drawString(18 * mm, 12 * mm, "LifeOS Agent PRD")
    canvas.drawRightString(A4[0] - 18 * mm, 12 * mm, f"第 {doc.page} 页")
    canvas.restoreState()


def main():
    markdown = SOURCE.read_text(encoding="utf-8")
    styles = build_styles()
    story = [
        Spacer(1, 38 * mm),
        Paragraph("LifeOS Agent", styles["CoverTitle"]),
        Paragraph("PRD + 技术架构 + MVP 开发清单", styles["CoverSubtitle"]),
        HorizontalRule(width=120 * mm, color=colors.HexColor("#BAC5E8")),
        Spacer(1, 12 * mm),
        Paragraph(
            "融合修仙世界观的伴随式个人成长智能体，通过 Memory、Skills 与 Agent Harness 构建可观测、可进化的成长闭环。",
            styles["CoverSubtitle"],
        ),
        PageBreak(),
    ]
    story.extend(parse_markdown(markdown, styles))

    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title="LifeOS Agent PRD",
        author="Codex",
    )
    doc.build(story, onFirstPage=draw_page, onLaterPages=draw_page)
    print(OUTPUT)


if __name__ == "__main__":
    main()
