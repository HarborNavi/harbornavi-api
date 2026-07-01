# HarborNavi R2 setup

Bucket name: `harbornavi-assets`

Public base URL options:

- Preferred: `https://assets.harbornavi.com`
- Temporary: Cloudflare R2 public bucket URL, for example `https://pub-xxxx.r2.dev`

Apply CORS after Cloudflare login:

```bash
npx wrangler r2 bucket create harbornavi-assets
npx wrangler r2 bucket cors set harbornavi-assets --file ops/r2-cors.harbornavi.json
npx wrangler r2 bucket cors list harbornavi-assets
```

Required Vercel production env:

```text
STORAGE_DRIVER=r2
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_BUCKET=harbornavi-assets
R2_ACCESS_KEY_ID=<r2-access-key-id>
R2_SECRET_ACCESS_KEY=<r2-secret-access-key>
R2_PUBLIC_BASE_URL=https://assets.harbornavi.com
ASSET_PREFIX=landing
LANDING_CONTENT_KEY=landing/content.json
```

The R2 access key should have Object Read & Write permission for the `harbornavi-assets` bucket.
