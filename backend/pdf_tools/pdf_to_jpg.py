import fitz  # PyMuPDF
import os
IMAGES_OUTPUT_FOLDER = "pdf_images"
os.makedirs(IMAGES_OUTPUT_FOLDER, exist_ok=True)


def pdf_to_images(pdf_file, dpi=150):
    doc = fitz.open(stream=pdf_file, filetype="pdf")
    image_paths = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        zoom = dpi / 72  # scale factor
        mat = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat)

        image_filename = f"page_{page_num+1}.jpg"
        image_path = os.path.join(IMAGES_OUTPUT_FOLDER, image_filename)

        pix.save(image_path)
        image_paths.append(image_path)

    doc.close()
    return image_paths