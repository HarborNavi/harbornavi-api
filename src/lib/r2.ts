import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { getEnv, requireEnv } from "./env";
import { makeSafeFileName, type LandingAssetRecord, type PresignUploadRequest, type PresignUploadResponse } from "./assets";

const uploadUrlTtlSeconds = 10 * 60;

export async function createR2PresignedUpload(input: PresignUploadRequest): Promise<PresignUploadResponse> {
  const endpoint = requireEnv("R2_ENDPOINT");
  const bucket = requireEnv("R2_BUCKET");
  const accessKeyId = requireEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = requireEnv("R2_SECRET_ACCESS_KEY");
  const publicBaseUrl = requireEnv("R2_PUBLIC_BASE_URL").replace(/\/+$/g, "");
  const prefix = (getEnv("ASSET_PREFIX") ?? "landing").replace(/^\/+|\/+$/g, "");

  const client = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });

  const now = new Date();
  const safeFileName = makeSafeFileName(input.fileName);
  const randomPart = randomUUID().slice(0, 8);
  const key = `${prefix}/${input.use}/${now.toISOString().slice(0, 10)}/${Date.now()}-${randomPart}-${safeFileName}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: input.contentType,
    CacheControl: "public, max-age=31536000, immutable"
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: uploadUrlTtlSeconds });
  const asset: LandingAssetRecord = {
    key,
    use: input.use,
    url: `${publicBaseUrl}/${key}`,
    contentType: input.contentType,
    updatedAt: now.toISOString()
  };

  return {
    provider: "r2",
    upload: {
      method: "PUT",
      url: uploadUrl,
      headers: {
        "content-type": input.contentType
      },
      expiresInSeconds: uploadUrlTtlSeconds
    },
    asset
  };
}
