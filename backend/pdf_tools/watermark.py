import os
import uuid
import tempfile
from flask import Flask, request, jsonify, send_file
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from PIL import Image

import fitz 

def image_to_pdf(image_path, output_path):
    """Convert image to single-page PDF."""
    img = Image.open(image_path)
    img_width, img_height = img.size

    # Scale into A4 page
    c = canvas.Canvas(output_path, pagesize=letter)
    c.drawImage(image_path, 100, 400, width=300, height=300)  # adjust position
    c.showPage()
    c.save()

 # PyMuPDF


def add_watermark(input_path, watermark_path, output_folder="Uploads"):
    os.makedirs(output_folder, exist_ok=True)
    output_path = os.path.abspath(
        os.path.join(output_folder, f"watermarked_{uuid.uuid4()}.pdf")
    )

    # Open input PDF
    doc = fitz.open(input_path)

    # Try watermark as image first
    is_image = watermark_path.lower().endswith((".png", ".jpg", ".jpeg"))

    if is_image:
        watermark_img = open(watermark_path, "rb").read()

        for page in doc:
            rect = page.rect
            # Resize watermark to 30% of page width
            w = rect.width * 0.3
            h = w  # square watermark
            x = (rect.width - w) / 2
            y = (rect.height - h) / 2
            page.insert_image(fitz.Rect(x, y, x + w, y + h), stream=watermark_img)

    else:
        # Watermark is a PDF
        wm_doc = fitz.open(watermark_path)
        wm_page = wm_doc[0]

        for page in doc:
            rect = page.rect
            # scale watermark to fit 40% of page width
            zoom = rect.width * 0.4 / wm_page.rect.width
            mat = fitz.Matrix(zoom, zoom)
            # center placement
            x = (rect.width - wm_page.rect.width * zoom) / 2
            y = (rect.height - wm_page.rect.height * zoom) / 2
            page.show_pdf_page(
                fitz.Rect(x, y, x + wm_page.rect.width * zoom, y + wm_page.rect.height * zoom),
                wm_doc,
                0,
                matrix=mat
            )

    doc.save(output_path)
    return output_path
