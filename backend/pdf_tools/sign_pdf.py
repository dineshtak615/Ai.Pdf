import tempfile, os, logging
from PyPDF2 import PdfReader, PdfWriter
from endesive import pdf  # for certificate signing


def sign_pdf_basic(input_pdf):
    reader = PdfReader(input_pdf)
    writer = PdfWriter()

    for page in reader.pages:
        page.add_metadata({"/Signed": "Basic Signature by PDF Tool"})
        writer.add_page(page)

    signed_path = input_pdf.replace(".pdf", "_signed.pdf")
    with open(signed_path, "wb") as f:
        writer.write(f)
    return signed_path

# -------- CERTIFICATE SIGNATURE -------- #
def sign_pdf_with_cert(input_pdf, cert_file, password):
    dct = {
        "sigpage": 0,
        "sigbutton": True,
        "contact": "support@example.com",
        "location": "Worldwide",
        "signingdate": "20250101000000+00'00'",
        "reason": "Document signed digitally",
    }

    with open(cert_file, "rb") as f:
        p12 = f.read()

    datau = open(input_pdf, "rb").read()
    datas = pdf.sign(datau, dct, p12, password.encode("utf-8"))

    signed_path = input_pdf.replace(".pdf", "_cert_signed.pdf")
    with open(signed_path, "wb") as f:
        f.write(datau)
        f.write(datas)
    return signed_path
