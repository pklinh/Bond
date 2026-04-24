import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Generic API Proxy for Fireant
  app.all("/api/fireant/*", async (req, res) => {
    try {
      const targetPath = req.params[0];
      const query = new URLSearchParams(req.query as any).toString();
      const url = `https://restv2.fireant.vn/${targetPath}${query ? `?${query}` : ""}`;
      
      const response = await axios({
        method: req.method,
        url: url,
        headers: {
          'Accept': 'application/json',
          'Authorization': req.headers.authorization || ''
        },
        data: req.body
      });
      
      res.status(response.status).json(response.data);
    } catch (error: any) {
      console.error(`Error proxying Fireant [${req.method}] ${req.params[0]}:`, error.message);
      res.status(error.response?.status || 500).json(error.response?.data || { error: "Failed to proxy request" });
    }
  });

  // Server-side cache for news to handle slow source
  let newsCache: any = null;
  let lastCacheUpdate = 0;
  let isRefreshingNews = false;
  const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  const refreshNews = async (retryCount = 0) => {
    if (isRefreshingNews && retryCount === 0) return;
    isRefreshingNews = true;
    
    // Primary and secondary sources for news
    const SOURCES = [
      'https://script.googleusercontent.com/macros/echo?user_content_key=AWDtjMVp-sM0tXk_uBw2ueBrgcL2_yB9-fmJZGwDcFQP8bBmoUWGKOL5CT33gmuW7zW1dwpvOCG80DJZZbeXUVnW2agCI4n_hNVHmn4_WqiGD6lkXzg5iaT2s6AiMuM-V1cE8V3T614tuwRYouP8k-5O1GYcn9k3nwzClXfdtZEQZeKKZwAxyoDjoHaFirAAMtEfN6jDQhFvvGB0_72wEHO3pPrjj0z7DiREZqjO7XRGqDl0UUO5rAtkYJxnwgxr9bXBi3rYCn2ZvJv9aYsNI-BYAw1EX3JngQ&lib=M0ZQY7vpqx9jKo0249gPHKaT4GoecKTCy',
      'https://script.google.com/macros/s/AKfycbyv9Z_PZ_qI7_4l7xN5_X6p_Wp_v_R_v/exec' // Example fallback
    ];
    
    const sourceIndex = retryCount % SOURCES.length;
    const NEWS_API_URL = SOURCES[sourceIndex];
    
    try {
      console.log(`Background: Refreshing news (Source ${sourceIndex + 1}, Attempt ${retryCount + 1})...`);
      const response = await axios.get(NEWS_API_URL, {
        timeout: 60000, // Reduced from 120s to 60s for faster failover
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json'
        },
        maxRedirects: 5
      });
      
      const data = response.data;
      
      if (!data || (Array.isArray(data) && data.length === 0)) {
        throw new Error("Empty or null data");
      }

      const textPreview = typeof data === 'string' ? data.trim().toLowerCase() : '';
      if (typeof data === 'string' && (textPreview.startsWith('<!doctype') || textPreview.startsWith('<html'))) {
        throw new Error("Received HTML instead of JSON");
      }
      
      newsCache = data;
      lastCacheUpdate = Date.now();
      console.log("Background: News refreshed successfully.");
      isRefreshingNews = false;
    } catch (error: any) {
      const isNetworkError = error.message.includes('read ECONNRESET') || error.message.includes('timeout');
      
      if (retryCount < 4) { // Increased to 5 attempts total
        console.log(`Background: News message: ${error.message}${isNetworkError ? ' (Retrying...)' : ''}`);
        const delay = isNetworkError ? 2000 : 5000;
        setTimeout(() => refreshNews(retryCount + 1), delay);
        isRefreshingNews = true;
        return;
      }
      
      if (newsCache) {
        console.log(`Background: News failed after retries. Serving stale data.`);
      } else {
        console.warn("Background: News failed to initialize after 5 attempts.");
        // Self-initialize with empty array if nothing else works to prevent 504s
        newsCache = []; 
        lastCacheUpdate = Date.now();
      }
      isRefreshingNews = false;
    }
  };

  // Initial fetch to populate cache on startup
  refreshNews();

  // API Proxy for News (Legacy/Specific)
  app.get("/api/news", async (req, res) => {
    const now = Date.now();
    
    // If we have cache (even old), serve it instantly
    if (newsCache) {
      // Trigger background refresh if old
      if (now - lastCacheUpdate > CACHE_TTL && !isRefreshingNews) {
        refreshNews();
      }
      return res.json(newsCache);
    }

    // No cache at all: trigger refresh and return empty immediately to avoid timeout
    if (!isRefreshingNews) {
      refreshNews();
    }
    
    return res.json([]);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
