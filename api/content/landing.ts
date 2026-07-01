import { requireAdmin } from "../../src/lib/auth";
import { getLandingContent, updateLandingContent, type LandingContentPatch } from "../../src/lib/content-store";
import { errorResponse, jsonResponse, optionsResponse, readJson } from "../../src/lib/http";

export function OPTIONS(request: Request): Response {
  return optionsResponse(request);
}

export async function GET(request: Request): Promise<Response> {
  try {
    const content = await getLandingContent();
    return jsonResponse(request, content, {
      headers: {
        "cache-control": "public, max-age=60"
      }
    });
  } catch (error) {
    return errorResponse(
      request,
      503,
      "Landing content is not available",
      error instanceof Error ? error.message : undefined
    );
  }
}

export async function PUT(request: Request): Promise<Response> {
  const auth = requireAdmin(request);
  if (!auth.ok) {
    return errorResponse(request, auth.status ?? 401, auth.error ?? "Unauthorized");
  }

  let patch: LandingContentPatch;
  try {
    patch = await readJson<LandingContentPatch>(request);
  } catch (error) {
    return errorResponse(request, 400, "Invalid JSON body", error instanceof Error ? error.message : undefined);
  }

  try {
    const content = await updateLandingContent(patch);
    return jsonResponse(request, content);
  } catch (error) {
    const detail = error instanceof Error ? error.message : undefined;
    const status = detail?.includes("is not configured") ? 503 : 400;
    return errorResponse(request, status, "Landing content could not be updated", detail);
  }
}
