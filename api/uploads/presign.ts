import { requireAdmin } from "../../src/lib/auth";
import { validateUploadRequest, type PresignUploadRequest } from "../../src/lib/assets";
import { getEnv } from "../../src/lib/env";
import { errorResponse, jsonResponse, optionsResponse, readJson } from "../../src/lib/http";
import { createR2PresignedUpload } from "../../src/lib/r2";

export function OPTIONS(request: Request): Response {
  return optionsResponse(request);
}

export async function POST(request: Request): Promise<Response> {
  const auth = requireAdmin(request);
  if (!auth.ok) {
    return errorResponse(request, auth.status ?? 401, auth.error ?? "Unauthorized");
  }

  let body: PresignUploadRequest;
  try {
    body = await readJson<PresignUploadRequest>(request);
  } catch (error) {
    return errorResponse(request, 400, "Invalid JSON body", error instanceof Error ? error.message : undefined);
  }

  const validationError = validateUploadRequest(body);
  if (validationError) {
    return errorResponse(request, 400, validationError);
  }

  const storageDriver = getEnv("STORAGE_DRIVER") ?? "r2";
  if (storageDriver !== "r2") {
    return errorResponse(request, 501, `Unsupported STORAGE_DRIVER: ${storageDriver}`);
  }

  try {
    const presignedUpload = await createR2PresignedUpload(body);
    return jsonResponse(request, presignedUpload);
  } catch (error) {
    return errorResponse(
      request,
      503,
      "Upload signing is not available",
      error instanceof Error ? error.message : undefined
    );
  }
}
