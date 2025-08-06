import type { Endpoint } from "../../generated/prisma";

export interface CreateEndpointData {
  url: string;
  token: string;
  proxy_url?: string;
}

export interface TestResult {
  username: string;
  authScopes: string[];
  expiresAt: Date | null;
}

export interface EndpointEndpoint {
  list: () => Promise<Endpoint[]>;
  create: (data: CreateEndpointData) => Promise<Endpoint>;
  update: (id: number, data: CreateEndpointData) => Promise<Endpoint>;
  test: (data: CreateEndpointData) => Promise<TestResult>;
}
