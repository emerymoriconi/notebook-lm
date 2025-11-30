import os
from pathlib import Path
import uuid
from typing import Tuple, IO

ALLOWED_EXTENSIONS = {".pdf"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB

def _secure_filename(filename: str) -> str:
    # remove caminhos e substitui caracteres problemáticos
    name = Path(filename).name
    # keep alnum, dash, underscore and dot; otherwise replace with underscore
    safe = "".join(c if c.isalnum() or c in "-_.()" else "_" for c in name)
    return safe

def allowed_file(filename: str) -> bool:
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS

def save_upload_file(upload_file, dest_folder: Path, max_size: int = MAX_FILE_SIZE) -> Tuple[Path, int]:
    """
    Salva UploadFile (Starlette/FastAPI) em dest_folder de forma segura em chunks.
    Retorna (path_salvo, tamanho_em_bytes).
    Lança ValueError se extensão inválida ou tamanho excede max_size.
    """
    dest_folder.mkdir(parents=True, exist_ok=True)
    original_name = upload_file.filename or "file"
    if not allowed_file(original_name):
        raise ValueError("Formato de arquivo não permitido. Apenas .pdf")

    safe_name = _secure_filename(original_name)
    # prefixar com uuid para evitar colisões
    unique_name = f"{uuid.uuid4().hex}_{safe_name}"
    dest_path = dest_folder / unique_name

    total_written = 0
    chunk_size = 1024 * 1024  # 1MB

    # upload_file.file is a SpooledTemporaryFile / file-like
    with open(dest_path, "wb") as buffer:
        # some UploadFile implementations provide .file
        file_object: IO = upload_file.file
        file_object.seek(0)
        while True:
            chunk = file_object.read(chunk_size)
            if not chunk:
                break
            total_written += len(chunk)
            if total_written > max_size:
                # remove partial file e abortar
                buffer.close()
                try:
                    dest_path.unlink(missing_ok=True)
                except Exception:
                    pass
                raise ValueError("Arquivo excede o tamanho máximo de 50 MB")
            buffer.write(chunk)

    # garantir que ponteiro volte ao início caso queira reusar UploadFile
    try:
        upload_file.file.seek(0)
    except Exception:
        pass

    return dest_path, total_written
