from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from pathlib import Path
import shutil
import os

from app.core.database import get_db
from app.services.auth_service import get_current_user
from app.schemas.user_profile import UserProfileUpdate, UserProfileOut
from app.services.user_service import update_user_profile
from app.models.models import User

router = APIRouter(prefix="/user", tags=["user"])

@router.get("/profile", response_model=UserProfileOut)
def read_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserProfileOut)
def update_profile(
    data: UserProfileUpdate = Depends(),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    image_path = None
    if image:
        if image.content_type not in ["image/jpeg", "image/png"]:
            raise HTTPException(status_code=400, detail="Formato de imagem inválido")
        
        user_folder = Path("storage/profile_images") / str(current_user.id)
        user_folder.mkdir(parents=True, exist_ok=True)
        
        file_path = user_folder / image.filename
        
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        # Converte para string com barra normal
        image_path = str(file_path).replace("\\", "/")

    # Atualizar user no service
    updated_user = update_user_profile(
        db=db,
        user=current_user,
        full_name=data.full_name,
        description=data.description,
        image_path=image_path,
    )

    return updated_user