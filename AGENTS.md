# Desfralde

PECS de desfralde genérico (Vivências Azuis).

## Commands

- `npm test` — Vitest (domínio + store libSQL em memória)
- `npm run dev` — TanStack Start em :3000
- `npm run generate-routes` — regenera `src/routeTree.gen.ts`

## Layout

- `src/domains/` — regras puras (pack, nome, estrelas, cursor)
- `src/db/` — Turso/libSQL + Drizzle
- `src/server/` — `createServerFn`
- `src/routes/` — páginas
- `public/pecs/` — ilustrações padrão

## Rules

- Novo comportamento começa por teste que falha.
- Produção exige `DATABASE_URL` libSQL; `file:` só em dev.
- Cartões padrão não nomeiam uma criança específica.
