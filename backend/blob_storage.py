import os
import aiofiles
import uuid
from PIL import Image
from fastapi import UploadFile, HTTPException
from typing import Optional

UPLOAD_DIR = "uploads"
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

async def save_uploaded_file(file: UploadFile, folder: str = "images") -> str:
    """Save uploaded file and return the file path"""
    
    # Validate file extension
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"File type {file_extension} not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Create upload directory if it doesn't exist
    upload_path = os.path.join(UPLOAD_DIR, folder)
    os.makedirs(upload_path, exist_ok=True)
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(upload_path, unique_filename)
    
    # Save file
    try:
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            
            # Check file size
            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB")
            
            await f.write(content)
        
        # Optimize image if it's an image file
        if file_extension in {".jpg", ".jpeg", ".png"}:
            optimize_image(file_path)
        
        return f"/{file_path}"
        
    except Exception as e:
        # Clean up file if something went wrong
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

def optimize_image(file_path: str, max_width: int = 800, max_height: int = 600, quality: int = 85):
    """Optimize image size and quality"""
    try:
        with Image.open(file_path) as img:
            # Convert to RGB if necessary
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            
            # Resize if too large
            img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
            
            # Save with optimization
            img.save(file_path, "JPEG", quality=quality, optimize=True)
    except Exception as e:
        print(f"Failed to optimize image {file_path}: {e}")

def delete_file(file_path: str) -> bool:
    """Delete a file from the filesystem"""
    try:
        if file_path.startswith("/"):
            file_path = file_path[1:]  # Remove leading slash
        
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception:
        return False
