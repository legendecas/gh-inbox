import type { components } from "@octokit/openapi-types";

export type Thread = components["schemas"]["thread"];
export type ThreadRepository = components["schemas"]["thread"]["repository"];
export type PullRequest = components["schemas"]["pull-request"];
export type Issue = components["schemas"]["issue"];
export type Owner = ThreadRepository["owner"];
export type Label = components["schemas"]["label"];
export type Repository = components["schemas"]["repository"];
export type Discussion = components["schemas"]["discussion"];
