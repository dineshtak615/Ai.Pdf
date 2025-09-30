from PyPDF2 import PdfReader, PdfWriter
import os

def parse_page_range(pages_str, total_pages):
    pages_to_extract = set()
    for part in pages_str.split(","):
        part = part.strip()
        if "-" in part:
            start, end = part.split("-")
            start, end = int(start), int(end)
            pages_to_extract.update(range(start, end + 1))
        else:
            pages_to_extract.add(int(part))
    return {p for p in pages_to_extract if 1 <= p <= total_pages}


def extract_pages_from_pdf(input_pdf, pages_str, output_dir):
    reader = PdfReader(input_pdf)
    writer = PdfWriter()

    # Parse page numbers
    pages_to_extract = set()
    for part in pages_str.split(","):
        part = part.strip()
        if "-" in part:
            start, end = map(int, part.split("-"))
            pages_to_extract.update(range(start, end + 1))
        else:
            pages_to_extract.add(int(part))

    # Add selected pages
    for page_num in sorted(pages_to_extract):
        if 1 <= page_num <= len(reader.pages):
            writer.add_page(reader.pages[page_num - 1])

    # ✅ Ensure output dir exists
    abs_output_dir = os.path.abspath(output_dir)
    os.makedirs(abs_output_dir, exist_ok=True)

    # ✅ Always use absolute path
    output_path = os.path.join(abs_output_dir, "extracted.pdf")

    with open(output_path, "wb") as f:
        writer.write(f)

    print(f"📂 Extracted PDF saved at: {output_path}")
    return output_path
