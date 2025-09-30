import fitz  # PyMuPDF
from PIL import Image
import pytesseract
import uuid
import os

def scan_pdf(image_path, output_folder="uploads"):
    image = Image.open(image_path).convert("RGB")
    text = pytesseract.image_to_string(image)

    doc = fitz.open()
    rect = fitz.Rect(0, 0, image.width, image.height)

    page = doc.new_page(width=rect.width, height=rect.height)
    pix = fitz.Pixmap(image_path)
    page.insert_image(rect, pixmap=pix)

    # Add hidden OCR text layer
    page.insert_textbox(
        rect, text, fontsize=10, overlay=True, render_mode=3, color=(1, 1, 1)
    )

    output_path = os.path.join(output_folder, f"{uuid.uuid4()}_scanned.pdf")
    doc.save(output_path)
    doc.close()

    return output_path
