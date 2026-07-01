export function getEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

export function requireEnv(name: string): string {
  const value = getEnv(name);
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

export function getAllowedOrigins(): string[] {
  return (getEnv("HARBORNAVI_ALLOWED_ORIGINS") ?? "https://harbornavi.com,https://www.harbornavi.com,http://localhost:4322")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}
