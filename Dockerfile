# Multi-stage build: build web UI, install server, run minimal runtime image

FROM node:20-alpine AS webbuilder
WORKDIR /app/web
COPY web/package*.json ./
RUN npm ci --no-audit --no-fund
COPY web/ ./
RUN npm run build

FROM node:20-alpine AS serverdeps
WORKDIR /app/server
ENV NODE_ENV=production
COPY server/package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy server runtime
COPY --from=serverdeps /app/server /app/server
COPY server/src /app/server/src
COPY server/src/bots /app/server/src/bots

# Copy built web assets
COPY --from=webbuilder /app/web/dist /app/web/dist

EXPOSE 8080
CMD ["node", "server/src/server.js"]

