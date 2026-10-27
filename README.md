# Marketplace — Front-end (DAW III - Projeto I)

Aplicação web front-end desenvolvida em **React 19 + Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4** e **shadcn/ui** para consumo da API REST do **Marketplace** (Spring Boot 4 + PostgreSQL 16 + JWT).

O sistema implementa o gerenciamento completo (**CRUD**) da entidade **Produto**, integrado com **Categorias**, **Vendedores** e **Avaliações**, controle de acesso por perfil (`ADMIN`, `VENDEDOR`, `CLIENTE`), filtros combinados, ordenação, estatísticas visuais, exportação de dados e suporte a tema Claro/Escuro.

---

## 1. Tecnologias Utilizadas

- **Framework:** Next.js 16.4 (App Router + Turbopack) e React 19.3
- **Linguagem:** TypeScript 5 (tipagem estrita de contratos e DTOs)
- **Estilização e UI:** Tailwind CSS v4, shadcn/ui (`@base-ui/react`) e Lucide Icons
- **Formulários e Validação:** React Hook Form + Zod + `@hookform/resolvers`
- **Feedback e Tema:** Sonner (notificações Toast) e `next-themes` (Dark/Light Mode)
- **Integração Back-end:** API REST em Spring Boot 4 (`http://localhost:8080`) via proxy `rewrites` do Next.js (`/api/:path*`)

---

## 2. Arquitetura de Pastas

O projeto adota separação estrita de responsabilidades em camadas (**RT01 / RT04**):

```text
src/
├── app/                              # Rotas do Next.js App Router
│   ├── layout.tsx                    # Layout raiz (ThemeProvider, AuthProvider, Header, Toaster)
│   ├── page.tsx                      # Redirecionamento inicial para /produtos
│   ├── login/page.tsx                # Autenticação JWT e cadastro rápido (Cliente/Vendedor)
│   └── produtos/
│       ├── page.tsx                  # Listagem com estatísticas, filtros, ordenação e paginação
│       ├── novo/page.tsx             # Criação de produto (POST /produtos)
│       └── [id]/
│           ├── page.tsx              # Detalhes do produto e lista de avaliações
│           └── editar/page.tsx       # Edição de produto (PATCH /produtos/{id})
├── components/
│   ├── auth/                         # LoginPage, LoginForm (com Demo 1-clique) e RegisterForm
│   ├── layout/                       # Header, ThemeProvider, ThemeToggle e RoleGuard
│   ├── produtos/                     # ProductStats, ProductFilters, ProductList, ProductCard,
│   │                                 # ProductForm, CategoriaQuickDialog, DeleteProductModal,
│   │                                 # ExportProductsButton e StockBadge
│   └── ui/                           # Componentes base do shadcn/ui
├── context/
│   └── AuthContext.tsx               # Estado global de sessão JWT (token, email, role) e guarda de rotas
├── lib/
│   ├── format.ts                     # Formatadores de moeda (BRL) e data/hora (pt-BR)
│   ├── form-errors.ts                # Mapeamento de erros ProblemDetail do back-end para campos RHF
│   └── utils.ts                      # Utilitários de classes CSS
├── services/                         # Camada de acesso a dados (nenhum componente chama fetch direto)
│   ├── api.ts                        # Cliente HTTP central com Bearer JWT e normalização ProblemDetail
│   ├── authService.ts                # Login e registro público de clientes/vendedores
│   ├── produtoService.ts             # CRUD completo e busca parametrizada de produtos
│   ├── categoriaService.ts           # CRUD e listagem completa de categorias
│   ├── vendedorService.ts            # Consulta e listagem completa de vendedores
│   ├── avaliacaoService.ts           # Consulta de avaliações por produto
│   └── seedService.ts                # População do banco de dados para testes (ADMIN)
└── types/                            # Contratos TypeScript (Produto, Categoria, Vendedor, Avaliacao,
                                      # Cliente, AuthResponse, Page<T>, ProblemDetail)
```

---

## 3. Como Executar o Projeto Passo a Passo

### 3.1. Pré-requisitos
- **Node.js** 20+ e `npm`
- **Java 17** e **Docker** (para executar a API back-end e o banco PostgreSQL)

### 3.2. Subindo o Back-end (API Spring Boot + PostgreSQL)
No diretório do repositório back-end do Marketplace:

```bash
# 1. Subir o container do PostgreSQL (porta 5433 do host)
docker compose up -d

# 2. Copiar o arquivo de configuração caso ainda não exista
cp application.properties.example src/main/resources/application.properties

# 3. Iniciar a API Spring Boot na porta 8080
./mvnw spring-boot:run
```
- A API estará disponível em `http://localhost:8080` (Swagger UI em `http://localhost:8080/swagger-ui/index.html`).

### 3.3. Subindo o Front-end (Next.js)
Neste diretório (`daw3-marketplace-front`):

