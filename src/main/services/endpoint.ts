import type { OctokitResponse } from "@octokit/types";

import type {
  CreateEndpointData,
  EndpointEndpoint,
  TestResult,
} from "../../common/ipc/endpoint.js";
import type { Endpoint } from "../../generated/prisma/index.js";
import type { Application } from "../application.ts";
import type { Prisma } from "../database/prisma.ts";
import { GitHubClient } from "../github/client.js";
import type { IService, IpcHandle } from "../service-manager.ts";

class ConnectionError extends Error {
  constructor(message: string, resp: OctokitResponse<unknown>) {
    super(message);
    this.name = "ConnectionError";
    this.cause = resp;
  }
}

const kRequiredScopes = ["notifications", ["user", "user:email"]];

export class EndpointService implements IService, EndpointEndpoint {
  namespace = "endpoint";

  #app: Application;
  #db: Prisma;

  constructor(app: Application, db: Prisma) {
    this.#app = app;
    this.#db = db;
  }

  wire(ipcHandle: IpcHandle): void {
    ipcHandle.wire("list", this.list);
    ipcHandle.wire("test", this.test);
    ipcHandle.wire("create", this.create);
  }

  async list(): Promise<Endpoint[]> {
    return this.#db.instance.endpoint.findMany();
  }

  async test(data: CreateEndpointData): Promise<TestResult> {
    const gh = new GitHubClient(data.url, data.token, data.proxy_url);
    const resp = await gh.instance.request("GET /user");
    if (resp.status !== 200) {
      throw new ConnectionError(`Failed to connect to GitHub`, resp);
    }
    const authScopesStr = resp.headers["x-oauth-scopes"] ?? "";
    const authScopes = authScopesStr.split(",").map((scope) => scope.trim());

    if (!this.checkScopes(authScopes)) {
      throw new ConnectionError(
        `Insufficient scopes. Required: ${kRequiredScopes.join(", ")}`,
        resp,
      );
    }
    const expiration = resp.headers["github-authentication-token-expiration"];

    return {
      username: resp.data.login,
      authScopes,
      expiresAt: expiration ? new Date(expiration) : null,
    };
  }

  async create(data: CreateEndpointData): Promise<Endpoint> {
    const result = await this.test(data);
    const endpoint = await this.#db.instance.endpoint.create({
      data: {
        url: data.url,
        token: data.token,
        proxy_url: data.proxy_url,
        username: result.username,
        expires_at: result.expiresAt,
      },
    });

    this.#app.taskRunner.schedule();

    return endpoint;
  }

  checkScopes(scopes: readonly string[]): boolean {
    return kRequiredScopes.every((requiredScope) => {
      if (Array.isArray(requiredScope)) {
        return requiredScope.some((scope) => scopes.includes(scope));
      }
      return scopes.includes(requiredScope);
    });
  }
}
