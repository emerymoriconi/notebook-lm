from pydantic import BaseModel
from datetime import datetime


class SummaryCreateSingle(BaseModel):
    file_id: int
    content: str


class SummaryCreateMulti(BaseModel):
    file_ids: list[int]
    content: str


class SummaryOut(BaseModel):
    id: int
    file_ids: str
    summary_text: str
    created_at: datetime

    class Config:
        from_attributes = True