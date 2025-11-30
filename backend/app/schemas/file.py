from pydantic import BaseModel
from datetime import datetime

class FileOut(BaseModel):
    id: int
    file_name: str
    file_path: str
    file_size: int
    upload_date: datetime

    class Config:
        orm_mode = True