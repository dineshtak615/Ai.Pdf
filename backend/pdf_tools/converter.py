import fitz  # PyMuPDF

def convert_pdf_to_text(file_stream):
    text = ""
    doc = fitz.open(stream=file_stream.read(), filetype="pdf")
    for page in doc:
        text += page.get_text()
    return text
