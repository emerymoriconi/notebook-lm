from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pathlib import Path

from app.core.database import get_db
from app.core.config import settings
from app.services.auth_service import get_current_user


from app.models.models import File as FileModel
from app.schemas.summary import SummaryOut, SummaryCreateMulti
from app.services.summary import create_summary, get_summaries_by_user, get_summary_by_id
from app.utils.pdf_reader import extract_pdf_text
from app.services.llm_client import generate_summary

router = APIRouter(prefix="/summary", tags=["summary"])


@router.post("/single", response_model=SummaryOut)
def summarize_single_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 1. Buscar arquivo no banco
    file_rec = db.query(FileModel).filter(FileModel.id == file_id).first()

    if not file_rec:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")

    # 2. Verificar se pertence ao usuário logado
    if file_rec.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Você não pode acessar este arquivo")

    # 3. Montar o caminho do PDF
    pdf_path = Path(file_rec.file_path)
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="PDF não encontrado no servidor")

    # 4. Extrair texto
    text = extract_pdf_text(str(pdf_path))
    if not text.strip():
        raise HTTPException(status_code=400, detail="PDF não contém texto legível")

    # 5. Gerar resumo usando LLM
    summary_text = generate_summary(text)

    # 6. Salvar no banco
    summary = create_summary(
        db=db,
        file_ids=str(file_id),
        content=summary_text,
        user_id=current_user.id,
        is_consolidated=0
    )

    # 7. Retornar ao usuário
    return summary


@router.post("/multi", response_model=SummaryOut)
def summarize_multi_files(payload: SummaryCreateMulti,
                          db: Session = Depends(get_db),
                          current_user = Depends(get_current_user)):
    
    file_ids = payload.file_ids

    if not file_ids:
        raise HTTPException(400, "Envie pelo menos 1 ID")

    files = db.query(FileModel).filter(FileModel.id.in_(file_ids)).all()

    if len(files) != len(file_ids):
        raise HTTPException(404, "Algum arquivo não foi encontrado")

    for f in files:
        if f.user_id != current_user.id:
            raise HTTPException(403, "Você não tem acesso a um dos arquivos")

    full_text = ""

    for f in files:
        text = extract_pdf_text(f.file_path)
        full_text += "\n\n" + text

    if not full_text.strip():
        raise HTTPException(400, "Os PDFs não possuem texto legível")

    summary_text = generate_summary(full_text)

    new_summary = create_summary(
        db=db,
        file_ids=",".join(map(str, file_ids)),
        content=summary_text,
        user_id=current_user.id,
        is_consolidated=1
    )

    db.add(new_summary)
    db.commit()
    db.refresh(new_summary)

    return new_summary


@router.get("/", response_model=list[SummaryOut])
def list_summaries(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):

    summaries = get_summaries_by_user(db, current_user.id)
    return summaries


@router.get("/{summary_id}", response_model=SummaryOut)
def get_summary(
    summary_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    summary = get_summary_by_id(db, summary_id)

    if not summary:
        raise HTTPException(404, "Resumo não encontrado")

    if summary.user_id != current_user.id:
        raise HTTPException(403, "Você não tem acesso a este resumo")

    return summary