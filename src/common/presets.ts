import type { Prisma } from "../generated/prisma/index";

export type ThreadFilter = Prisma.ThreadWhereInput;

export const kPageSize = 20;

export const kDefaultFilter: ThreadFilter = {
  archived: false,
};
export type kPresetFilterType = "inbox" | "my_turn" | "involved";
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
};
export const kPresetFilterSearches: Record<kPresetFilterType, string> = {
  inbox: "",
  my_turn: "unread:true reasons:author,comment,manual,mention",
  involved: "reasons:author,comment,manual,mention,team_mention",
};

export function repoFilter(repoId: string): ThreadFilter {
  return {
    repository_id: repoId,
    archived: false,
  };
}
