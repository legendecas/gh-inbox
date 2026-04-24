import express from "express";
import { type Server, createServer } from "node:http";
import path from "node:path";
import superjson from "superjson";

import { kAppDir } from "./constants.ts";
import type { IService } from "./service-manager.ts";
import type { Logger } from "./utils/logger.ts";

export const kWebPort = 2959;

export class WebServer {
  #server?: Server;
  #services: Map<string, IService>;
  #logger: Logger;

  constructor(services: Map<string, IService>, logger: Logger) {
    this.#services = services;
    this.#logger = logger.child({ name: "web-server" });
  }

  start() {
    const app = express();
    app.use(express.json());

    app.post("/api/ipc", async (req, res) => {
      const { namespace, channel, args = [] } = req.body;
      const service = [...this.#services.values()].find(
        (s) => s.namespace === namespace,
      );
      if (!service) {
        res
          .status(404)
          .type("json")
          .send(
            superjson.stringify({ error: `Unknown namespace: ${namespace}` }),
          );
        return;
      }
      const method = (service as any)[channel];
      if (typeof method !== "function") {
        res
          .status(404)
          .type("json")
          .send(
            superjson.stringify({
              error: `Unknown channel: ${namespace}:${channel}`,
            }),
          );
        return;
      }
      try {
        const result = await method.apply(service, args);
        res.type("json").send(superjson.stringify({ result: result ?? null }));
      } catch (error: any) {
        this.#logger.error(
          "Error handling web IPC %s:%s: %s",
          namespace,
          channel,
          error,
        );
        res
          .status(500)
          .type("json")
          .send(
            superjson.stringify({ error: error?.message ?? "Internal error" }),
          );
      }
    });

    app.use(express.static(kAppDir));

    // SPA fallback
    app.get("*splat", (_req, res) => {
      res.sendFile(path.join(kAppDir, "index.html"));
    });

    this.#server = createServer(app);
    this.#server.listen(kWebPort, "127.0.0.1", () => {
      this.#logger.info(
        "Web server listening on http://localhost:%d",
        kWebPort,
      );
    });
  }

  close() {
    this.#server?.close();
  }
}
