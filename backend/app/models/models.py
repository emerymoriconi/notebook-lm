from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120))
    username = Column(String(50), unique=True, index=True)
    email = Column(String(120), unique=True, index=True)
    password_hash = Column(String(256))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relações
    files = relationship("File", back_populates="owner", cascade="all, delete")
    summaries = relationship("Summary", back_populates="owner", cascade="all, delete")


class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(200))
    file_path = Column(String(300))
    file_size = Column(Integer)
    upload_date = Column(DateTime, default=datetime.utcnow)
    
    user_id = Column(Integer, ForeignKey("users.id"))

    # Relação reversa
    owner = relationship("User", back_populates="files")


class Summary(Base):
    __tablename__ = "summaries"

    id = Column(Integer, primary_key=True, index=True)
    summary_text = Column(Text)
    is_consolidated = Column(Integer)  # 0 = não, 1 = sim
    created_at = Column(DateTime, default=datetime.utcnow)

    # Para resumos múltiplos (salvo como string JSON ou IDs concatenados)
    file_ids = Column(String)  # ex: "1,4,10"

    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="summaries")
