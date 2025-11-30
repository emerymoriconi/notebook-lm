from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.services.auth_service import get_current_user  
from app.models.models import File as FileModel
from app.schemas.file import FileOut
from app.utils.files import save_upload_file

router = APIRouter(prefix="/files", tags=["files"])

STORAGE_ROOT = Path.cwd() / "storage"


@router.get("", response_model=List[FileOut])
def list_files(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Lista todos os arquivos pertencentes ao usuário logado.
    """
    files = db.query(FileModel).filter(FileModel.user_id == current_user.id).order_by(FileModel.upload_date.desc()).all()
    return files


@router.get("/{file_id}", response_model=FileOut)
def get_file_metadata(file_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Retorna metadados do arquivo (sem enviar o conteúdo).
    Útil para mostrar lista e detalhes sem baixar.
    """
    file_rec = db.query(FileModel).filter(FileModel.id == file_id).first()
    if not file_rec:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")
    if file_rec.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Não autorizado a acessar este arquivo")
    return file_rec


@router.get(
    "/{file_id}/download",
    responses={
        200: {
            "content": {"application/pdf": {"schema": {"type": "string", "format": "binary"}}},
            "description": "PDF file (application/pdf)"
        },
        401: {"description": "Unauthorized"},
        403: {"description": "Forbidden"},
        404: {"description": "Not found"}
    },
)
def download_file(file_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    """
    Retorna o PDF como FileResponse (streaming).
    Verifica pertencimento e existência do arquivo.
    """
    file_rec = db.query(FileModel).filter(FileModel.id == file_id).first()
    if not file_rec:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")

    if file_rec.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Não autorizado a acessar este arquivo")

    # Montar path absoluto
    stored_path = Path.cwd() / file_rec.file_path 

    if not stored_path.exists() or not stored_path.is_file():
        raise HTTPException(status_code=404, detail="Arquivo armazenado não encontrado no servidor")

    # Retornar via FileResponse (usa streaming sob o capô)
    return FileResponse(
        path=str(stored_path),
        media_type="application/pdf",
        filename=file_rec.file_name,
        headers={
            "Content-Disposition": f'attachment; filename="{file_rec.file_name}"'
        }
    )


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
