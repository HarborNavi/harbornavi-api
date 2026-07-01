import { requireAdmin } from "../../src/lib/auth";
import { errorResponse, jsonResponse, optionsResponse, readJson } from "../../src/lib/http";
import { landingContent } from "../../src/lib/landing-content";

interface LandingContentPatch {
  assets?: Record<string, unknown>;
}

export function OPTIONS(request: Request): Response {
  return optionsResponse(request);
}

export function GET(request: Request): Response {
  return jsonResponse(request, landingContent, {
    headers: {
      "cache-control": "public, max-age=60"
    }
  });
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

  if (!patch.assets || typeof patch.assets !== "object") {
    return errorResponse(request, 400, "assets patch is required");
  }

  return jsonResponse(
    request,
    {
      ok: false,
      error: "Content persistence is not configured yet",
      acceptedShape: {
        assets: patch.assets
      },
      nextStep: "Wire this endpoint to a durable content store before enabling the admin UI."
    },
    { status: 501 }
  );
}
