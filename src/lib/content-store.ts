import { GetObjectCommand, NoSuchKey, PutObjectCommand } from "@aws-sdk/client-s3";
import { landingAssetSlots, type LandingAssetRecord } from "./assets";
import { landingContent, type LandingAssetSlot, type LandingContentResponse } from "./landing-content";
import { createR2Client, getR2Config } from "./r2";

export type LandingContentPatch = {
  assets?: Partial<Record<LandingAssetSlot, LandingAssetRecord>>;
};

export function validateLandingContentPatch(input: LandingContentPatch): string | undefined {
  if (!input || typeof input !== "object") {
    return "Request body is required";
  }
  if (!input.assets || typeof input.assets !== "object") {
    return "assets patch is required";
  }

  for (const [slot, asset] of Object.entries(input.assets)) {
    if (!landingAssetSlots.includes(slot as LandingAssetSlot)) {
      return `Unsupported landing asset slot: ${slot}`;
    }
    if (!asset || typeof asset !== "object") {
      return `Asset patch for ${slot} must be an object`;
    }
    if (asset.use !== slot) {
      return `Asset use for ${slot} must match the slot name`;
    }
    if (!asset.url || typeof asset.url !== "string") {
      return `Asset url for ${slot} is required`;
    }
    if (!asset.contentType || typeof asset.contentType !== "string") {
      return `Asset contentType for ${slot} is required`;
    }
  }

  return undefined;
}

export async function getLandingContent(): Promise<LandingContentResponse> {
  try {
    const config = getR2Config();
    const client = createR2Client(config);
    const object = await client.send(
      new GetObjectCommand({
        Bucket: config.bucket,
        Key: config.contentKey
      })
    );
    const body = await object.Body?.transformToString();
    if (!body) {
      return landingContent;
    }
    const parsed = JSON.parse(body) as LandingContentResponse;
    return {
      ...landingContent,
      ...parsed,
      source: "r2",
      assets: {
        ...landingContent.assets,
        ...parsed.assets
      }
    };
  } catch (error) {
    if (error instanceof NoSuchKey || (error instanceof Error && error.name === "NoSuchKey")) {
      return landingContent;
    }
    if (error instanceof Error && error.message.includes("is not configured")) {
      return landingContent;
    }
    throw error;
  }
}

export async function updateLandingContent(patch: LandingContentPatch): Promise<LandingContentResponse> {
  const validationError = validateLandingContentPatch(patch);
  if (validationError) {
    throw new Error(validationError);
  }

  const config = getR2Config();
  const client = createR2Client(config);
  const current = await getLandingContent();
  const updated: LandingContentResponse = {
    version: new Date().toISOString(),
    source: "r2",
    assets: {
      ...current.assets,
      ...patch.assets
    }
  };

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: config.contentKey,
      ContentType: "application/json; charset=utf-8",
      CacheControl: "public, max-age=60",
      Body: JSON.stringify(updated, null, 2)
    })
  );

  return updated;
}