```bash
# 1. Instalar as dependências
npm install --legacy-peer-deps

# 2. Iniciar o servidor de desenvolvimento
npm run dev
```
- Acesse **`http://localhost:3000`** no navegador.
- Todas as requisições para `/api/*` são redirecionadas automaticamente para `http://localhost:8080/*` via `rewrites` no `next.config.ts`, evitando bloqueios de CORS.

---

## 4. Credenciais de Teste e População Inicial (Seed)

Na tela de `/login`, utilize os botões de **Preenchimento Rápido (Demo)** ou informe manualmente:

| Perfil | E-mail | Senha | Observação |
|---|---|---|---|
| **ADMIN** | `admin@marketplace.com` | `admin123` | Criado automaticamente no primeiro boot do back-end |
| **VENDEDOR** | `vendedor1@eletronicos.com` | `senha123` | Disponível após clicar em **"Popular Banco (Seed)"** |
| **CLIENTE** | `cliente1@email.com` | `senha123` | Disponível após clicar em **"Popular Banco (Seed)"** |

> **Dica para avaliação:** Faça login primeiro como **Admin** (`Demo: Admin`) e clique no botão **"Popular Banco (Seed)"** localizado no cabeçalho superior (`Header`). Isso executará `POST /seed/popular`, gerando categorias, vendedores, clientes, produtos e avaliações de teste automaticamente.

---

## 5. Funcionalidades Implementadas

### Requisitos Obrigatórios
- **RF01 — CRUD Completo de Produto:**
  - **Criar (`POST /produtos`):** Formulário em `/produtos/novo` com atalho `+ Nova Categoria` em modal (`Dialog`).
  - **Listar (`GET /produtos` e `GET /produtos/buscar`):** Tabela no desktop e cards no mobile em `/produtos`.
  - **Detalhar (`GET /produtos/{id}`):** Página `/produtos/[id]` exibindo dados completos, estoque, vendedor e avaliações (`GET /avaliacoes`).
  - **Editar (`PATCH /produtos/{id}`):** Formulário pré-preenchido em `/produtos/[id]/editar`.
  - **Excluir (`DELETE /produtos/{id}`):** Modal de confirmação (`AlertDialog`) com tratamento específico para erro `409 Conflito` (produto vinculado a pedido).
- **RF02 — Persistência Real:** Integração integral com Spring Boot + PostgreSQL via JWT.
- **RF03 — Listagem Inteligente:** Filtro por nome (`LIKE` case-insensitive), categoria e faixa de preço (`precoMin` / `precoMax`), paginação do servidor (10 itens por página) e ordenação no cliente (preço menor/maior, nome A-Z e estoque).
- **RF04 — Validação de Formulários:** Esquemas `zod` + `react-hook-form` espelhando as anotações Bean Validation do back-end, além de mapeamento automático do mapa `erros` do `ProblemDetail` para os campos do formulário.
- **RF05 — Navegação e Controle de Acesso:** Rotas `/login`, `/produtos`, `/produtos/novo`, `/produtos/[id]` e `/produtos/[id]/editar` protegidas por `AuthProvider` e `RoleGuard`.
- **RF06 — Feedback Visual:** Esqueletos de carregamento (`Skeleton`), spinners em botões assíncronos, `AlertDialog` antes de exclusões e toasts `Sonner` exibindo mensagens de sucesso ou o campo `detail` do `ProblemDetail`.

### Recursos de Pontuação Extra (+10 Pontos)
1. **Tema Claro / Escuro (`next-themes`):** Alternância persistente no cabeçalho e na tela de login.
2. **Estatísticas e Mini-Gráfico (`ProductStats`):** Quatro cards no topo de `/produtos` exibindo Total no Catálogo (`totalElements`), Preço Médio da página, Unidades em Estoque (com alerta de itens críticos ≤ 5) e barra proporcional de Distribuição por Categoria.
3. **Exportação de Dados (`ExportProductsButton`):** Exportação instantânea dos produtos listados para `.CSV` (compatível com Excel/UTF-8 BOM) ou `.JSON`.

---

## 6. Capturas de Tela (Prints)

> _Espaço reservado para inserção das capturas de tela da entrega final:_

- **Tela de Login e Cadastro Rápido (`/login`):**
  `![Tela de Login](./docs/prints/01-login.png)`
- **Listagem de Produtos, Estatísticas e Filtros (`/produtos`):**
  `![Listagem de Produtos](./docs/prints/02-listagem.png)`
- **Cadastro de Produto e Modal de Nova Categoria (`/produtos/novo`):**
  `![Novo Produto](./docs/prints/03-novo-produto.png)`
- **Detalhes do Produto e Avaliações (`/produtos/[id]`):**
  `![Detalhes do Produto](./docs/prints/04-detalhes.png)`
- **Modal de Confirmação de Exclusão e Tratamento de Conflito 409:**
  `![Modal de Exclusão](./docs/prints/05-exclusao.png)`
- **Alternância de Tema Claro/Escuro e Responsividade Mobile:**
  `![Tema Escuro e Mobile](./docs/prints/06-mobile-dark.png)`
