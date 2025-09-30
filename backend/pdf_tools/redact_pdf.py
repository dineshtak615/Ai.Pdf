import os
import fitz  # PyMuPDF
def redact_pdf(input_path, areas, output_name=None):
    if not output_name:
        output_name = f"{uuid.uuid4()}_redacted.pdf"

    output_path = os.path.join(UPLOAD_FOLDER, output_name)
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    doc = fitz.open(input_path)

    for page_key, coords in areas.items():
        try:
            page_num = int(page_key)  # handles JSON keys like "0"
            if page_num >= len(doc):
                continue  # skip invalid pages

            page = doc[page_num]
            for rect in coords:
                if len(rect) != 4:
                    continue  # skip invalid rect
                r = fitz.Rect(rect)
                page.add_redact_annot(r, fill=(0, 0, 0))
            page.apply_redactions()
        except Exception as e:
            print(f"Skipping page {page_key}: {e}")
            continue

    doc.save(output_path)
    doc.close()
    return output_path
