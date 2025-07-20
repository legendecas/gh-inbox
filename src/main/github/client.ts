import { Octokit } from "@octokit/core";

export class GitHubClient {
  private octokit: Octokit;

  constructor(baseUrl: string, token: string) {
    this.octokit = new Octokit({ auth: token, baseUrl });
  }

  get instance() {
    return this.octokit;
  }
}
