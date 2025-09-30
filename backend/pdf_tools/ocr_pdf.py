import os
from pdf2image import convert_from_path
import pytesseract
from PyPDF2 import PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import tempfile
import fitz  # PyMuPDF
# import pdf_path

# 🔹 Explicitly set the Tesseract executable path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# 🔹 Define Poppler path (update this to where you extracted Poppler)
POPPLER_PATH = r"C:\Users\takd2\Release-25.07.0-0 (1)\poppler-25.07.0\Library\bin"  # <-- change if needed
# images = convert_from_path(pdf_path, poppler_path=POPPLER_PATH)

def ocr_pdf(input_pdf_path, output_txt_path):
    import fitz  # PyMuPDF
    import pytesseract
    from PIL import Image

    doc = fitz.open(input_pdf_path)
    text_content = []

    for page_num in range(len(doc)):
        pix = doc[page_num].get_pixmap()
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        text = pytesseract.image_to_string(img)
        text_content.append(text)

    doc.close()

    # save to file
    with open(output_txt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(text_content))

    return output_txt_path
