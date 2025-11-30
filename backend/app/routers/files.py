from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pathlib import Path
from datetime import datetime

from app.core.database import get_db
from app.services.auth_service import get_current_user  
from app.models.models import File as FileModel
from app.schemas.file import FileOut
from app.utils.files import save_upload_file

router = APIRouter(prefix="/files", tags=["files"])

STORAGE_ROOT = Path.cwd() / "storage"

@router.post("/upload", response_model=FileOut, status_code=status.HTTP_201_CREATED)
def upload_file(
    upload: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    # 1) salvar arquivo no disco (valida extensão e tamanho dentro da função)
    try:
        user_folder = STORAGE_ROOT / str(current_user.id)
        saved_path, size = save_upload_file(upload, user_folder)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Erro ao salvar arquivo")

    # 2) registrar metadados no banco
    file_record = FileModel(
        file_name = upload.filename or saved_path.name,
        file_path = str(saved_path.relative_to(Path.cwd())),  # caminho relativo
        file_size = size,
        upload_date = datetime.utcnow(),
        user_id = current_user.id
    )
    db.add(file_record)
    db.commit()
    db.refresh(file_record)

    return file_record
