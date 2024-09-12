import { Hono } from "jsr:@hono/hono@^4.5.10";
import { cors } from "jsr:@hono/hono@^4.5.10/cors";
import { prettyJSON } from "jsr:@hono/hono@^4.5.10/pretty-json";

const app = new Hono();
const baseURL = "https://api-partner.krl.co.id/krlweb/v1";
const KRL_AUTH_TOKEN =
  "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiMDYzNWIyOGMzYzg3YTY3ZTRjYWE4YTI0MjYxZGYwYzIxNjYzODA4NWM2NWU4ZjhiYzQ4OGNlM2JiZThmYWNmODU4YzY0YmI0MjgyM2EwOTUiLCJpYXQiOjE3MjI2MTc1MTQsIm5iZiI6MTcyMjYxNzUxNCwiZXhwIjoxNzU0MTUzNTE0LCJzdWIiOiI1Iiwic2NvcGVzIjpbXX0.Jz_sedcMtaZJ4dj0eWVc4_pr_wUQ3s1-UgpopFGhEmJt_iGzj6BdnOEEhcDDdIz-gydQL5ek0S_36v5h6P_X3OQyII3JmHp1SEDJMwrcy4FCY63-jGnhPBb4sprqUFruDRFSEIs1cNQ-3rv3qRDzJtGYc_bAkl2MfgZj85bvt2DDwBWPraZuCCkwz2fJvox-6qz6P7iK9YdQq8AjJfuNdl7t_1hMHixmtDG0KooVnfBV7PoChxvcWvs8FOmtYRdqD7RSEIoOXym2kcwqK-rmbWf9VuPQCN5gjLPimL4t2TbifBg5RWNIAAuHLcYzea48i3okbhkqGGlYTk3iVMU6Hf_Jruns1WJr3A961bd4rny62lNXyGPgNLRJJKedCs5lmtUTr4gZRec4Pz_MqDzlEYC3QzRAOZv0Ergp8-W1Vrv5gYyYNr-YQNdZ01mc7JH72N2dpU9G00K5kYxlcXDNVh8520-R-MrxYbmiFGVlNF2BzEH8qq6Ko9m0jT0NiKEOjetwegrbNdNq_oN4KmHvw2sHkGWY06rUeciYJMhBF1JZuRjj3JTwBUBVXcYZMFtwUAoikVByzKuaZZeTo1AtCiSjejSHNdpLxyKk_SFUzog5MOkUN1ktAhFnBFoz6SlWAJBJIS-lHYsdFLSug2YNiaNllkOUsDbYkiDtmPc9XWc";

app.use(prettyJSON());

app.use(
  "*",
  cors({
    origin: ["https://apikrl.sarbeh.com/", "*"], // Allow commuterline.id and any other origin
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  retries = 3
) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      if (response.status === 522) throw new Error("Connection timed out");
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error("Max retries reached");
};

const fetchKRLData = async (
  path: string,
  queryParams: Record<string, string> = {}
) => {
  const url = new URL(`${baseURL}${path}`);
  Object.entries(queryParams).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const headers = {
    Authorization: KRL_AUTH_TOKEN,
    Accept: "application/json, text/javascript, */*; q=0.01",
    "User-Agent": "Cloudflare-Worker",
    Origin: "https://commuterline.id",
    Referer: "https://commuterline.id/",
  };

  try {
    const response = await fetchWithRetry(url.toString(), {
      method: "GET",
      headers,
      cf: { cacheTtl: 300, cacheEverything: true }, // Optional: Enable caching
    });
    return await response.json();
  } catch (error) {
    console.error(`Error fetching from KRL API (${path}):`, error);
    throw error;
  }
};

app.get("/krlweb/v1/krl-station", async (c) => {
  try {
    const data = await fetchKRLData("/krl-station");
    return c.json(data);
  } catch (error) {
    return c.json({ error: "Failed to fetch KRL station data" }, 500);
  }
});

app.get("/krlweb/v1/schedule", async (c) => {
  const { stationid, timefrom, timeto } = c.req.query();
  if (!stationid || !timefrom || !timeto) {
    return c.json({ error: "Missing required query parameters" }, 400);
  }
  try {
    const data = await fetchKRLData("/schedule", {
      stationid,
      timefrom,
      timeto,
    });
    return c.json(data);
  } catch (error) {
    return c.json({ error: "Failed to fetch schedule data" }, 500);
  }
});

app.get("/krlweb/v1/schedule-train", async (c) => {
  const { trainid } = c.req.query();
  if (!trainid) {
    return c.json({ error: "Missing required query parameter: trainid" }, 400);
  }
  try {
    const data = await fetchKRLData("/schedule-train", { trainid });
    return c.json(data);
  } catch (error) {
    return c.json({ error: "Failed to fetch train schedule data" }, 500);
  }
});

Deno.serve({ port: 8787 }, app.fetch);
