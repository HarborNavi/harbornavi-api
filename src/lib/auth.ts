import { getEnv } from "./env";

export interface AuthResult {
  ok: boolean;
  status?: number;
  error?: string;
}

export function requireAdmin(request: Request): AuthResult {
  const expectedToken = getEnv("HARBORNAVI_ADMIN_TOKEN");
  if (!expectedToken) {
    return {
      ok: false,
      status: 503,
      error: "HARBORNAVI_ADMIN_TOKEN is not configured"
    };
  }

  const authorization = request.headers.get("authorization") ?? "";
  const expectedHeader = `Bearer ${expectedToken}`;
  if (authorization !== expectedHeader) {
    return {
      ok: false,
      status: 401,
      error: "Unauthorized"
    };
  }

  return { ok: true };
}
