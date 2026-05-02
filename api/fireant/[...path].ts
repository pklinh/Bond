import axios from "axios";
import { buildQuery, FIREANT_HEADERS, getFireantToken, normalizeFireantPath } from "../_lib/fireant";

export default async function handler(req: any, res: any) {
  const targetPath = normalizeFireantPath(req.query.path);

  if (!targetPath) {
    return res.status(400).json({ error: "Missing Fireant API path" });
  }

  const targetUrl = `https://restv2.fireant.vn/${targetPath}${buildQuery(req.query)}`;

  try {
    let token = req.headers.authorization;
    if (!token || token === "Bearer undefined" || token === "undefined") {
      const freshToken = await getFireantToken();
      token = freshToken ? `Bearer ${freshToken}` : undefined;
    }

    const fetchWithToken = async (authToken: string | undefined) => {
      const headers: Record<string, string> = { ...FIREANT_HEADERS };

      if (authToken) {
        headers.Authorization = authToken.startsWith("Bearer ") ? authToken : `Bearer ${authToken}`;
      }

      return axios({
        method: req.method,
        url: targetUrl,
        headers,
        data: req.body,
        timeout: 20000,
        validateStatus: (status) => status < 500,
      });
    };

    let response = await fetchWithToken(token);

    if (response.status === 401) {
      const freshToken = await getFireantToken(true);
      if (freshToken) response = await fetchWithToken(freshToken);
    }

    res.status(response.status);
    return typeof response.data === "string" ? res.send(response.data) : res.json(response.data);
  } catch (error: any) {
    console.error(`Fireant proxy failed [${req.method}] ${targetPath}:`, error.message);
    return res
      .status(error.response?.status || 500)
      .json(error.response?.data || { error: "Failed to proxy Fireant request" });
  }
}
