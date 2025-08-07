import { Octokit } from "@octokit/core";
import { getCACertificates, rootCertificates } from "node:tls";
import { Agent, Dispatcher, ProxyAgent, fetch as undiciFetch } from "undici";

export class GitHubClient {
  private octokit: Octokit;

  constructor(baseUrl: string, token: string, proxyUrl?: string | null) {
    const combinedCACertificates = [
      ...getCACertificates("system"),
      ...rootCertificates,
    ];

    let agent: Dispatcher;
    if (proxyUrl) {
      agent = new ProxyAgent({
        uri: proxyUrl,
        proxyTls: {
          ca: combinedCACertificates,
        },
        requestTls: {
          ca: combinedCACertificates,
        },
      });
    } else {
      agent = new Agent({
        connect: {
          ca: combinedCACertificates,
        },
      });
    }
    const fetchFn: typeof undiciFetch = (url, options) => {
      return undiciFetch(url, { ...options, dispatcher: agent });
    };
    this.octokit = new Octokit({
      auth: token,
      baseUrl,
      request: { fetch: fetchFn },
    });
  }

  get instance() {
    return this.octokit;
  }
}
