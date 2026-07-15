# Cloudflare Deployment Target

This directory is only for the optional Cloudflare deployment target.

Repo-level usage and architecture stay the same:

- keep using `backend/` + `frontend/` normally
- keep using `sqlite` or `redis` in the main app
- use this folder only when deploying to Cloudflare

## Required setup

1. Install this target's dependencies:

```bash
cd deploy/cloudflare
npm install
```

2. Create a D1 database:

```bash
npx wrangler d1 create webhook-inspector
```

3. Copy the returned `database_name` and `database_id` into `wrangler.jsonc`.

4. Pick the public URL you want the existing frontend to use on Cloudflare and build the frontend into this directory:

```bash
CLOUDFLARE_PUBLIC_URL=https://your-project.your-domain.com npm run build:frontend
```

This passes `CLOUDFLARE_PUBLIC_URL` through to the existing Vite app as `VITE_API_BASE_URL`, so the frontend can keep using its current absolute API URL logic without any source changes.

5. Generate Worker env types if you want local type refresh:

```bash
npm run cf-typegen
```

6. Run locally:

```bash
npm run dev
```

7. Deploy:

```bash
npm run deploy
```

## Notes

- The D1 schema is created lazily by the Worker on first request.
- `dist/` is the Cloudflare-only build output for the existing `frontend/` app.
- This target assumes a same-origin Cloudflare deployment where the Worker serves both assets and API routes.
- If you want a separate frontend hostname and API hostname, set `CORS_ORIGIN` and adjust `CLOUDFLARE_PUBLIC_URL` accordingly.
- For browser navigation, the SPA asset fallback takes priority over "visit this webhook URL in a tab" behavior. Actual webhook traffic such as `POST /<webhookId>` and client-side API fetches still hit the Worker. If you want a browser-friendly explicit ingest route, use `/webhook/<webhookId>`.
