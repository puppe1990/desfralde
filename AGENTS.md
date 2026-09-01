# Desfralde — regras para agentes

PECS de desfralde (Vivências Azuis). TanStack Start + Drizzle + Turso/libSQL.

## Commands

- `npm test` — Vitest (domínio + store em `:memory:`)
- `npm run ci` — prettier check + eslint + testes
- `npm run dev` — http://127.0.0.1:3000
- `npm run generate-routes` — regenera `src/routeTree.gen.ts` após criar rota
- `python3 scripts/build-icons.py` — favicon e ícones PWA

## Layout

```
src/domains/     regras puras (sem I/O)
src/db/          Drizzle + queries por domínio
src/server/      createServerFn
src/routes/      páginas (file routes)
src/components/  UI
public/pecs/     ilustrações padrão
```

Store: `createDesfraldeStore` em `src/db/desfralde-store.ts` compõe
`user-account-queries`, `family-queries`, `child-board-queries`,
`potty-event-queries`, `star-mark-queries`. Testes usam
`openMemoryDesfraldeStore()`.

## Code style

- Functions: 4-20 lines. Split if longer.
- Files: under 500 lines (target 200-300). Split by responsibility.
- One thing per function, one responsibility per module (SRP).
- Names: specific and unique. Avoid `data`, `handler`, `Manager`.
  Prefer names that return <5 grep hits in the codebase.
- Types: explicit. No `any`, no untyped public functions.
- No code duplication. Extract shared logic into a function/module.
- Early returns over nested ifs. Max 2 levels of indentation for control flow.
- Exception messages must include the offending value and expected shape.

## Comments

- Keep intent/provenance comments. Don't strip them on refactor.
- Write WHY, not WHAT.
- Docstrings on public functions: intent + one usage example.

## Tests

- Tests run with a single command: `npm test`.
- Every new function gets a test. Bug fixes get a regression test.
- Mock I/O with named fakes (`openMemoryDesfraldeStore`), not inline stubs.
- Tests must be F.I.R.S.T. Novo comportamento começa por teste que falha.

## Dependencies

- Inject the libSQL `Client` into `createDesfraldeStore`. Do not open
  a global DB inside query modules.
- Wrap session cookies in `src/server/session.ts`.
- Config: `DATABASE_URL` / `TURSO_AUTH_TOKEN` / `SESSION_SECRET` via env.
  `src/lib/database-url.ts` is the source of truth for the DB URL.

## Structure

- Follow TanStack Start file routes (`src/routes/`).
- Prefer small focused modules over god files.
- Domain tests sit next to the module: `foo.ts` + `foo.test.ts`.

## Formatting

- Prettier + ESLint (`npm run format`, `npm run ci`). Don't bikeshed style.

## Logging

- User-facing errors in Portuguese, with the offending value.
- No unstructured `console.log` in domain/store.

## Defensive programming

- Production `DATABASE_URL` must be Turso/libSQL. `file:` only in dev.
- `SESSION_SECRET` ≥ 32 characters.
- Do not add retries, circuit breakers or rate limits unless asked.
- Service worker (`public/sw.js`) registers only in `import.meta.env.PROD`.

## Product constraints

- Cartões padrão não nomeiam uma criança específica.
- Sem likeness de criança real nas ilustrações.
- Copy em português.
