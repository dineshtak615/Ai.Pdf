import pdfkit
import os
import uuid

def html_to_pdf(html_content, output_folder="uploads"):
    output_path = os.path.join(output_folder, f"{uuid.uuid4()}_html.pdf")
    pdfkit.from_string(html_content, output_path)
    return output_path
