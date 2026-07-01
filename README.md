# HarborNavi API

Lightweight backend boundary for HarborNavi public-site assets and content.

The landing page stays in `harbornavi-site`. This repo owns upload signing, asset metadata contracts, and future admin/content persistence.

## Why this exists

- Frontend owns display and conversion.
- API owns image upload, storage provider details, and content update contracts.
- The landing page can change hero/storyboard images without broad component edits.

## Current endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | No | Service health check |
| `GET` | `/api/content/landing` | No | Public landing content asset contract |
| `PUT` | `/api/content/landing` | Bearer token | Saves landing image asset URLs into the configured R2/S3 content JSON |
| `POST` | `/api/uploads/presign` | Bearer token | Returns an R2/S3-compatible presigned `PUT` upload URL |

## Upload contract

Request:

```json
{
  "fileName": "home-hero.webp",
  "contentType": "image/webp",
  "sizeBytes": 842120,
  "use": "homeHero"
}
```

Response:

```json
{
  "provider": "r2",
  "upload": {
    "method": "PUT",
    "url": "https://...",
    "headers": {
      "content-type": "image/webp"
    },
    "expiresInSeconds": 600
  },
  "asset": {
    "key": "landing/homeHero/2026-07-01/...",
    "use": "homeHero",
    "url": "https://assets.harbornavi.com/landing/homeHero/...",
    "contentType": "image/webp",
    "updatedAt": "2026-07-01T00:00:00.000Z"
  }
}
```

The admin client should upload the file with the returned `PUT` URL, then send the returned `asset.url` into the content update flow once persistence is configured.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run typecheck
npx vercel dev
```

Required environment variables:

- `HARBORNAVI_ADMIN_TOKEN`
- `STORAGE_DRIVER=r2`
- `R2_ENDPOINT`
- `R2_BUCKET`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_PUBLIC_BASE_URL`
- `LANDING_CONTENT_KEY`

## Notes

`GET /api/content/landing` falls back to the static image contract when R2 is not configured or when the content JSON does not exist yet. `PUT /api/content/landing` requires R2 configuration and an admin bearer token.

For browser uploads, the R2 bucket must allow CORS `PUT` from `https://harbornavi.com` and local development origins.
