import { Octokit } from "@octokit/core";
import { ProxyAgent, fetch as undiciFetch } from "undici";

export class GitHubClient {
  private octokit: Octokit;

  constructor(baseUrl: string, token: string, proxyUrl?: string | null) {
    let fetchFn: typeof undiciFetch = undiciFetch;
    if (proxyUrl) {
      const agent = new ProxyAgent(proxyUrl);
      fetchFn = (url, options) => {
        return undiciFetch(url, { ...options, dispatcher: agent });
      };
    }
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
