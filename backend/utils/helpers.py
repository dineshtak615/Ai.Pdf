import os
import uuid

def generate_unique_filename(filename):
    """
    Appends a UUID to the original filename to avoid overwriting.
    """
    name, ext = os.path.splitext(filename)
    return f"{name}_{uuid.uuid4().hex}{ext}"

def is_allowed_file(filename, allowed_extensions={"pdf", "jpg", "jpeg", "png", "docx", "xlsx", "html"}):
    """
    Check if the file has an allowed extension.
    """
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions
