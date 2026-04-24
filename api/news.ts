import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

const SOURCES = [
  "https://script.googleusercontent.com/macros/echo?user_content_key=AWDtjMVp-sM0tXk_uBw2ueBrgcL2_yB9-fmJZGwDcFQP8bBmoUWGKOL5CT33gmuW7zW1dwpvOCG80DJZZbeXUVnW2agCI4n_hNVHmn4_WqiGD6lkXzg5iaT2s6AiMuM-V1cE8V3T614tuwRYouP8k-5O1GYcn9k3nwzClXfdtZEQZeKKZwAxyoDjoHaFirAAMtEfN6jDQhFvvGB0_72wEHO3pPrjj0z7DiREZqjO7XRGqDl0UUO5rAtkYJxnwgxr9bXBi3rYCn2ZvJv9aYsNI-BYAw1EX3JngQ&lib=M0ZQY7vpqx9jKo0249gPHKaT4GoecKTCy",
  "https://script.google.com/macros/s/AKfycbyv9Z_PZ_qI7_4l7xN5_X6p_Wp_v_R_v/exec",
];

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  for (let i = 0; i < SOURCES.length; i += 1) {
    try {
      const response = await axios.get(SOURCES[i], {
        timeout: 30000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept: "application/json",
        },
        maxRedirects: 5,
      });

      const data = response.data;
      const textPreview = typeof data === "string" ? data.trim().toLowerCase() : "";
      if (!data || (Array.isArray(data) && data.length === 0)) {
        throw new Error("Empty or null data");
      }
      if (typeof data === "string" && (textPreview.startsWith("<!doctype") || textPreview.startsWith("<html"))) {
        throw new Error("Received HTML instead of JSON");
      }

      return res.status(200).json(data);
    } catch (error: any) {
      console.warn(`News source ${i + 1} failed: ${error.message}`);
    }
  }

  return res.status(200).json([]);
}
