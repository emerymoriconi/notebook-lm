from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings

class LLMError(Exception):
    """Erros vindos do serviço de LLM."""
    pass


def get_llm():
    """
    Cria instância do modelo Gemini configurada para resumos.
    Separado em função para facilitar testes e reuso.
    """
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            api_key=settings.GEMINI_API_KEY,
            temperature=0.3,
        )
        return llm
    except Exception as e:
        raise LLMError(f"Falha ao inicializar modelo Gemini: {e}")


# Função que gera resumo
def generate_summary(text: str) -> str:
    if not text or len(text.strip()) == 0:
        raise LLMError("Texto vazio recebido para sumarização.")

    llm = get_llm()

    prompt = f"""
    Resuma o texto abaixo em um parágrafo claro, bem organizado e objetivo, em português, mantendo os pontos mais relevantes e integrando ideias de forma inteligente, fazendo conexões necessárias.
    
    TEXTO:
    {text}
    """

    try:
        response = llm.invoke(prompt)
        return response.content
    except Exception as e:
        raise LLMError(f"Erro durante chamada ao LLM: {e}")
