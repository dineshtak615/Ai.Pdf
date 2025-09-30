import os
import uuid
from PyPDF2 import PdfReader, PdfWriter

def split_pdf_pages(input_path, pages_str, output_folder="uploads"):
    """
    Split specified pages from a PDF.

    Args:
        input_path (str): Path to input PDF.
        pages_str (str): Comma-separated pages or ranges (e.g., "1,3,5" or "2-4").
        output_folder (str): Folder to save the split PDF.

    Returns:
        str: Path to the output split PDF.
    """
    reader = PdfReader(input_path)
    writer = PdfWriter()

    # Parse page numbers
    page_nums = []
    for part in pages_str.split(","):
        part = part.strip()
        if "-" in part:
            start, end = map(int, part.split("-"))
            page_nums.extend(range(start - 1, end))  # Pages are 0-indexed
        else:
            page_nums.append(int(part) - 1)

    for page_num in page_nums:
        if 0 <= page_num < len(reader.pages):
            writer.add_page(reader.pages[page_num])

    output_path = os.path.join(output_folder, f"split_{uuid.uuid4()}.pdf")
    with open(output_path, "wb") as f_out:
        writer.write(f_out)

    return output_path
