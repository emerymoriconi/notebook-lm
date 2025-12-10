# 📑 Web Application for Document Summarization

Este repositório contém o código-fonte e a documentação para o protótipo de uma aplicação web de gerenciamento e análise de documentos PDF, com a principal funcionalidade de gerar resumos individuais e integrados utilizando modelos de Large Language Model (LLM).

O projeto atende a todas as especificações funcionais e técnicas definidas no escopo.

---

## 🚀 Visão Geral do Protótipo

O objetivo do projeto é desenvolver um protótipo de aplicação web que permita aos usuários gerenciar documentos PDF e gerar resumos a partir deles, utilizando o poder dos LLMs.

### Funcionalidades Principais
- **Autenticação e Autorização**: Registro e login de usuários.
- **Gerenciamento de Arquivos**: Upload de documentos PDF (máximo de 50 MB por arquivo) e listagem/seleção de arquivos.
- **Processamento de Documentos**:
  - Geração de resumo de arquivo único.
  - Geração de resumo integrado de múltiplos arquivos.
- **Dashboard**: Interface principal para navegação, edição de perfil e acesso às funcionalidades.

---

## 🏗️ Arquitetura da Aplicação

A aplicação segue uma arquitetura baseada em backend e frontend, integrada a serviços de LLM e utilizando a infraestrutura AWS para deploy.

### 1. Backend
O backend é responsável pela lógica de negócios, gerenciamento de dados e integração com o LLM.

- **Tecnologia**: Python.
- **Framework Web**: FastAPI.  
- **Integração LLM**: LangChain para interagir com o modelo do Google Gemini.  
- **Armazenamento de Dados (RF-TEC-002)**:
  - Banco de dados PostgreSQL.

### 2. Frontend
O frontend fornece a interface do usuário para interagir com a aplicação.

- **Framework**: React.  

---

## 🌐 Endpoints Principais (Exemplos)

Embora os detalhes exatos dependam da implementação, a aplicação deve expor endpoints essenciais para suas funcionalidades:

| Módulo         | Funcionalidade                      | Método HTTP | Rota (Exemplo)                | Descrição                                                    |
|----------------|-------------------------------------|-------------|-------------------------------|--------------------------------------------------------------|
| Autenticação   | Registro de Usuário (RF-001)        | POST        | `/api/auth/register`          | Cria uma nova conta de usuário.                              |
| Autenticação   | Login (RF-001)                      | POST        | `/api/auth/login`             | Autentica o usuário e retorna um token.                      |
| Arquivos       | Upload de PDF (RF-002)              | POST        | `/api/files/upload`           | Faz o upload de um novo documento PDF (<= 50 MB).            |
| Arquivos       | Listagem de Arquivos (RF-003)       | GET         | `/api/files`                  | Retorna a lista de documentos do usuário.                    |
| Processamento  | Resumo Único (RF-004)               | POST        | `/api/summarize/single`       | Gera e armazena o resumo para um arquivo.                    |
| Processamento  | Resumo Múltiplo (RF-005)            | POST        | `/api/summarize/multiple`     | Gera e armazena o resumo integrado de múltiplos arquivos.    |
| Dashboard      | Edição de Perfil (RF-006)           | PUT         | `/api/profile`                | Atualiza as informações do perfil do usuário.                |

> Observação: autenticação por token (ex.: JWT) foi utilizada para proteger endpoints.

---

## ☁️ Deploy na AWS

O deploy do protótipo foi realizado na Amazon Web Services (AWS) seguindo as especificações de infraestrutura.

### 1. Infraestrutura
- **VPC (INF-001)**: Configuração de uma Virtual Private Cloud (VPC) dedicada, com subnets públicas e privadas e tabelas de rotas configuradas.
- **Grupos de Segurança (INF-002)**: Implementação de regras restritivas, permitindo apenas acesso HTTP/HTTPS (portas 80/443) e SSH restrito para administração.
- **EC2 (INF-003)**: Instância EC2 utilizada para hospedar o servidor de aplicação. O tipo de instância foi escolhido para ser adequado à carga esperada, permitindo acesso público via Internet.

### 2. Acesso à Aplicação
- A aplicação está acessível publicamente via Internet.  
- **URL de Acesso**: `http://3.144.236.184/login`

---

**Licença e Créditos**  
Autores: Émery Freitas Moriconi e Wesley de Sousa Coutinho.
