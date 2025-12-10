☁️ Guia de Deploy AWS (Via Docker Hub)
Este guia assume que você já lançou uma instância EC2 (Ubuntu) e tem a chave .pem para acesso SSH.

1. Conectar na Instância
Abra seu terminal na pasta onde está a chave .pem:

Bash

# Ajuste as permissões da chave (se for Linux/Mac)
chmod 400 chave-acesso.pem

# Conecte (Troque pelo IP público da sua AWS)
ssh -i "chave-acesso.pem" ubuntu@54.20.10.123
2. Instalar Docker na AWS
Ao logar, cole estes comandos para instalar o Docker (copie e cole o bloco todo):

Bash

# Atualizar sistema
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg

# Instalar Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Dar permissão ao usuário ubuntu (para não usar sudo no docker)
sudo usermod -aG docker ubuntu
🔴 IMPORTANTE: Após rodar isso, digite exit para sair e conecte via SSH novamente para as permissões funcionarem.

3. Transferir Arquivos de Configuração
Você não precisa clonar o repositório inteiro com o código fonte. Você só precisa de 2 arquivos:

docker-compose.prod.yml

.env (com as senhas de produção)

Método Fácil (Criar arquivos direto lá):

Crie a pasta do projeto:

Bash

mkdir app && cd app
Crie o .env:

Bash

nano .env
Cole o conteúdo:

Ini, TOML

POSTGRES_USER=admin_aws
POSTGRES_PASSWORD=senha_super_secreta
POSTGRES_DB=notebook_db
# IP da AWS
VITE_API_URL=http://54.20.10.123:8000
FRONTEND_URL=http://54.20.10.123

# Chaves secretas do Backend (Obrigatório)
SECRET_KEY=gere_uma_chave_nova_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
GEMINI_API_KEY=sua_chave_do_google_aqui
(Salve com Ctrl+O, Enter, e saia com Ctrl+X)

Crie o docker-compose.yml:

Bash

nano docker-compose.yml
Cole o conteúdo do seu arquivo docker-compose.prod.yml que criamos na Parte 1. (Salve e saia).

4. Rodar a Aplicação
Agora a mágica acontece. Como as imagens estão no Docker Hub, o servidor vai apenas baixá-las (rápido).

Bash

docker compose up -d
5. Configurar Segurança (Firewall AWS)
Não esqueça de ir no painel da AWS (Security Groups) da sua instância e liberar as portas:

SSH: 22 (Seu IP)

HTTP: 80 (Frontend - Qualquer lugar 0.0.0.0/0)

Custom TCP: 8000 (Backend - Qualquer lugar 0.0.0.0/0)

✅ Pronto!
Acesse http://54.20.10.123 (sem porta) e sua aplicação estará rodando.