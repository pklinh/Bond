import { extractNextData, fetchFireantPage, mapNewsPost } from "./_lib/fireant";

const FALLBACK_NEWS = [
  {
    id: "fallback-1",
    source: "Bond Dashboard",
    title: "Du lieu tin tuc dang tam thoi duoc cap nhat",
    summary: "He thong dang ket noi lai nguon Fireant. Cac bang va bieu do trai phieu van duoc nap qua proxy rieng.",
    content: "He thong dang ket noi lai nguon Fireant.",
    author: "Bond Dashboard",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=800&auto=format&fit=crop",
    date: new Date().toISOString(),
    url: "#",
    originalUrl: null,
    category: "Market",
  },
];

export default async function handler(_req: any, res: any) {
  try {
    const html = await fetchFireantPage("/bai-viet");
    const data = extractNextData(html);
    const posts = data?.props?.pageProps?.initialState?.posts?.posts?.NEWS_STREAM?.posts;

    if (!Array.isArray(posts)) {
      return res.status(200).json(FALLBACK_NEWS);
    }

    return res.status(200).json(posts.map(mapNewsPost));
  } catch (error: any) {
    console.error("News API failed:", error.message);
    return res.status(200).json(FALLBACK_NEWS);
  }
}
