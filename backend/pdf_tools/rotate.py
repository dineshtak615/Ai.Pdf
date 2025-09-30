import os
import uuid
from PyPDF2 import PdfReader, PdfWriter

def rotate_pdf(input_path, pages_str, angle, output_folder="Uploads"):
    """
    Rotate specified pages in a PDF.

    Args:
        input_path (str): Path to input PDF.
        pages_str (str): Comma-separated page numbers or ranges (e.g., "1,3-4").
        angle (int): Rotation angle (must be 90, 180, or 270).
        output_folder (str): Output directory.

    Returns:
        str: Absolute path to rotated PDF.
    """
    if angle not in [90, 180, 270]:
        raise ValueError("Rotation angle must be 90, 180, or 270 degrees.")

    reader = PdfReader(input_path)
    writer = PdfWriter()

    os.makedirs(output_folder, exist_ok=True)

    # Parse requested pages (0-based)
    rotate_indices = set()
    for part in pages_str.split(","):
        part = part.strip()
        if "-" in part:
            start, end = map(int, part.split("-"))
            rotate_indices.update(range(start - 1, end))
        else:
            rotate_indices.add(int(part) - 1)

    for i, page in enumerate(reader.pages):
        if i in rotate_indices:
            page.rotate(angle)   # ✅ PyPDF2 >= 3.0.0
        writer.add_page(page)

    output_path = os.path.abspath(
        os.path.join(output_folder, f"rotated_{uuid.uuid4()}.pdf")
    )
    with open(output_path, "wb") as f_out:
        writer.write(f_out)

    return output_path
