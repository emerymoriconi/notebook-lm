from sqlalchemy.orm import Session
from app.models.models import Summary

def create_summary(db: Session, file_ids: str, content: str, user_id: int, is_consolidated: int):
    summary = Summary(
        file_ids=file_ids,
        summary_text=content,
        user_id=user_id,
        is_consolidated=is_consolidated
    )
    db.add(summary)
    db.commit()
    db.refresh(summary)
    return summary