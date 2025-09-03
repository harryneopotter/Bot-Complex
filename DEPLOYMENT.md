# Deployment Guide — Docker on VM

This app ships as a single container that serves both the API and the built web UI from port `8080`.

## Prerequisites
- Linux VM with Docker Engine and Docker Compose plugin.
- SSH access to the VM (`ssh user@server`).
- Open port `8080` (or front with a reverse proxy on `80/443`).

## Environment Variables
- Required: `GROQ_API_KEY`, `TOGETHERAI_API_KEY`, `CHUTES_API_KEY`
- Optional: `BOT_COMPLEX_PREMISE=1`, `BOT_COMPLEX_MOVE_IN=YYYY-MM-DD`, `PORT=8080`

Create `.env` on the VM from the template:
- `cp .env.example .env` and fill the keys.

## Option A — Git on the VM (recommended)
1) SSH to VM: `ssh user@server`
2) Install git (if needed): `sudo apt-get update && sudo apt-get install -y git`
3) Clone and enter repo: `git clone <repo-url> ai-arcade && cd ai-arcade`
4) Configure env: `cp .env.example .env` and fill keys
5) Build + run: `docker compose up -d --build`
6) Verify: `curl -f http://localhost:8080/health`

Updates:
- `git pull && docker compose up -d --build`

## Option B — Zip + SCP (no remote needed)
On local machine:
- macOS/Linux: `git archive --format=tar.gz -o ai-arcade.tar.gz HEAD`
- Windows PowerShell: `Compress-Archive -Path * -DestinationPath ai-arcade.zip -Force`
Copy to VM:
- `scp ai-arcade.tar.gz user@server:~` (or the `.zip`)
On VM:
- `mkdir -p ai-arcade && tar -xzf ai-arcade.tar.gz -C ai-arcade` (or `unzip ai-arcade.zip -d ai-arcade`)
- `cd ai-arcade && cp .env.example .env` (fill keys)
- `docker compose up -d --build`

Updates:
- Recreate archive, `scp`, extract over folder, then `docker compose up -d --build`

## Option C — Container Registry (no build on VM)
Build + push locally (example GHCR):
- `docker build -t ghcr.io/<org>/<repo>/bot-complex:beta-YYYYMMDD .`
- `echo <PAT> | docker login ghcr.io -u <USER> --password-stdin`
- `docker push ghcr.io/<org>/<repo>/bot-complex:beta-YYYYMMDD`
On VM:
- `docker login ghcr.io`
- `docker pull ghcr.io/<org>/<repo>/bot-complex:beta-YYYYMMDD`
- Create `.env` from `.env.example` and fill keys
- Run directly:
  - `docker run -d --name bot-complex -p 8080:8080 --env-file .env ghcr.io/<org>/<repo>/bot-complex:beta-YYYYMMDD`
- Or use compose by replacing `build:` with the `image:` tag and `docker compose up -d`

## Reverse Proxy (optional, for 80/443)
Example Nginx server block:
```
server {
  listen 80;
  server_name your.domain;

  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```
If using Nginx, firewall block public `8080` and allow `80/443` only.

## Health, Logs, and Rollbacks
- Health: `curl -f http://<HOST>:8080/health` → `{ ok: true }`
- Logs: `docker compose logs -f`
- Status: `docker compose ps`
- Restart: `docker compose restart`
- Rebuild: `docker compose build --no-cache && docker compose up -d`
- Rollback (git): checkout previous commit, rebuild.
- Rollback (registry): pull previous tag, re-run or `compose up -d` with that tag.

## Notes
- `docker-compose.yml` exposes `8080` and includes a healthcheck.
- The server also serves the built UI from `web/dist`, so no separate static host is required for the beta.
