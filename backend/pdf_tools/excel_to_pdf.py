import pythoncom
import comtypes.client
import os
import uuid
def excel_to_pdf(xlsx_path, output_folder="uploads"):
    os.makedirs(output_folder, exist_ok=True)
    pdf_path = os.path.abspath(os.path.join(output_folder, f"{uuid.uuid4()}_output.pdf"))
    xlsx_path = os.path.abspath(xlsx_path)

    pythoncom.CoInitialize()
    try:
        excel = comtypes.client.CreateObject("Excel.Application")
        excel.Visible = False
        wb = excel.Workbooks.Open(xlsx_path)
        wb.ExportAsFixedFormat(0, pdf_path)
        wb.Close(SaveChanges=False)
        excel.Quit()
    finally:
        pythoncom.CoUninitialize()

    return pdf_path
