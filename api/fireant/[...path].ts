import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pathParts = req.query.path;
  const targetPath = Array.isArray(pathParts) ? pathParts.join("/") : pathParts;

  if (!targetPath) {
    return res.status(400).json({ error: "Missing target path" });
  }

  const query = new URLSearchParams();
  Object.entries(req.query).forEach(([key, value]) => {
    if (key === "path") return;
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, String(item)));
      return;
    }
    if (value !== undefined) {
      query.append(key, String(value));
    }
  });

  const url = `https://restv2.fireant.vn/${targetPath}${query.toString() ? `?${query.toString()}` : ""}`;

  try {
    const response = await axios({
      method: req.method,
      url,
      headers: {
        Accept: "application/json",
        Authorization: req.headers.authorization || "",
      },
      data: req.method === "GET" || req.method === "HEAD" ? undefined : req.body,
      validateStatus: () => true,
    });

    res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error(`Error proxying Fireant [${req.method}] ${targetPath}:`, error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: "Failed to proxy request" });
  }
}
