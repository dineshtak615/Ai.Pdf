import os
from pptx import Presentation
from pptx.util import Inches
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from PIL import Image
import io
import subprocess
OUTPUT_FOLDER = os.path.join(os.getcwd(), "converted")
# os.makedirs(PDF_OUTPUT_FOLDER, exist_ok=True)

def convert_pptx_to_pdf(pptx_path):
    """
    Convert PPTX to PDF using LibreOffice (Windows path).
    """
    try:
        libreoffice_path = r"C:\Program Files\LibreOffice\program\soffice.exe"

        subprocess.run([
            libreoffice_path, "--headless", "--convert-to", "pdf",
            "--outdir", OUTPUT_FOLDER, pptx_path
        ], check=True)

        pdf_filename = os.path.splitext(os.path.basename(pptx_path))[0] + ".pdf"
        pdf_path = os.path.join(OUTPUT_FOLDER, pdf_filename)
        if not os.path.exists(pdf_path):
            raise FileNotFoundError("Conversion failed, PDF not found.")

        return pdf_path
    except Exception as e:
        raise RuntimeError(f"PPTX to PDF conversion failed: {str(e)}")