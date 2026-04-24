import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pathParam = req.query.path;
  const targetPath = Array.isArray(pathParam) ? pathParam.join("/") : pathParam;

  if (!targetPath) {
    return res.status(400).json({ error: "Missing target path" });
  }

  const queryParams = new URLSearchParams();
  Object.entries(req.query).forEach(([key, value]) => {
    if (key === "path") return;
    if (Array.isArray(value)) {
      value.forEach((item) => queryParams.append(key, String(item)));
    } else if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  const query = queryParams.toString();
  const url = `https://restv2.fireant.vn/${targetPath}${query ? `?${query}` : ""}`;

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

    return res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error(`Fireant proxy error [${req.method}] ${targetPath}:`, error.message);
    return res.status(error.response?.status || 500).json(error.response?.data || { error: "Failed to proxy request" });
  }
}
