export type SubjectType = "PullRequest" | "Issue" | "Discussion";
export const kSubjectType = {
  PullRequest: "PullRequest",
  Issue: "Issue",
  Discussion: "Discussion",
} as const;

export type StateType = "open" | "closed" | "merged" | "draft";
export const kStateType = {
  open: "open",
  closed: "closed",
  merged: "merged",
  draft: "draft",
} as const;

// https://docs.github.com/en/rest/activity/notifications?apiVersion=2022-11-28#about-notification-reasons
export type kReasonType =
  | "approval_requested"
  | "assign"
  | "author"
  | "comment"
  | "ci_activity"
  | "invitation"
  | "manual"
  | "member_feature_requested"
  | "mention"
  | "review_requested"
  | "security_alert"
  | "security_advisory_credit"
  | "state_change"
  | "subscribed"
  | "team_mention";
export const kReasonType = {
  approval_requested: "approval_requested",
  assign: "assign",
  author: "author",
  comment: "comment",
  ci_activity: "ci_activity",
  invitation: "invitation",
  manual: "manual",
  member_feature_requested: "member_feature_requested",
  mention: "mention",
  review_requested: "review_requested",
  security_alert: "security_alert",
  security_advisory_credit: "security_advisory_credit",
  state_change: "state_change",
  subscribed: "subscribed",
  team_mention: "team_mention",
} as const;
