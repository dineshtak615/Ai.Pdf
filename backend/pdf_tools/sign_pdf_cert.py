import os
import uuid

from pyhanko.sign import PdfSignatureMetadata, PdfSigner, signers


def sign_pdf_with_cert(pdf_path, cert_path, password, output_folder="uploads"):
    output_path = os.path.join(output_folder, f"{uuid.uuid4()}_cert_signed.pdf")

    # Load certificate
    signer = signers.SimpleSigner.load_pkcs12(cert_path, password.encode())

    meta = PdfSignatureMetadata(field_name="Signature1")

    with open(pdf_path, "rb") as inf:
        with open(output_path, "wb") as outf:
            PdfSigner(meta, signer=signer).sign_pdf(inf, output=outf)

    return output_path
