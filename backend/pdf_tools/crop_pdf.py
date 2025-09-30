import uuid
import os
import fitz  # PyMuPDF


class PDFProcessingError(Exception):
    pass


def _generate_unique_path(output_dir: str, prefix: str, extension: str) -> str:
    """Generate a unique file path with the given prefix and extension."""
    os.makedirs(output_dir, exist_ok=True)
    return os.path.join(output_dir, f"{prefix}_{uuid.uuid4().hex}.{extension}")


def crop_pdf(
    pdf_path: str,
    crop_box: tuple,   # (x0, y0, x1, y1)
    output_dir: str = "uploads"
) -> str:
    """
    Crop a PDF with the given box (x0, y0, x1, y1).
    Works with PyMuPDF for better reliability.
    """
    try:
        doc = fitz.open(pdf_path)
        output_path = _generate_unique_path(output_dir, "cropped", "pdf")

        for page in doc:
            # Apply crop (clip rectangle)
            rect = fitz.Rect(*crop_box)
            page.set_cropbox(rect)

        doc.save(output_path)
        doc.close()

        print(f"[INFO] Cropped PDF saved: {output_path}")
        return output_path

    except Exception as e:
        print(f"[ERROR] Failed to crop {pdf_path}: {str(e)}")
        raise PDFProcessingError(f"Failed to crop PDF: {str(e)}")
