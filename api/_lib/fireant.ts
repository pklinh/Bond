import axios from "axios";

let fireantToken: string | null = null;
let lastTokenFetch = 0;

const TOKEN_TTL_MS = 30 * 60 * 1000;

export const FIREANT_HEADERS = {
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "vi,en-US;q=0.9,en;q=0.8",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Referer: "https://fireant.vn/",
  Origin: "https://fireant.vn",
  "X-Requested-With": "XMLHttpRequest",
};

export const FINANCE_FALLBACKS = [
  "https://images.unsplash.com/photo-1611974717482-58a2523e16c2?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526303328184-bf7159787ca7?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1633156191771-7a55444e998b?q=80&w=800&auto=format&fit=crop",
];

export function getFallbackImage(id: string | number) {
  const idx = typeof id === "number" ? id % FINANCE_FALLBACKS.length : id.length % FINANCE_FALLBACKS.length;
  return FINANCE_FALLBACKS[idx];
}

export function normalizeFireantPath(pathParam: string | string[] | undefined) {
  return Array.isArray(pathParam) ? pathParam.join("/") : pathParam || "";
}

export function buildQuery(query: Record<string, unknown>, ignoredKeys = ["path"]) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (ignoredKeys.includes(key) || value == null) continue;

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, String(item)));
    } else {
      params.set(key, String(value));
    }
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

function findTokenRecursively(obj: unknown): string | null {
  if (!obj || typeof obj !== "object") return null;

  const record = obj as Record<string, unknown>;
  for (const key of ["accessToken", "token"]) {
    const value = record[key];
    if (typeof value === "string" && value.length > 20) return value;
  }

  for (const value of Object.values(record)) {
    const token = findTokenRecursively(value);
    if (token) return token;
  }

  return null;
}

export function extractNextData(html: string) {
  const scriptTag = '<script id="__NEXT_DATA__" type="application/json">';
  const startIdx = html.indexOf(scriptTag);
  if (startIdx === -1) return null;

  const jsonStart = html.indexOf("{", startIdx);
  const scriptEndIdx = html.indexOf("</script>", jsonStart);
  if (jsonStart === -1 || scriptEndIdx === -1) return null;

  return JSON.parse(html.substring(jsonStart, scriptEndIdx));
}

export async function fetchFireantPage(path = "/bai-viet") {
  const response = await axios.get(`https://fireant.vn${path}`, {
    timeout: 15000,
    headers: {
      "User-Agent": FIREANT_HEADERS["User-Agent"],
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": FIREANT_HEADERS["Accept-Language"],
    },
  });

  return String(response.data);
}

export async function getFireantToken(force = false) {
  const now = Date.now();
  if (!force && fireantToken && now - lastTokenFetch < TOKEN_TTL_MS) {
    return fireantToken;
  }

  const html = await fetchFireantPage("/bai-viet");
  const data = extractNextData(html);
  const token =
    data?.props?.pageProps?.initialState?.auth?.accessToken ||
    data?.props?.pageProps?.initialState?.auth?.token ||
    findTokenRecursively(data);

  if (token) {
    fireantToken = token;
    lastTokenFetch = now;
  }

  return fireantToken;
}

export function normalizeImageUrl(url: unknown) {
  if (!url || typeof url !== "string") return null;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `https://static.fireant.vn${url}`;
  return url;
}

export function extractImage(post: any) {
  let image =
    post?.images?.[0]?.imageUrl ||
    (post?.images?.[0]?.imageID ? `https://static.fireant.vn/News/Image/${post.images[0].imageID}` : null) ||
    post?.thumbnail ||
    post?.linkImage;

  if (!image) {
    const content = post?.content || post?.originalContent || post?.description || post?.summary || "";
    const matches = Array.from(String(content).matchAll(/<img[^>]+(?:src|data-src|srcset)=["']([^"'\s>]+)["']/gi));
    const likelyImage = matches.find((match: any) => !match[1].includes("icon") && !match[1].includes("logo")) || matches[0];
    image = likelyImage?.[1];
  }

  return normalizeImageUrl(image);
}

export function mapNewsPost(post: any, index = 0) {
  const id = post?.postID?.toString() || `fa-${Date.now()}-${index}`;
  const image = extractImage(post) || getFallbackImage(id);
  const images = (post?.images || [])
    .map((img: any) => normalizeImageUrl(img.imageUrl || (img.imageID ? `https://static.fireant.vn/News/Image/${img.imageID}` : null)))
    .filter(Boolean);

  if (image && !images.includes(image)) images.unshift(image);

  return {
    id,
    source: post?.postSource?.name || post?.user?.name || "Fireant",
    sourceUrl: post?.postSource?.url || null,
    title: post?.title || "",
    summary: post?.description || post?.summary || "",
    content: post?.content || post?.originalContent || post?.description || post?.summary || post?.title || "",
    author: post?.user?.name || "Fireant",
    image,
    images,
    date: post?.date,
    url: `https://fireant.vn/bai-viet/${id}`,
    originalUrl: post?.postSourceUrl || post?.link || null,
    category: post?.postGroup?.name || "Thị trường",
  };
}
