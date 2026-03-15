const DEFAULT_SITE_URL = "http://localhost:3000";

function ensureAbsoluteUrl(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return DEFAULT_SITE_URL;
  }

  const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return new URL(normalized).toString().replace(/\/$/, "");
}

export function getSiteUrl(): string {
  return ensureAbsoluteUrl(
    process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.VERCEL_URL ||
      DEFAULT_SITE_URL
  );
}

export function toAbsoluteUrl(pathname: string, baseUrl = getSiteUrl()): string {
  return new URL(pathname, `${baseUrl}/`).toString();
}

export function getRequestOrigin(request: Request): string {
  return new URL(request.url).origin;
}

export function splitFingerprints(value?: string | null): string[] {
  return (value || "")
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}