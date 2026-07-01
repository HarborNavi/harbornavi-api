import { getAllowedOrigins } from "./env";

export interface ApiErrorBody {
  error: string;
  detail?: string;
}

export function corsHeaders(request: Request): Headers {
  const headers = new Headers({
    "access-control-allow-methods": "GET,POST,PUT,OPTIONS",
    "access-control-allow-headers": "authorization,content-type",
    "access-control-max-age": "86400",
    "content-type": "application/json; charset=utf-8"
  });

  const origin = request.headers.get("origin");
  if (origin && getAllowedOrigins().includes(origin)) {
    headers.set("access-control-allow-origin", origin);
    headers.set("vary", "origin");
  }

  return headers;
}

export function jsonResponse(request: Request, body: unknown, init: ResponseInit = {}): Response {
  const headers = corsHeaders(request);
  for (const [key, value] of new Headers(init.headers).entries()) {
    headers.set(key, value);
  }
  return new Response(JSON.stringify(body, null, 2), {
    ...init,
    headers
  });
}

export function errorResponse(request: Request, status: number, error: string, detail?: string): Response {
  const body: ApiErrorBody = detail ? { error, detail } : { error };
  return jsonResponse(request, body, { status });
}

export function optionsResponse(request: Request): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request)
  });
}

export async function readJson<T>(request: Request): Promise<T> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("Expected application/json request body");
  }
  return (await request.json()) as T;
}
