const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080"
).replace(/\/$/, "");

export function getImageUrl(url?: string | null): string {
  if (!url) return "";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}
