-----

### Passo 1: Atualizar `docker-compose.prod.yml`

Precisamos alterar a configuração do **frontend** para usar `build` (construir local) em vez de `image` (baixar pronto), mas mantemos o backend baixando do Hub.

Substitua o conteúdo de `docker-compose.prod.yml`:

```yaml
services:
  db:
    image: postgres:15-alpine
    container_name: notebook_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    restart: always

  backend:
    # BACKEND: Baixa a imagem pronta do Docker Hub (Rápido)
    # ATENÇÃO: Confirme se 'seu-usuario' está correto aqui
    image: seu-usuario/notebook-backend:latest
    container_name: notebook_api
    volumes:
      - ./storage_prod:/app/storage
    env_file:
      - .env
    environment:
      - DATABASE_URL=postgresql+psycopg2://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      - BACKEND_CORS_ORIGINS=${FRONTEND_URL}
    depends_on:
      - db
    command: >
      sh -c "alembic upgrade head && 
             uvicorn app.main:app --host 0.0.0.0 --port 8000"
    restart: always

  frontend:
    # FRONTEND: Constrói na hora (para pegar o IP da AWS corretamente)
    build:
      context: ./frontend
      args:
        # Pega a variável VITE_API_URL do arquivo .env da AWS
        - VITE_API_URL=${VITE_API_URL}
    container_name: notebook_web
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always

volumes:
  postgres_data:
```

-----

### Passo 2: Atualizar o `DEPLOY_AWS.md`

Como o Frontend precisa ser construído lá, a pessoa precisará do **código fonte**. Então, mudamos a instrução de "Copiar arquivos" para "Clonar o Repositório".

Substitua o conteúdo de `DEPLOY_AWS.md` por este novo tutorial:

````markdown
# ☁️ Guia de Deploy AWS (Híbrido)

Este guia realiza o deploy da aplicação NotebookLM. 
* **Backend:** Baixado pronto do Docker Hub.
* **Frontend:** Construído no servidor para configurar o IP correto.

### 1. Preparar a Instância
Conecte via SSH na sua instância Ubuntu:
```bash
ssh -i "chave.pem" ubuntu@SEU_IP_AWS
````

Instale o Docker e Docker Compose:

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2 git
sudo usermod -aG docker ubuntu
# Saia e entre novamente para aplicar as permissões
exit
```

### 2\. Baixar o Projeto

Reconecte no SSH e clone o repositório:

```bash
git clone [https://github.com/SEU-USUARIO/notebook-lm.git](https://github.com/SEU-USUARIO/notebook-lm.git)
cd notebook-lm
```

### 3\. Configurar Variáveis de Ambiente

Crie o arquivo `.env` de produção:

```bash
nano .env
```

**Cole este conteúdo (Ajuste o IP para o IP Público da AWS):**

```ini
# --- BANCO DE DADOS ---
POSTGRES_USER=admin_aws
POSTGRES_PASSWORD=senha_segura_aqui
POSTGRES_DB=notebook_db

# --- INFRAESTRUTURA (Ajuste o IP abaixo!) ---
# O Frontend usa essa URL para falar com o Back
VITE_API_URL=[http://54.20.10.123:8000](http://54.20.10.123:8000)

# O Backend usa essa URL para permitir conexão (CORS)
FRONTEND_URL=[http://54.20.10.123](http://54.20.10.123)

# --- CHAVES SECRETAS ---
SECRET_KEY=invente_uma_chave_complexa
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
GEMINI_API_KEY=sua_api_key_do_google
```

*(Salve com Ctrl+O, Enter, Ctrl+X)*

### 4\. Rodar o Deploy

Este comando vai baixar o Backend e compilar o Frontend com o IP que você definiu acima.

```bash
# Usa o arquivo de produção para subir os containers
docker compose -f docker-compose.prod.yml up -d --build
```

### 5\. Liberar Portas (AWS Security Group)

No painel da AWS, libere a entrada para:

  * **Porta 80 (HTTP):** Para acessar o site.
  * **Porta 8000 (TCP):** Para a API funcionar.

### ✅ Concluído

Acesse `http://SEU_IP_AWS` no navegador.

````

---

### Passo 3: Salvar e Enviar para o Git

Agora que o tutorial reflete a realidade (reconstruir o front), vamos salvar tudo na `main`.

```bash
# 1. Adiciona as alterações
git add docker-compose.prod.yml DEPLOY_AWS.md

# 2. Comita na branch atual
git commit -m "docs: atualiza guia de deploy para build hibrido do frontend"

# 3. Manda para a dev
git checkout dev
git pull origin dev
git merge fase/03-frontend-base
git push origin dev

# 4. Manda para a main (Onde a pessoa da infra vai pegar)
git checkout main
git pull origin main
git merge dev
git push origin main
````
