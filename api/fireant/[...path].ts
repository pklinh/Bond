import axios from "axios";

let fireantToken: string | null = null;
let lastTokenFetch = 0;

const TOKEN_TTL_MS = 30 * 60 * 1000;

function normalizePath(pathParam: string | string[] | undefined) {
  if (Array.isArray(pathParam)) {
    return pathParam.join("/");
  }

  return pathParam || "";
}

function buildQuery(query: Record<string, unknown>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (key === "path" || value == null) continue;

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

async function getFireantToken(force = false) {
  const now = Date.now();
  if (!force && fireantToken && now - lastTokenFetch < TOKEN_TTL_MS) {
    return fireantToken;
  }

  const response = await axios.get("https://fireant.vn/bai-viet", {
    timeout: 10000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  const html = String(response.data);
  const scriptTag = '<script id="__NEXT_DATA__" type="application/json">';
  const startIdx = html.indexOf(scriptTag);
  if (startIdx === -1) return fireantToken;

  const jsonStart = html.indexOf("{", startIdx);
  const scriptEndIdx = html.indexOf("</script>", jsonStart);
  if (jsonStart === -1 || scriptEndIdx === -1) return fireantToken;

  const data = JSON.parse(html.substring(jsonStart, scriptEndIdx));
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

export default async function handler(req: any, res: any) {
  const targetPath = normalizePath(req.query.path);

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
      const headers: Record<string, string> = {
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "vi,en-US;q=0.9,en;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://fireant.vn/",
        Origin: "https://fireant.vn",
        "X-Requested-With": "XMLHttpRequest",
      };

      if (authToken) {
        headers.Authorization = authToken.startsWith("Bearer ")
          ? authToken
          : `Bearer ${authToken}`;
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
    if (typeof response.data === "string") {
      return res.send(response.data);
    }

    return res.json(response.data);
  } catch (error: any) {
    console.error(`Fireant proxy failed [${req.method}] ${targetPath}:`, error.message);
    return res
      .status(error.response?.status || 500)
      .json(error.response?.data || { error: "Failed to proxy Fireant request" });
  }
}
