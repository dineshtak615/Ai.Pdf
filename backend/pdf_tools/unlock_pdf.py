from PyPDF2 import PdfReader, PdfWriter
import os
import uuid

def unlock_pdf(input_path, password, output_folder="uploads"):
    reader = PdfReader(input_path)
    if reader.is_encrypted:
        try:
            reader.decrypt(password)
        except:
            raise Exception("Incorrect password or decryption failed.")

    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)

    output_path = os.path.join(output_folder, f"{uuid.uuid4()}_unlocked.pdf")
    with open(output_path, "wb") as f:
        writer.write(f)

    return output_path
