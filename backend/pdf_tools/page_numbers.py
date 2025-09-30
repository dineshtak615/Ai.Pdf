import os
import io
import uuid
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader

def add_page_numbers(pdf_path, output_path, position="bottom-right", font_size=12, start_page=1, number_format="1"):
    reader = PdfReader(pdf_path)
    writer = PdfWriter()

    for page_num, page in enumerate(reader.pages, start=1):
        packet = io.BytesIO()
        can = canvas.Canvas(packet, pagesize=letter)

        if page_num >= start_page:
            # Format page number
            if number_format == "i":
                text = to_roman(page_num)  # e.g. i, ii, iii
            elif number_format == "A":
                text = chr(64 + page_num)  # A, B, C
            else:
                text = str(page_num)  # default numeric

            width, height = letter
            x, y = 50, 50

            if position == "top-left":
                x, y = 50, height - 30
            elif position == "top-right":
                x, y = width - 100, height - 30
            elif position == "bottom-left":
                x, y = 50, 30
            elif position == "bottom-right":
                x, y = width - 100, 30
            elif position == "center":
                x, y = width / 2, 30

            can.setFont("Helvetica", font_size)
            can.drawString(x, y, text)

        can.save()
        packet.seek(0)

        number_pdf = PdfReader(packet)
        page.merge_page(number_pdf.pages[0])
        writer.add_page(page)

    # 🔹 Now we expect a full file path (not directory)
    with open(output_path, "wb") as f:
        writer.write(f)

    return output_path
