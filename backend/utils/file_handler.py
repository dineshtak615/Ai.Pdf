import os
from werkzeug.utils import secure_filename
from utils.helpers import generate_unique_filename

UPLOAD_FOLDER = "uploads"

def save_uploaded_file(file):
    """
    Saves the uploaded file with a unique name to prevent collisions.
    Returns the full path.
    """
    filename = secure_filename(file.filename)
    unique_filename = generate_unique_filename(filename)
    file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
    file.save(file_path)
    return file_path

def delete_file(path):
    """
    Safely deletes a file if it exists.
    """
    try:
        if os.path.exists(path):
            os.remove(path)
            return True
    except Exception:
        pass
    return False
