import fitz  # PyMuPDF

def compress_pdf(input_path, output_path, image_quality=50):
    doc = fitz.open(input_path)

    for page in doc:
        images = page.get_images(full=True)
        for img in images:
            xref = img[0]
            try:
                pix = fitz.Pixmap(doc, xref)
                if pix.n > 4:  # convert CMYK to RGB
                    pix = fitz.Pixmap(fitz.csRGB, pix)
                pix.save(output_path, quality=image_quality)
                pix = None
            except Exception as e:
                print("⚠️ Skipping image compression:", e)

    doc.save(output_path, deflate=True)
    doc.close()
