# Webhook Inspector

A lightweight webhook testing platform built with NestJS, React, SQLite/Redis, TailwindCSS, and Docker.

## What it does

- Creates anonymous webhook URLs with random UUID identifiers
- Accepts any HTTP method at `/:webhookId`
- Stores requests in SQLite (default) or Redis
- Polls every 1500ms for new requests
- Renders a split-pane inspector UI with request details

## Stack

- Backend: NestJS + TypeScript
- Frontend: React + Vite + TailwindCSS
- Storage: SQLite (default) or Redis
- Realtime: polling
- Containerization: Docker + Docker Compose

## Screenshot

<img width="1640" height="1080" alt="webhook_inspector_app" src="https://github.com/user-attachments/assets/7b2983b1-187a-4847-86a8-498ec4e03b1a" />

## Run with Docker

```bash
docker-compose up --build
```

- Frontend: [http://localhost:3001](http://localhost:3001)
- Backend: [http://localhost:3000](http://localhost:3000)

When you open the frontend, it generates a random webhook identifier, stores it in your browser, and routes you to the inspector view for that URL. The webhook URL you can send traffic to is the backend origin plus that identifier, for example `http://localhost:3000/550e8400-e29b-41d4-a716-446655440000`.

You can send a test payload to that webhook URL with `curl`:

```bash
curl -X POST http://localhost:3000/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.succeeded",
    "id": "evt_123",
    "amount": 4200
  }'
```

By default the backend stores requests in a local SQLite database, so `docker-compose up --build` works with no other services. To use Redis instead, start the `redis` profile and point the backend at it:

```bash
STORAGE_DRIVER=redis docker-compose --profile redis up --build
```

## Storage

The backend supports two storage drivers, selected with the `STORAGE_DRIVER` environment variable:

- `sqlite` (default) — stores requests in a local SQLite file. Configure the file path with `SQLITE_PATH` (defaults to `./data/webhook-inspector.db`). No extra services required.
- `redis` — stores requests in Redis sorted sets. Configure the connection with `REDIS_URL` (defaults to `redis://127.0.0.1:6379`).

## Self-hosted domains

Production setup:

- Frontend: `https://app.example.com`
- Backend: `https://api.example.com`
- Storage: local SQLite volume, or Redis on the private network only

### DNS

Point `app.example.com` at the frontend server or load balancer.
Point `api.example.com` at the backend server or load balancer.

### Environment variables

Backend (SQLite, default):

```bash
PORT=3000
STORAGE_DRIVER=sqlite
SQLITE_PATH=/data/webhook-inspector.db
CORS_ORIGIN=https://app.example.com
```

Backend (Redis):

```bash
PORT=3000
STORAGE_DRIVER=redis
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

- If using SQLite, mount a persistent volume at the `SQLITE_PATH` directory so data survives restarts.
- If using Redis, keep it off the public internet.
- The frontend must be built with the backend URL baked in via `VITE_API_BASE_URL`.
- The backend already allows CORS from the configured frontend origin.
- If you use Docker, you can keep the same compose file and override the env vars for production.

## Deploy on Cloudflare

The existing repo structure is still the primary setup for general use:

- `backend/` is the standard NestJS backend
- `frontend/` is the standard React app
- storage remains configurable as `sqlite` (default) or `redis`

The Cloudflare path is optional and deployment-only. It lives under `deploy/cloudflare/` and does not replace or restructure the main app. It exists as a Cloudflare-specific adapter that serves the frontend on Cloudflare and stores requests in D1 for that deployment target.

Use [deploy/cloudflare/README.md](deploy/cloudflare/README.md) only when you want to deploy to Cloudflare.

## API

### `ALL /:webhookId`

Accepts any webhook request and stores it via the configured storage driver.

### `GET /api/requests/:webhookId?since=timestamp&limit=50`

Returns requests newest-first.

- `since` is a timestamp in milliseconds
- `limit` defaults to `50` and is capped at `50`

## Local development

The app is organized as two standalone packages:

- `backend/`
- `frontend/`

You can install and run them separately if you want to develop without Docker.

*Experimental*
