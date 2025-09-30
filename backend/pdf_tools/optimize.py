import fitz  # PyMuPDF
import os
import uuid

def optimize_pdf(input_pdf_path, output_folder="uploads"):
    doc = fitz.open(input_pdf_path)

    # This reduces file size by removing unused objects and compressing streams
    output_path = os.path.join(output_folder, f"optimized_{uuid.uuid4()}.pdf")
    doc.save(output_path, garbage=4, deflate=True)
    doc.close()

    return output_path
