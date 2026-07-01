import { jsonResponse, optionsResponse } from "../src/lib/http";

export function OPTIONS(request: Request): Response {
  return optionsResponse(request);
}

export function GET(request: Request): Response {
  return jsonResponse(request, {
    ok: true,
    service: "harbornavi-api",
    version: "0.1.0"
  });
}
