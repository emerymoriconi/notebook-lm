from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
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

def generate_summary(text: str) -> str:
    if not text or len(text.strip()) == 0:
        raise LLMError("Texto vazio recebido para sumarização.")

    llm = get_llm()


    prompt_template = ChatPromptTemplate.from_messages([
        (
            "system",
            "Você é um especialista em síntese de conhecimento e análise crítica (estilo NotebookLM). "
            "Sua tarefa NÃO é apenas resumir, mas **conectar as ideias** presentes no texto fornecido. "
            "Identifique os temas centrais, cruze as informações e apresente uma narrativa coesa e concisa. "
            "Se houver múltiplos tópicos ou documentos no texto, mostre a relação entre eles (causa/efeito, contraste ou complemento). "
            "Responda em português, de forma direta e estruturada."
        ),
        ("human", "{texto_para_analise}")
    ])

    try:
        chain = prompt_template | llm
        response = chain.invoke({"texto_para_analise": text})
        
        return response.content
    except Exception as e:
        raise LLMError(f"Erro durante chamada ao LLM: {e}")