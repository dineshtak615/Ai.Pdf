import fitz  # PyMuPDF
import uuid
import os

def edit_pdf(pdf_path, edits, output_folder="uploads"):
    doc = fitz.open(pdf_path)
    for edit in edits:
        page_num = edit.get("page", 0)
        x, y = edit.get("x", 100), edit.get("y", 100)
        text = edit.get("text", "")
        font_size = edit.get("font_size", 12)

        page = doc.load_page(page_num)
        # Optional: draw a white rectangle to cover existing content
        if edit.get("erase", False):
            rect = fitz.Rect(x, y, x + 150, y + 20)
            page.draw_rect(rect, color=(1, 1, 1), fill=(1, 1, 1))

        # Insert new text
        page.insert_text((x, y), text, fontsize=font_size, color=(0, 0, 0))

    output_path = os.path.join(output_folder, f"{uuid.uuid4()}_edited.pdf")
    doc.save(output_path)
    doc.close()
    return output_path
