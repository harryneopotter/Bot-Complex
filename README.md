# Bot-Complex

A playful, bots-first chat arcade with 21 distinct personas ("residents"). The UI is a lightweight React app; the API is a small Node/Express server that streams responses via provider fallbacks.

## Quick Start
- Prereq: Node >= 18.17
- Server
  - cd `server` && `npm install`
  - Set env: `GROQ_API_KEY`, `TOGETHERAI_API_KEY`, `CHUTES_API_KEY` (and optional `PORT`)
  - Optional hidden premise: `BOT_COMPLEX_PREMISE=1` and `BOT_COMPLEX_MOVE_IN=YYYY-MM-DD`
  - Run: `npm run dev` (watch) or `npm start`
- Web
  - cd `web` && `npm install`
  - Dev: `npm run dev` (Vite, default :5173)
  - Build/Preview: `npm run build` then `npm run preview`

## Local Integration
- Run both services locally and open the Vite dev URL; the Vite dev proxy forwards `/api` and `/health` to `http://localhost:8080` by default.
- If you run the API elsewhere, set in the browser console: `window.__API_BASE__ = 'http://HOST:PORT'` before chatting.

## Deploy Notes
- Lock API CORS to your web origin in production.
- Provide provider keys as platform secrets. Never commit secrets.

## Docs
- Contributor guide: `AGENTS.md` (structure, commands, style, env)
- Product premise (internal): `PREMISE.md`
