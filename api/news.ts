import { extractNextData, fetchFireantPage, mapNewsPost } from "./_lib/fireant";

export default async function handler(_req: any, res: any) {
  try {
    const html = await fetchFireantPage("/bai-viet");
    const data = extractNextData(html);
    const posts = data?.props?.pageProps?.initialState?.posts?.posts?.NEWS_STREAM?.posts;

    if (!Array.isArray(posts)) {
      return res.status(200).json([]);
    }

    return res.status(200).json(posts.map(mapNewsPost));
  } catch (error: any) {
    console.error("News API failed:", error.message);
    return res.status(500).json({ error: "Failed to fetch news" });
  }
}
