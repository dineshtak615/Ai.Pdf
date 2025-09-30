import pdfplumber
import tabula
import os
import uuid
# import pdfplumber
import pandas as pd


def pdf_to_word(pdf_path, output_folder="uploads"):
    output_file = os.path.join(output_folder, f"{uuid.uuid4()}.docx")
    text = ""

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""

    with open(output_file, "w", encoding="utf-8") as f:
        f.write(text)

    return output_file



def pdf_to_excel(pdf_path, output_folder="uploads"):
    # Create a unique Excel filename
    excel_path = os.path.join(output_folder, f"{uuid.uuid4()}_output.xlsx")

    all_tables = []

    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            for table in tables:
                df = pd.DataFrame(table[1:], columns=table[0])  # Use first row as header
                all_tables.append(df)

    if not all_tables:
        raise ValueError("No tables found in PDF.")

    # Save all tables to one Excel file with multiple sheets
    with pd.ExcelWriter(excel_path, engine="openpyxl") as writer:
        for idx, table_df in enumerate(all_tables):
            table_df.to_excel(writer, sheet_name=f"Sheet{idx+1}", index=False)

    return excel_path
