from typing import Dict
from venv import logger

import fitz  # PyMuPDF
import difflib

from PyPDF2 import PdfReader


def extract_text(pdf_path):
    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text()
    return text


class PDFProcessingError(Exception):
    pass


def compare_pdfs(pdf1_path: str, pdf2_path: str) -> Dict[str, any]:
    """Compare two PDFs and return differences."""
    try:
        reader1 = PdfReader(pdf1_path)
        reader2 = PdfReader(pdf2_path)
        differences = []

        if len(reader1.pages) != len(reader2.pages):
            differences.append(f"Page count differs: {len(reader1.pages)} vs {len(reader2.pages)}")
            return {"success": True, "differences": differences}

        for i in range(len(reader1.pages)):
            text1 = reader1.pages[i].extract_text() or ""
            text2 = reader2.pages[i].extract_text() or ""
            if text1 != text2:
                differences.append(f"Page {i + 1} content differs")

        logger.debug(f"Compared {pdf1_path} and {pdf2_path}")
        return {"success": True, "differences": differences}
    except Exception as e:
        logger.error(f"Failed to compare PDFs: {str(e)}")
        raise PDFProcessingError(f"Failed to compare PDFs: {str(e)}")
