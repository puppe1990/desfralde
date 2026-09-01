# Desfralde — Vivências Azuis

SaaS de PECS para desfralde de crianças autistas.

A mãe ou o pai cria a conta, passa por um wizard (responsáveis, crianças, terapeuta/professora) e monta o avatar da criança (pele, cabelo, gênero). Cada criança ganha um quadro com pedidos, rotina falada, passo a passo e estrelas.

## Rodar

```bash
cp .env.example .env
npm install
npm test
npm run dev
```

Abre http://localhost:3000. Sem Turso no desenvolvimento: usa `file:local.db`.

## Produção (Turso)

Crie um banco no [Turso](https://turso.tech) e configure:

```
DATABASE_URL=libsql://seu-banco.turso.io
TURSO_AUTH_TOKEN=...
NODE_ENV=production
```

Arquivo SQLite local é recusado em produção.

## Testes

```bash
npm test
```

O domínio (pack PECS, nome, estrelas, cursor da rotina) e o repositório (seed por criança, estrelas isoladas) rodam em libSQL `:memory:`.

## Stack

- **TanStack Start** — rotas, SSR e server functions
- **Turso / libSQL** — persistência das crianças, cartas e estrelas
- **Drizzle** — queries tipadas
- **Vitest** — TDD
