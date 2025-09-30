from PyPDF2 import PdfMerger
import os
import uuid
from werkzeug.utils import secure_filename


def merge_pdfs(files, upload_folder):
    """
    Merge multiple PDF files into one
    Args:
        files: List of FileStorage objects from Flask
        upload_folder: Path to store temporary files
    Returns:
        Path to the merged PDF file
    Raises:
        ValueError: If merging fails
    """
    merger = PdfMerger()
    temp_files = []
    output_path = None

    try:
        # Process each file
        for file in files:
            if not file or file.filename == '':
                continue

            # Save temporarily
            filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
            filepath = os.path.join(upload_folder, filename)
            file.save(filepath)
            temp_files.append(filepath)

            # Add to merger
            merger.append(filepath)

        # Create merged output
        output_filename = f"merged_{uuid.uuid4()}.pdf"
        output_path = os.path.join(upload_folder, output_filename)
        merger.write(output_path)

        return output_path

    except Exception as e:
        # Clean up on error
        for filepath in temp_files:
            if os.path.exists(filepath):
                os.remove(filepath)
        if output_path and os.path.exists(output_path):
            os.remove(output_path)
        raise ValueError(f"Failed to merge PDFs: {str(e)}")

    finally:
        # Clean up temporary files
        for filepath in temp_files:
            if os.path.exists(filepath):
                os.remove(filepath)
        if merger:
            merger.close()