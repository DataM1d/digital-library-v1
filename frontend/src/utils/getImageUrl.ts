const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export function getImageUrl(url?: string) {
  if (!url) return "";

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  return `${API_URL}${url}`;
}
