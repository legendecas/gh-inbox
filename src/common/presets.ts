import type { Prisma } from "../generated/prisma/index";

export type ThreadFilter = Prisma.ThreadWhereInput;

export const kPageSize = 20;

export const kDefaultFilter: ThreadFilter = {
  archived: false,
};
export type kPresetFilterType =
  | "inbox"
  | "my_turn"
  | "involved"
  | "bookmarked"
  | "review_requested"
  | "assigned";
export const kPresetFilterSearches: Record<kPresetFilterType, string> = {
  inbox: "",
  my_turn: "unread:true reasons:author,comment,manual,mention",
  involved: "reasons:author,comment,manual,mention,team_mention",
  bookmarked: "bookmarked:true",
  review_requested: "reasons:review_requested bot:false",
  assigned: "reasons:assign bot:false",
};

export function repoFilter(repoId: string): ThreadFilter {
  return {
    repository_id: repoId,
    archived: false,
  };
}
