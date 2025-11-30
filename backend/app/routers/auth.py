from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app.schemas.auth import UserCreate, UserOut, Token
from app.core.database import get_db
from app.services.auth_service import (
    create_user,
    authenticate_user,
    create_access_token,
)
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # checar se username/email já existe
    from app.services.auth_service import get_user_by_username, get_user_by_email
    if get_user_by_username(db, user_in.username):
        raise HTTPException(status_code=400, detail="Username já existe")
    if get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    user = create_user(db, user_in)
    return user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2PasswordRequestForm fornece 'username' e 'password' via form-data
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    # vou armazenar como 'user_id' no payload
    token = create_access_token(data={"user_id": user.id}, expires_delta=access_token_expires)
    return {"access_token": token, "token_type": "bearer"}
