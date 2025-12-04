from PyPDF2 import PdfReader
from pathlib import Path

class PDFExtractionError(Exception):
    """Erro personalizado para PDFs inválidos."""
    pass


def extract_pdf_text(path: str) -> str:
    """
    Extrai o texto de um PDF.
    
    :param path: Caminho absoluto do PDF no servidor.
    :return: Texto concatenado de todas as páginas.
    :raises PDFExtractionError: Se o PDF estiver corrompido ou ilegível.
    """

    pdf_path = Path(path)

    if not pdf_path.exists():
        raise PDFExtractionError(f"Arquivo não encontrado: {path}")

    try:
        reader = PdfReader(str(pdf_path))

        # Verifica se está criptografado (muitas libs não destravam)
        if reader.is_encrypted:
            try:
                reader.decrypt("")  # tenta sem senha
            except Exception:
                raise PDFExtractionError("PDF está criptografado e não pode ser lido.")

        extracted_text = ""

        for i, page in enumerate(reader.pages):
            try:
                page_text = page.extract_text() or ""
                extracted_text += page_text + "\n"
            except Exception as e:
                raise PDFExtractionError(f"Erro ao ler página {i}: {e}")

        if extracted_text.strip() == "":
            raise PDFExtractionError("Nenhum texto pôde ser extraído do PDF.")

        return extracted_text

    except PDFExtractionError:
        raise

    except Exception as e:
        raise PDFExtractionError(f"Erro ao abrir PDF: {e}")