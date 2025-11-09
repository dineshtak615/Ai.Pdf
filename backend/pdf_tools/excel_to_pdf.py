import os
import uuid
import pandas as pd
from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle

def excel_to_pdf(xlsx_path, output_folder="uploads"):
    # Ensure upload/output directory exists
    os.makedirs(output_folder, exist_ok=True)

    # Generate unique output path
    pdf_path = os.path.abspath(os.path.join(output_folder, f"{uuid.uuid4()}_output.pdf"))
    xlsx_path = os.path.abspath(xlsx_path)

    # Read Excel file
    try:
        df = pd.read_excel(xlsx_path)
    except Exception as e:
        raise RuntimeError(f"❌ Failed to read Excel file: {e}")

    # Create PDF canvas
    c = canvas.Canvas(pdf_path, pagesize=landscape(letter))
    width, height = landscape(letter)

    # Convert dataframe to a list of lists for ReportLab
    data = [list(df.columns)] + df.values.tolist()

    # Create table
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4F81BD')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))

    # Calculate table width and position
    table_width, table_height = table.wrapOn(c, width, height)
    x = (width - table_width) / 2
    y = height - table_height - 50

    # Draw title
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 30, f"Excel to PDF Export: {os.path.basename(xlsx_path)}")

    # Draw table
    table.drawOn(c, x, y)

    c.save()
    print(f"✅ PDF successfully created: {pdf_path}")
    return pdf_path
