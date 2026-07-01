export const landingAssetUses = [
  "homeHero",
  "packageHero",
  "petHero",
  "storyboard",
  "logo",
  "openGraph"
] as const;

export type LandingAssetUse = (typeof landingAssetUses)[number];

export interface LandingAssetRecord {
  key: string;
  use: LandingAssetUse;
  url: string;
  contentType: string;
  width?: number;
  height?: number;
  alt?: string;
  updatedAt: string;
}

export interface PresignUploadRequest {
  fileName: string;
  contentType: string;
  sizeBytes?: number;
  use: LandingAssetUse;
}

export interface PresignUploadResponse {
  provider: "r2";
  upload: {
    method: "PUT";
    url: string;
    headers: Record<string, string>;
    expiresInSeconds: number;
  };
  asset: LandingAssetRecord;
}

export const allowedImageContentTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml"
] as const;

export function isLandingAssetUse(value: unknown): value is LandingAssetUse {
  return typeof value === "string" && landingAssetUses.includes(value as LandingAssetUse);
}

export function validateUploadRequest(input: PresignUploadRequest): string | undefined {
  if (!input || typeof input !== "object") {
    return "Request body is required";
  }
  if (!input.fileName || typeof input.fileName !== "string") {
    return "fileName is required";
  }
  if (!input.contentType || typeof input.contentType !== "string") {
    return "contentType is required";
  }
  if (!allowedImageContentTypes.includes(input.contentType as (typeof allowedImageContentTypes)[number])) {
    return "Unsupported image content type";
  }
  if (!isLandingAssetUse(input.use)) {
    return "Unsupported asset use";
  }
  if (input.sizeBytes !== undefined && (!Number.isFinite(input.sizeBytes) || input.sizeBytes <= 0)) {
    return "sizeBytes must be a positive number";
  }
  if (input.sizeBytes !== undefined && input.sizeBytes > 12 * 1024 * 1024) {
    return "Image is too large for the landing page asset workflow";
  }
  return undefined;
}

export function makeSafeFileName(fileName: string): string {
  const normalized = fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");
  return normalized || "asset";
}
