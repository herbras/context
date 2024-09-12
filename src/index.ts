import { apiReference } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";

const app = new Hono();
const baseURL = "https://mirrorapikrl.sarbeh.com";
app.use("*", cors());
app.use(prettyJSON());

app.get("/doc", (c) => {
  const swaggerConfig = {
    openapi: "3.0.0",
    info: {
      title: "KRL API",
      version: "1.0.0",
      description: "API for KRL (Commuter Line) information",
    },
    servers: [
      {
        url: baseURL,
        description: "KRL API Server",
      },
    ],
    paths: {
      "/krlweb/v1/krl-station": {
        get: {
          summary: "Get KRL stations",
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/KrlStation",
                  },
                },
              },
            },
          },
        },
      },
      "/krlweb/v1/schedule": {
        get: {
          summary: "Get schedule",
          parameters: [
            {
              name: "stationid",
              in: "query",
              required: true,
              schema: {
                type: "string",
              },
              example: "AK",
            },
            {
              name: "timefrom",
              in: "query",
              required: true,
              schema: {
                type: "string",
              },
              example: "14:00",
            },
            {
              name: "timeto",
              in: "query",
              required: true,
              schema: {
                type: "string",
              },
              example: "16:00",
            },
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Schedule",
                  },
                },
              },
            },
          },
        },
      },
      "/krlweb/v1/schedule-train": {
        get: {
          summary: "Get train schedule",
          parameters: [
            {
              name: "trainid",
              in: "query",
              required: true,
              schema: {
                type: "string",
              },
              example: "5736",
            },
          ],
          responses: {
            "200": {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ScheduleTrain",
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        KrlStation: {
          type: "object",
          properties: {
            status: { type: "number" },
            message: { type: "string" },
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  sta_id: { type: "string" },
                  sta_name: { type: "string" },
                  group_wil: { type: "number" },
                  fg_enable: { type: "number" },
                },
              },
            },
          },
        },
        Schedule: {
          type: "object",
          properties: {
            status: { type: "number" },
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  train_id: { type: "string" },
                  ka_name: { type: "string" },
                  route_name: { type: "string" },
                  dest: { type: "string" },
                  time_est: { type: "string" },
                  color: { type: "string" },
                  dest_time: { type: "string" },
                },
              },
            },
          },
        },
        ScheduleTrain: {
          type: "object",
          properties: {
            status: { type: "number" },
            data: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  train_id: { type: "string" },
                  ka_name: { type: "string" },
                  station_id: { type: "string" },
                  station_name: { type: "string" },
                  time_est: { type: "string" },
                  transit_station: { type: "boolean" },
                  color: { type: "string" },
                  transit: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  return c.json(swaggerConfig);
});

app.get(
  "/",
  apiReference({
    pageTitle: "CheatSheet KRL API",
    theme: "purple",
    spec: {
      url: "/doc",
    },
  })
);

export default app;
