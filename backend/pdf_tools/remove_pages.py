import os
import uuid
from PyPDF2 import PdfReader, PdfWriter

def remove_pages_from_pdf(input_path, pages_str, output_folder="uploads"):
    """
    Remove specified pages from a PDF.

    Args:
        input_path (str): Path to input PDF.
        pages_str (str): Comma-separated page numbers or ranges (e.g., "1,3-4").
        output_folder (str): Folder to save output PDF.

    Returns:
        str: Path to output PDF with pages removed.
    """
    reader = PdfReader(input_path)
    writer = PdfWriter()

    # Parse pages to remove (convert to 0-based index)
    remove_indices = set()
    for part in pages_str.split(","):
        part = part.strip()
        if "-" in part:
            start, end = map(int, part.split("-"))
            remove_indices.update(range(start - 1, end))
        else:
            remove_indices.add(int(part) - 1)

    for i, page in enumerate(reader.pages):
        if i not in remove_indices:
            writer.add_page(page)

    output_path = os.path.join(output_folder, f"removed_{uuid.uuid4()}.pdf")
    with open(output_path, "wb") as f_out:
        writer.write(f_out)

    return output_path
