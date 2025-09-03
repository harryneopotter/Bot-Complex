# Repository Guidelines

## Product Premise (Read First)
- Bots-first: 21 "residents" in an apartment-building universe; users are guests.
- Fun over utility: short, stylized, SFW replies; ephemeral memory.
- No gating or curation for beta; all residents are available day one.
- See `PREMISE.md` for detailed goals, non-goals, and vocabulary.

## Project Structure & Modules
- `web/`: Vite + React UI. Source in `web/src/` (`App.jsx`, `main.jsx`, Tailwind in `index.css`). Build artifacts in `web/dist/`.
- `server/`: Node/Express API. Entry `server/src/server.js`; chat plumbing in `server/src/vendors.js` and `server/src/templates.js`; personas in `server/src/bots/registry.json` and docs in `server/src/bots/PERSONAS.md`.
- `docs & assets`: Ideation and PRD files at repo root (e.g., `ai_mini_arcade_prd.md`).

## Build, Test, and Development
- `server` (Node >= 18.17):
  - `cd server && npm install`
  - `npm run dev`: Start API with watch (default `:8080`).
  - `npm start`: Start API without watch.
- `web`:
  - `cd web && npm install`
  - `npm run dev`: Vite dev server (default `:5173`).
  - `npm run build` / `npm run preview`: Build and preview static UI.
- Local integration: Either host UI and API on the same origin, or set `window.__API_BASE__ = 'http://localhost:8080'` in your browser console while using the Vite dev server so the UI targets the API.

## Coding Style & Naming
- JavaScript/React ESM, 2‑space indent, semicolons, double quotes.
- Components: `PascalCase.jsx` (e.g., `BotCard.jsx`); utilities: `camelCase.js`.
- CSS via Tailwind in `web/src/index.css`; keep component styles minimal and co-located when practical.

## Testing Guidelines
- No formal test suite yet. Smoke test via:
  - API: `GET /health`, `GET /api/bots`, and a chat roundtrip to `/api/chat` (requires keys).
  - UI: Cards render from server catalog; send a message and verify streamed response.
- If adding tests, use `*.test.js` colocated near modules.

## Commit & Pull Requests
- Prefer concise, descriptive commits (Conventional Commits welcome: `feat:`, `fix:`, `chore:`).
- PRs include: clear description, steps to run, screenshots or clips for UI changes, and linked issues. Keep diffs focused.

## Security & Configuration
- Required env vars (API): `GROQ_API_KEY`, `TOGETHERAI_API_KEY`, `CHUTES_API_KEY`. Optional: `PORT` (defaults to `8080`). Never commit secrets.
- Hidden premise (server-only, optional): set `BOT_COMPLEX_PREMISE=1` to inject a private residency context into system prompts; optionally set `BOT_COMPLEX_MOVE_IN=2025-09-01` (ISO date) to vary “days since move-in”.
- CORS is enabled on the API for dev; restrict in production as needed.

## Personas (Bots)
- Add/update bots in `server/src/bots/registry.json` (id, name, prompts, few-shots). Document in `PERSONAS.md` as needed.
- The UI has a curated card list in `web/src/App.jsx`; to surface a brand-new persona id, add a matching card there as well.

## Agent SOP: Context & History
- Trigger phrase: When asked to "check agents.md and context" (or similar: "read context", "load history", "review AGENTS.md"), first read local context before other actions.
- Sources: Read `AGENTS.md` and all `./context/*.jsonl` files if present. Optionally include `SESSION_SUMMARY.md` when available.
- Ordering: Process JSONL files newest-first by last modified time; within each, prefer the most recent content (tail-first reasoning).
- Limits: Read only the last ~200 lines per JSONL file (and ~400 lines for `AGENTS.md` if you must quote). Do not dump full files; extract essentials.
- Output: Summarize key facts, decisions, open TODOs, and any constraints relevant to the current task. Cite filenames you drew from, not verbatim dumps.
- Safety: Treat these as read-only local artifacts; do not attempt network calls to obtain context. If the `context` directory is missing or empty, say so explicitly and proceed.
- Re-check: If the user asks again later, re-open both sources and note any deltas since the last read (new files or modified timestamps).
