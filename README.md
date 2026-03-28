# Webhook Inspector

A lightweight webhook testing platform built with NestJS, React, Redis, TailwindCSS, and Docker. 

## What it does

- Creates anonymous webhook URLs with random UUID identifiers
- Accepts any HTTP method at `/:webhookId`
- Stores requests in Redis sorted sets only
- Polls every 1500ms for new requests
- Renders a split-pane inspector UI with request details

## Stack

- Backend: NestJS + TypeScript
- Frontend: React + Vite + TailwindCSS
- Storage: Redis
- Realtime: polling
- Containerization: Docker + Docker Compose

## Run with Docker

```bash
docker-compose up --build
```

- Frontend: [http://localhost:3001](http://localhost:3001)
- Backend: [http://localhost:3000](http://localhost:3000)

When you open the frontend, it generates a random webhook identifier, stores it in your browser, and routes you to the inspector view for that URL. The webhook URL you can send traffic to is the backend origin plus that identifier, for example `http://localhost:3000/550e8400-e29b-41d4-a716-446655440000`.

## Self-hosted domains

Production setup:

- Frontend: `https://app.example.com`
- Backend: `https://api.example.com`
- Redis: private network only

### DNS

Point `app.example.com` at the frontend server or load balancer.
Point `api.example.com` at the backend server or load balancer.

### Environment variables

Backend:

```bash
PORT=3000
REDIS_URL=redis://<private-redis-host>:6379
CORS_ORIGIN=https://app.example.com
```

Frontend build:

```bash
VITE_API_BASE_URL=https://api.example.com
```

The shareable webhook URL becomes:

```text
https://api.example.com/<webhookId>
```

### Deployment notes

- Keep Redis off the public internet.
- The frontend must be built with the backend URL baked in via `VITE_API_BASE_URL`.
- The backend already allows CORS from the configured frontend origin.
- If you use Docker, you can keep the same compose file and override the env vars for production.

## API

### `ALL /:webhookId`

Accepts any webhook request and stores it in Redis.

### `GET /api/requests/:webhookId?since=timestamp&limit=50`

Returns requests newest-first.

- `since` is a timestamp in milliseconds
- `limit` defaults to `50` and is capped at `50`

## Local development

The app is organized as two standalone packages:

- `backend/`
- `frontend/`

You can install and run them separately if you want to develop without Docker.

Assisted by Codex.
