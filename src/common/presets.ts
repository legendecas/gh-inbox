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
export type kPresetFilter = Record<kPresetFilterType, ThreadFilter>;
export const kPresetFilterQueries: kPresetFilter = {
  inbox: kDefaultFilter,
  my_turn: {
    AND: [
      { archived: false, unread: true },
      {
        OR: [
          { reasons: { contains: "|author|" } },
          { reasons: { contains: "|comment|" } },
          { reasons: { contains: "|manual|" } },
          { reasons: { contains: "|mention|" } },
        ],
      },
    ],
  },
  involved: {
    AND: [
      { archived: false },
      {
        OR: [
          { reasons: { contains: "|author|" } },
          { reasons: { contains: "|comment|" } },
          { reasons: { contains: "|manual|" } },
          { reasons: { contains: "|mention|" } },
          { reasons: { contains: "|team_mention|" } },
        ],
      },
    ],
  },
  bookmarked: {
    AND: [{ archived: false, bookmarked: true }],
  },
  review_requested: {
    AND: [{ archived: false, reasons: { contains: "|review_requested|" } }],
  },
  assigned: {
    AND: [{ archived: false, reasons: { contains: "|assigned|" } }],
  },
};
export const kPresetFilterSearches: Record<kPresetFilterType, string> = {
  inbox: "",
  my_turn: "unread:true reasons:author,comment,manual,mention",
  involved: "reasons:author,comment,manual,mention,team_mention",
  bookmarked: "bookmarked:true",
  review_requested: "reasons:review_requested",
  assigned: "reasons:assign",
};

export function repoFilter(repoId: string): ThreadFilter {
  return {
    repository_id: repoId,
    archived: false,
  };
}
