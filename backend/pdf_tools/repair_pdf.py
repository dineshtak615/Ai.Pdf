import fitz  # PyMuPDF
import pikepdf
import os
import uuid

def repair_pdf(input_path, output_folder="uploads"):
    # Step 1: Try opening and resaving using PyMuPDF
    try:
        doc = fitz.open(input_path)
        temp_path = os.path.join(output_folder, f"{uuid.uuid4()}_repaired_temp.pdf")
        doc.save(temp_path)
        doc.close()
    except Exception as e:
        raise Exception(f"PyMuPDF failed to open: {e}")

    # Step 2: Sanitize PDF using pikepdf
    try:
        final_path = os.path.join(output_folder, f"{uuid.uuid4()}_repaired.pdf")
        with pikepdf.open(temp_path) as pdf:
            pdf.save(final_path)
        os.remove(temp_path)
        return final_path
    except Exception as e:
        raise Exception(f"pikepdf failed to repair: {e}")
