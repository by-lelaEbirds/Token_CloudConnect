<p align="center">
  <img src="logo.png" alt="CloudConnect Logo" width="200"/>
</p>

<h1 align="center">CloudConnect</h1>

<p align="center">
  <strong>Um web app moderno para cadastro de clientes com persistência de dados na nuvem via API do Airtable.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-concluído-green?style=for-the-badge" alt="Status do Projeto">
  <img src="https://img.shields.io/badge/licença-MIT-blue?style=for-the-badge" alt="Licença">
</p>

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [🎥 Demonstração](#-demonstração)
- [🛠️ Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [🚀 Como Rodar o Projeto](#-como-rodar-o-projeto)
- [🔗 Diagrama de Sequência](#-diagrama-de-sequência)
- [🧠 Reflexão e Aprendizados](#-reflexão-e-aprendizados)

## 📌 Visão Geral

**CloudConnect** é a solução desenvolvida para a **Missão 5**, com o objetivo de construir um web app com funcionalidades de CRUD (Create, Read, Delete) e persistência de dados em nuvem. O projeto utiliza a API REST do **Airtable** como backend, permitindo a manipulação de registros de clientes através de uma interface moderna, responsiva e com temas claro e escuro.

A aplicação foi desenhada com foco na experiência do usuário (UX), apresentando um design premium com efeitos de _glassmorphism_, fundo dinâmico e animações sutis que garantem uma interação fluida e agradável.

## 🎥 Demonstração

O fluxo completo de CRUD (criar, ler, buscar e deletar um cliente) em ação:

<p align="center">
  <img src="demo.gif" alt="Demonstração do App CloudConnect" width="800"/>
</p>

**[➡️ Link para o App Publicado](COLAR DEPOIS QUE EU TERMINAR)**

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando as seguintes tecnologias:

-   **Frontend:**
    -   `HTML5`: Estrutura semântica do conteúdo.
    -   `CSS3`: Estilização avançada, responsividade, _glassmorphism_ e temas.
    -   `JavaScript (ES6+)`: Manipulação do DOM, lógica da aplicação e interatividade.
    -   `Fetch API`: Realização de requisições HTTP assíncronas para a API.

-   **Backend & Nuvem:**
    -   `Airtable`: Utilizado como banco de dados NoSQL e backend (BaaS), gerenciado via API REST.

-   **Ferramentas e Conceitos:**
    -   `Git & GitHub`: Versionamento e hospedagem do código.
    -   `API REST`: Comunicação com o backend através dos verbos HTTP (GET, POST, DELETE).
    -   `JSON`: Formato para troca de dados entre o frontend e a API.

## 🚀 Como Rodar o Projeto

Siga os passos abaixo para configurar e executar o projeto em sua máquina local.

### **1. Pré-requisitos**

-   Uma conta no [Airtable](https://airtable.com/).
-   Um servidor estático local (como o Live Server do VS Code ou o módulo `http.server` do Python).

### **2. Configuração do Airtable**

1.  **Crie uma Base:** No seu workspace do Airtable, crie uma nova base chamada `DBX_CloudConnect`.
2.  **Crie a Tabela:** Dentro da base, renomeie a tabela padrão para `Clientes`.
3.  **Defina os Campos:** Configure a tabela `Clientes` com os seguintes campos (pode deletar os campos extras):
    -   `nome` (Single line text)
    -   `telefone` (Phone number)
    -   `email` (Email)
4.  **Obtenha as Credenciais:**
    -   **Base ID:** Acesse a [documentação da API](https://airtable.com/developers/web/api/introduction) e selecione a base `DBX_CloudConnect`. O Base ID (começando com `app...`) estará visível.
    -   **Token (PAT):** Acesse a [página de tokens](https://airtable.com/create/tokens) e gere um novo _Personal Access Token_. Configure os escopos (`scopes`) para `data.records:read` e `data.records:write`. Restrinja o acesso (`access`) apenas à base `DBX_CloudConnect`.

### **3. Instalação Local**

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/by-lelaEbirds/Token_CloudConnect
    ```
2.  **Navegue até a pasta do projeto:**
    ```bash
    cd nome-da-pasta
    ```
3.  **Inicie um servidor local:**
    -   Se você usa o VS Code, clique com o botão direito no `index.html` e selecione "Open with Live Server".
    -   Ou, usando Python (se tiver instalado):
    ```bash
    python -m http.server
    ```
    Acesse `http://localhost:8000` em seu navegador.

4.  **Configure no App:**
    -   Com o app aberto, clique no botão **⚙️ Credenciais**.
    -   Cole o **Token**, o **Base ID** e o nome da tabela (`Clientes`) nos campos correspondentes.
    -   Clique em salvar e comece a usar! As credenciais ficarão salvas no `localStorage` do seu navegador.

## 🔗 Diagrama de Sequência

O diagrama abaixo ilustra o fluxo de comunicação entre o frontend (navegador) e a API do Airtable para as principais operações.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Airtable API

    User->>Frontend: Preenche e envia formulário de novo cliente
    Frontend->>Airtable API: POST /v0/{baseId}/Clientes (Body: JSON, Auth: Bearer Token)
    Airtable API-->>Frontend: 200 OK (JSON com novo registro)
    Frontend->>User: Atualiza a lista na tela com o novo cliente

    User->>Frontend: Acessa a página
    Frontend->>Airtable API: GET /v0/{baseId}/Clientes (Auth: Bearer Token)
    Airtable API-->>Frontend: 200 OK (JSON com todos os registros)
    Frontend->>User: Exibe a lista de clientes carregada

    User->>Frontend: Clica no botão de excluir
    Frontend->>Airtable API: DELETE /v0/{baseId}/Clientes/{recordId} (Auth: Bearer Token)
    Airtable API-->>Frontend: 200 OK (JSON com confirmação)
    Frontend->>User: Remove o cliente da lista na tela
