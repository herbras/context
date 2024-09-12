import { Context, Hono } from "hono";
import { contextStorage, getContext } from "hono/context-storage";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { KrlStation, Schedule, ScheduleTrain } from "./types";

type Env = {
  Variables: {
    authorizationToken: string;
  };
};

const app = new Hono<Env>();
const baseURL = "https://api-partner.krl.co.id/krlweb/v1";
const authorizationToken =
  "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiMDYzNWIyOGMzYzg3YTY3ZTRjYWE4YTI0MjYxZGYwYzIxNjYzODA4NWM2NWU4ZjhiYzQ4OGNlM2JiZThmYWNmODU4YzY0YmI0MjgyM2EwOTUiLCJpYXQiOjE3MjI2MTc1MTQsIm5iZiI6MTcyMjYxNzUxNCwiZXhwIjoxNzU0MTUzNTE0LCJzdWIiOiI1Iiwic2NvcGVzIjpbXX0.Jz_sedcMtaZJ4dj0eWVc4_pr_wUQ3s1-UgpopFGhEmJt_iGzj6BdnOEEhcDDdIz-gydQL5ek0S_36v5h6P_X3OQyII3JmHp1SEDJMwrcy4FCY63-jGnhPBb4sprqUFruDRFSEIs1cNQ-3rv3qRDzJtGYc_bAkl2MfgZj85bvt2DDwBWPraZuCCkwz2fJvox-6qz6P7iK9YdQq8AjJfuNdl7t_1hMHixmtDG0KooVnfBV7PoChxvcWvs8FOmtYRdqD7RSEIoOXym2kcwqK-rmbWf9VuPQCN5gjLPimL4t2TbifBg5RWNIAAuHLcYzea48i3okbhkqGGlYTk3iVMU6Hf_Jruns1WJr3A961bd4rny62lNXyGPgNLRJJKedCs5lmtUTr4gZRec4Pz_MqDzlEYC3QzRAOZv0Ergp8-W1Vrv5gYyYNr-YQNdZ01mc7JH72N2dpU9G00K5kYxlcXDNVh8520-R-MrxYbmiFGVlNF2BzEH8qq6Ko9m0jT0NiKEOjetwegrbNdNq_oN4KmHvw2sHkGWY06rUeciYJMhBF1JZuRjj3JTwBUBVXcYZMFtwUAoikVByzKuaZZeTo1AtCiSjejSHNdpLxyKk_SFUzog5MOkUN1ktAhFnBFoz6SlWAJBJIS-lHYsdFLSug2YNiaNllkOUsDbYkiDtmPc9XWc";

app.use("/krlweb/*", cors());
app.use(prettyJSON());
app.use(contextStorage());

app.use(async (c, next) => {
  c.set("authorizationToken", authorizationToken);
  await next();
});

const fetchData = async <T>(path: string, c: Context): Promise<T> => {
  const headers = {
    accept: "application/json, text/javascript, */*; q=0.01",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "id,en-US;q=0.9,en;q=0.8,ja;q=0.7,ar;q=0.6",
    authorization: getContext<Env>().var.authorizationToken,
    origin: "https://commuterline.id",
    referer: "https://commuterline.id/",
    "user-agent": c.req.header("User-Agent") ?? "",
  };

  const response = await fetch(path, {
    method: "GET",
    headers: headers,
  });

  return await response.json();
};

app.get("/krlweb/v1/krl-station", async (c) => {
  const data = await fetchData<KrlStation>(`${baseURL}/krl-station`, c);
  return c.json(data);
});

app.get("/krlweb/v1/schedule", async (c) => {
  const stationId = c.req.query("stationid");
  const timeFrom = c.req.query("timefrom");
  const timeTo = c.req.query("timeto");

  const data = await fetchData<Schedule>(
    `${baseURL}/schedule?stationid=${stationId}&timefrom=${timeFrom}&timeto=${timeTo}`,
    c
  );
  return c.json(data);
});

app.get("/krlweb/v1/schedule-train", async (c) => {
  const trainId = c.req.query("trainid");

  const data = await fetchData<ScheduleTrain>(
    `${baseURL}/schedule-train?trainid=${trainId}`,
    c
  );
  return c.json(data);
});

export default app;
