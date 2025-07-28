export type SubjectType = "PullRequest" | "Issue" | "Discussion";
export const kSubjectType = {
  PullRequest: "PullRequest",
  Issue: "Issue",
  Discussion: "Discussion",
};

export type StateType = "open" | "closed" | "merged" | "draft";
export const kStateType = {
  open: "open",
  closed: "closed",
  merged: "merged",
  draft: "draft",
};
