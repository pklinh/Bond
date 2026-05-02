import axios from "axios";
import { extractNextData, fetchFireantPage, getFallbackImage, getFireantToken, mapNewsPost, normalizeImageUrl } from "../_lib/fireant";

function fixContentImageUrls(content: string) {
  return content.replace(/<img[^>]+(?:src|data-src|srcset)=["']([^"'\s>]+)["']/gi, (match, src) => {
    const absoluteSrc = normalizeImageUrl(src) || src;
    if (match.includes("data-src=")) return match.replace(/data-src=["'][^"']+["']/i, `src="${absoluteSrc}"`);
    if (!match.includes("src=")) return match.replace("<img", `<img src="${absoluteSrc}"`);
    return match.replace(/src=["'][^"']+["']/i, `src="${absoluteSrc}"`);
  });
}

export default async function handler(req: any, res: any) {
  const postId = req.query.id;
  if (!postId || Array.isArray(postId)) {
    return res.status(400).json({ error: "Post ID is required" });
  }

  try {
    const token = await getFireantToken();

    if (token) {
      try {
        const apiResponse = await axios.get(`https://restv2.fireant.vn/posts/get-post?postID=${postId}`, {
          timeout: 10000,
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });

        if (apiResponse.data) return res.status(200).json(mapNewsPost(apiResponse.data));
      } catch {
        // Fall back to the public article page below.
      }
    }

    const html = await fetchFireantPage(`/bai-viet/${postId}`);
    const data = extractNextData(html);
    const post = data?.props?.pageProps?.initialState?.posts?.post;

    if (!post) {
      return res.status(404).json({ error: "Post content not found" });
    }

    const mapped = mapNewsPost(post);
    mapped.content = fixContentImageUrls(mapped.content || mapped.summary || mapped.title);
    mapped.image = mapped.image || getFallbackImage(postId);

    return res.status(200).json(mapped);
  } catch (error: any) {
    console.error(`News detail API failed for ${postId}:`, error.message);
    return res.status(500).json({ error: "Failed to fetch post content" });
  }
}
