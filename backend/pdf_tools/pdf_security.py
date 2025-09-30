import PyPDF2
import os
import uuid

def encrypt_pdf(input_path, password, output_folder="uploads"):
    reader = PyPDF2.PdfReader(input_path)
    writer = PyPDF2.PdfWriter()

    for page in reader.pages:
        writer.add_page(page)

    writer.encrypt(password)
    output_path = os.path.join(output_folder, f"{uuid.uuid4()}_locked.pdf")
    with open(output_path, "wb") as f:
        writer.write(f)

    return output_path

def decrypt_pdf(input_path, password, output_folder="uploads"):
    reader = PyPDF2.PdfReader(input_path)
    if not reader.is_encrypted:
        raise ValueError("PDF is not encrypted.")

    try:
        reader.decrypt(password)
    except Exception as e:
        raise ValueError("Incorrect password or failed to decrypt.")

    writer = PyPDF2.PdfWriter()
    for page in reader.pages:
        writer.add_page(page)

    output_path = os.path.join(output_folder, f"{uuid.uuid4()}_unlocked.pdf")
    with open(output_path, "wb") as f:
        writer.write(f)

    return output_path
