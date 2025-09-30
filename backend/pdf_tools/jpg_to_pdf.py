from PIL import Image
from fpdf import FPDF
import os

PDF_OUTPUT_FOLDER = "pdf_output"
os.makedirs(PDF_OUTPUT_FOLDER, exist_ok=True)  # ✅ make sure folder exists

def jpg_to_pdf(image_paths):
    pdf = FPDF()

    for img_path in image_paths:
        image = Image.open(img_path)

        # Convert mode if needed
        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")

        pdf.add_page()
        pdf.set_font("Arial", size=12)

        # Insert image (fit page with margins)
        pdf.image(img_path, x=10, y=10, w=pdf.w - 20)

    # ✅ Always overwrite with new PDF
    pdf_filename = "merged_images.pdf"
    pdf_path = os.path.join(PDF_OUTPUT_FOLDER, pdf_filename)

    pdf.output(pdf_path)
    return pdf_path
