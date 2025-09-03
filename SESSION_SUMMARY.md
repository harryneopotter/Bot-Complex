# Session Summary — 2025-09-02

## Decisions
- Repo name: Bot-Complex (bots-first, apartment metaphor is internal only).
- Ship all 21 residents from day one; no curation; tiny closed beta (2–3 people).
- No user-facing theme hints; discovery should emerge organically in chats.
- Gossip board: not implemented now; keep as future idea (should start empty, grow organically later).

## Changes Made
- Added `AGENTS.md` (contributor guide) and `PREMISE.md` (internal product premise).
- Implemented hidden residency context (server-only):
  - Env: `BOT_COMPLEX_PREMISE=1` to enable; optional `BOT_COMPLEX_MOVE_IN=YYYY-MM-DD`.
  - Code: `server/src/templates.js` injects a private system message (includes day count and neighbor names for ids 1–21).
- Renamed packages: `bot-complex-web`, `bot-complex-server`.
- Added root `.gitignore` and concise `README.md`.
- Vite dev proxy: `/api` and `/health` route to `http://localhost:8080`.
- Initialized git and pushed initial commit: “Episode 1, The Arrival”.

## Current Repo State
- Remote: `git@github.com:harryneopotter/Bot-Complex.git`
- Default branch: `main`
- UI/Server run locally:
  - Server: `cd server && npm i && npm run dev`
  - Web: `cd web && npm i && npm run dev`

## Next Session Starting Points
- Deployment: choose hosts (e.g., API on Render/Fly, web on Vercel/Netlify). Set provider keys and (optionally) `BOT_COMPLEX_PREMISE=1`.
- CORS: tighten API origins for production.
- UX polish (non-thematic): error states, clear-session, provider/model badge readability.
- Future work (not started): design the gossip board mechanics (blank initially, max 1 rumor/day, organic surfacing).

