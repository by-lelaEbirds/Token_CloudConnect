# CloudConnect — Missão 5 (Airtable CRUD)

Projeto: cadastro simples de **Clientes** com persistência via **Airtable API**.

## O que está incluso
- `index.html` — interface (formulário + lista + modal de credenciais)
- `style.css` — design Apple-inspired com glassmorphism (tema claro/escuro)
- `app.js` — lógica: Create, Read, Delete (CRUD mínimo) + credenciais via modal/localStorage
- `README.md` — este arquivo

## Como usar (local)
1. Clone ou faça upload desses arquivos para o repositório GitHub (raiz do repo).
2. Abra via servidor estático (recomendado):
   ```bash
   python -m http.server 5500
   # e acesse http://localhost:5500
   ```
   Ou use Live Server (VS Code) / Replit.

3. Clique em **⚙️ Credenciais** e cole:
   - **Token** (PAT) — comece com `pat...` (gere em https://airtable.com/create/tokens)
   - **Base ID** — (ex.: `appXXXXXXXXXXXX`) — veja em https://airtable.com/api
   - **Table Name** — `Clientes` (padrão)

4. Salve e use o formulário para adicionar clientes. A lista será carregada da base Airtable.

## Notas de segurança
- **Não** coloque o token embutido no código em repositórios públicos. Use o modal local (o app salva em `localStorage`) ou um proxy server em backend para proteger o token.
- Em entregas acadêmicas, use um token com escopo restrito à base criada.

## Diagrama de sequência (simplificado)
```
Frontend (browser) -> Airtable API: GET /POST /DELETE (Authorization: Bearer pat...)
Airtable -> Frontend: JSON (records)
```

## O que foi entregue
- UI com glassmorphism, bordas arredondadas e animações leves.
- Create + Read + Delete funcionando.
- Busca case-insensitive por nome (armazena `nome` em lowercase no Airtable para consistência).
- Tema claro por padrão e modo escuro via botão.

## Próximos passos (opcionais)
- Implementar PATCH (edição inline/modal) — bônus.
- Implementar proxy Node (.env) para esconder token (recomendado para produção).
- Gerar GIF curto demonstrando o fluxo CRUD para anexar no repositório.

---
Desconforto não é perigo.
Isso é vida normal. O TOC quer exagero, mas eu sigo a razão.
