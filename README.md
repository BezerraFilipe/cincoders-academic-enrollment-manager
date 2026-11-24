## [Sistema de Matrícula](https://cincoders-enrollment-manager-web.vercel.app)

Sistema de matrícula de graduação com dois perfis:

- **Secretaria de Graduação:** cadastra disciplinas (com pré-requisitos) e professores, abre turmas e define as vagas.
- **Aluno:** se matricula nas turmas do semestre, cancela matrículas e acompanha quanto falta para concluir o curso.

Desenvolvido como teste prático do processo seletivo da Bolsa de Inovação Tecnológica em Engenharia de Software (CIn-UFPE).

---

## Stack

|   |   |
|---|---|
| Back-end | NestJS 12 + TypeScript |
| Banco de dados | PostgreSQL 16 + Prisma 7 |
| Front-end | React 19 + Vite + TanStack Query + Tailwind |
| Testes | Jest + Supertest (API), Vitest + Testing Library (web) |
| Infra | Docker Compose; CI/CD no GitHub Actions; API e banco na Railway; front na Vercel |

---

## Estrutura do repositório

```
/
├── apps/
│   ├── api/      # API NestJS (Prisma: schema, migrations e seed em apps/api/prisma e src/database)
│   └── web/      # App React + Vite
├── docs/         # Documentação do processo
├── .github/      # Pipeline de CI/CD
└── docker-compose.yml
```

---

## Deploy

| Serviço | URL |
|---|---|
| Front-end | https://cincoders-enrollment-manager-web.vercel.app |
| API | https://api-production-5758fb0c.up.railway.app |
| Documentação da API (Swagger) | https://api-production-5758fb0c.up.railway.app/docs |

> A raiz da API não tem rota. Use `/health` para conferir se ela e o banco estão no ar.

O repositório oficial fica no GitLab do CIn e é espelhado no GitHub. A cada push na `main`, o GitHub Actions roda lint, testes e build, e só então publica a API e o front.

---

## Como rodar do zero

> Requisito: Docker com Docker Compose.

```bash
git clone https://gitlab.cin.ufpe.br/fbms/cincoders-academic-enrollment-manager.git
cd cincoders-academic-enrollment-manager
docker compose up --build
```

Não é preciso configurar variáveis: o `docker-compose.yml` já define valores para uso local. Ao iniciar, a API **aplica as migrations e carrega os dados iniciais** automaticamente (a carga só acontece com o banco vazio).

| Serviço | Endereço |
|---|---|
| Front-end | http://localhost:8080 |
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/docs |

### Desenvolvimento e testes (sem Docker para API e front)

> Requisito: Node 24 (`.nvmrc` / `.tool-versions`).

```bash
docker compose up -d db

cd apps/api
cp .env.example .env
npm install
npm run db:migrate && npm run build && npm run db:seed
npm run start:dev               
npm test && npm run test:e2e    # os testes e2e usam o banco local

cd ../web
cp .env.example .env
npm install
npm run dev                    
npm test
```

---

## Usuários de teste

Senha de todos: **`Senha@123`**

| Perfil | E-mail | Situação no seed |
|---|---|---|
| Secretaria | secretaria@cin.ufpe.br | — |
| Aluna (Ciência da Computação) | ana.souza@cin.ufpe.br | reprovou e depois foi aprovada em IF671; tem excedente de eletivas de perfil (conta como livre); cursando IF673 |
| Aluno (Ciência da Computação) | bruno.costa@cin.ufpe.br | aprovado em IF669, reprovado em IF670; ocupa a única vaga de ET601 |
| Aluna (Engenharia da Computação) | carla.mendes@cin.ufpe.br | IF671 conta como eletiva de perfil no curso dela |
| Aluno (Engenharia da Computação) | daniel.alves@cin.ufpe.br | sem histórico |

Os dois cursos compartilham disciplinas com classificações diferentes (ex.: IF671 é obrigatória em CC e eletiva de perfil em EC).

---

## Requisito à escolha: pré-requisitos entre disciplinas

**Por que:** usa o histórico do aluno, que o sistema já modela, e é uma regra real e comum de qualquer matrícula.

**Regras:**

1. A secretaria define zero ou mais pré-requisitos para cada disciplina, no cadastro ou na edição.
2. O aluno só se matricula se tiver **aprovação no histórico** em todos os pré-requisitos. Matrícula ativa no pré-requisito não conta.
3. Uma disciplina não pode ser pré-requisito de si mesma, nem direta nem indiretamente (A → B → C → A é recusado).
4. Nas ofertas, o aluno vê quais pré-requisitos faltam antes de tentar se matricular, e o botão de matrícula fica desabilitado.
5. Uma disciplina que é pré-requisito de outra não pode ser excluída.

---

## Principais decisões

- **Monorepo** com API e front independentes; o contrato entre eles é a API HTTP, documentada no Swagger. 

- **Autenticação JWT com senha (bcrypt)** e guard global: toda rota é protegida por padrão, e as públicas são marcadas explicitamente. O aluno é sempre identificado **pelo token**, nunca por parâmetro, o que garante que ele só vê e altera os próprios dados.

- **Erros padronizados:** `{ statusCode, code, message }`, com 422 para regra de negócio e 409 para conflito. O front mostra a mensagem da API só para erros esperados.

- **Vagas ocupadas e progresso são calculados**, não armazenados; cancelar uma matrícula muda a situação para `CANCELLED` (não apaga).

- **Código em inglês**, interface e documentação em português.


---

## O que eu faria com mais tempo

- Melhoraria a documentação, evidenciando todas as etapas da egenharia de software que foram seguidas (especificação de requisitos, planejamento, gerenciamento do repo, arquitetura, desenvolvimento, testes, integração contínua e refatoração.)

- Seletores com busca no formulário de turmas (hoje carregam até 50 disciplinas e professores).

- Lista de espera para turmas lotadas e choque de horário.

---

## Documentação (em breve)

- [Contexto do produto](docs/000-contexto.md)
- [Requisitos](docs/001-requisitos.md)
- [Arquitetura](docs/002-arquitetura.md)
- [Backlog e sprints](docs/003-backlog.md)
- [API](docs/004-api.md)
- [Testes](docs/005-testes.md)
- [DevOps](docs/006-devops.md)
