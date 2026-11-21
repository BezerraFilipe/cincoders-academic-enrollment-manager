# cincoders-academic-enrollment-manager

# Sistema de Matrícula

Sistema de matrícula de graduação com dois perfis de acesso: **Secretaria de Graduação**, que gerencia disciplinas, professores e turmas, e **Aluno**, que se matricula nas turmas do semestre e acompanha seu progresso no curso.

Desenvolvido como teste prático para vaga de Engenheiro de Software no CIn-UFPE.

## Estrutura do repositório

| Pasta | Conteúdo |
|---|---|
| `apps/api` | Back-end (NestJS + Prisma + PostgreSQL) |
| `apps/web` | Front-end (React + Vite) |
| `docs` | Documentação do processo: requisitos, arquitetura, backlog, API, testes e DevOps |

## Documentação

1. [Requisitos](docs/01-requisitos.md)
2. [Arquitetura](docs/02-arquitetura.md)
3. [Backlog](docs/03-backlog.md)

## Como executar

Pré-requisito: [Docker](https://docs.docker.com/get-docker/) com Docker Compose.

```bash
docker compose up --build
```

| Serviço | Endereço |
|---|---|
| Front-end | http://localhost:8080 |
| API | http://localhost:3000 |
| Documentação da API (Swagger) | http://localhost:3000/docs |
| PostgreSQL | `localhost:5432` (usuário, senha e banco: `enrollment`) |

As migrations do banco são aplicadas automaticamente quando a API inicia.

### Desenvolvimento local (sem Docker para API e front)

```bash
docker compose up -d db

cd apps/api
cp .env.example .env
npm install
npm run start:dev

cd ../web
cp .env.example .env
npm install
npm run dev
```

O front-end fica em http://localhost:5173 e a API em http://localhost:3000.