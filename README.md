# Bot-Complex

Playful, bots-first chat arcade with 21 distinct personas ("residents"). React UI + Node/Express API with streamed responses and multi-provider fallbacks.

## Features
- 21 personas with curated prompts and openers
- SSE-style streaming responses
- Provider ladder + persona preferences (GROQ, Together, Chutes)
- Single-origin Docker deploy (serves built UI + API on :8080)

## Requirements
- Docker (recommended) or Node >= 18.17

## Quick Start (Docker)
- Copy env: `cp .env.example .env` and fill `GROQ_API_KEY`, `TOGETHERAI_API_KEY`, `CHUTES_API_KEY`
- Optional: `BOT_COMPLEX_PREMISE=1` and `BOT_COMPLEX_MOVE_IN=YYYY-MM-DD`
- Run: `docker compose up -d --build`
- Verify: `curl -f http://localhost:8080/health` → `{ ok: true }`
- Open UI: `http://localhost:8080`

## Quick Start (Local Dev)
- Server: `cd server && npm install && npm run dev` (listens on :8080)
- Web: `cd web && npm install && npm run dev` (Vite on :5173)
- If API not on the same origin, in the browser console set:
  - `window.__API_BASE__ = 'http://localhost:8080'`

## Environment
- Required: `GROQ_API_KEY`, `TOGETHERAI_API_KEY`, `CHUTES_API_KEY`
- Optional: `PORT` (default 8080), `BOT_COMPLEX_PREMISE=1`, `BOT_COMPLEX_MOVE_IN=YYYY-MM-DD`

## API Endpoints
- `GET /health`: service check
- `GET /api/bots`: catalog `{ bots: [{ id, name, opener }] }`
- `POST /api/chat`: streamed response; body includes `{ botId, messages, quality?, providerHint?, modelHint? }`

## Project Structure
- `server/`: Express API (`src/server.js`, `src/templates.js`, `src/vendors.js`)
- `server/src/bots/`: `registry.json`, `PERSONAS.md`
- `web/`: React app (Vite) — `src/` and Tailwind config
- Docker/Compose: root `Dockerfile`, `docker-compose.yml`

## Deployment
- See `DEPLOYMENT.md` for VM + Docker, Zip/SCP, and container registry options.
- In production, restrict CORS if splitting origins.

## Security & Input Handling
- User input is sanitized to remove control characters and normalize whitespace
- Messages are limited to 2000 characters to prevent API overload
- Invalid inputs are rejected with user-friendly error messages
- All chat data is processed through validated sanitization before backend transmission

## Error Handling
- All API errors (chat, bot catalog) are caught and displayed as a user-friendly banner in the chat modal.
- Errors are logged to the browser console for developer debugging.
- Error messages are cleared when the chat modal closes or a new message is sent.
- To test error handling, simulate network failures, stop the backend, or use invalid API URLs; the UI will show the error and log details to the console.

## Troubleshooting
- Missing keys → chat errors: set at least one provider key in `.env`.
- Port busy → set `PORT` or adjust compose mapping.
- Split dev CORS → ensure `window.__API_BASE__` points to the API.
