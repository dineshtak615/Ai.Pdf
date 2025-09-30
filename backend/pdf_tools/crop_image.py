import uuid
from typing import Tuple
from venv import logger

from PIL import Image
import os

# def crop_image(input_path, crop_box, output_path=None):
#     """
#     crop_box: (left, upper, right, lower) coordinates
#     """
#     with Image.open(input_path) as img:
#         cropped_img = img.crop(crop_box)
#         if not output_path:
#             output_path = input_path.replace(".", "_cropped.")
#         cropped_img.save(output_path)
#     return output_path


def _generate_unique_path(output_dir: str, prefix: str, extension: str) -> str:
    """Generate a unique file path with the given prefix and extension."""
    return os.path.join(output_dir, f"{prefix}_{uuid.uuid4().hex}.{extension}")


class PDFProcessingError(Exception):
    pass


def crop_image(image_path: str, crop_box: Tuple[int, int, int, int], output_dir: str) -> str:
    """Crop an image with the given box (left, upper, right, lower)."""
    try:
        image = Image.open(image_path)
        output_path = _generate_unique_path(output_dir, "cropped", image.format.lower())
        cropped_image = image.crop(crop_box)
        cropped_image.save(output_path)
        logger.debug(f"Cropped {image_path}")
        return output_path
    except Exception as e:
        logger.error(f"Failed to crop {image_path}: {str(e)}")
        raise PDFProcessingError(f"Failed to crop image: {str(e)}")
