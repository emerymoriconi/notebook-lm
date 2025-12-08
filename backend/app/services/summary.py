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


def get_summaries_by_user(db: Session, user_id: int):
    """
    Retorna todos os resumos pertencentes ao usuário.
    """
    return db.query(Summary).filter(Summary.user_id == user_id).all()


def get_summary_by_id(db: Session, summary_id: int):
    """
    Retorna resumo pelo ID (ou None).
    """
    return db.query(Summary).filter(Summary.id == summary_id).first()