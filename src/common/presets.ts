import type { Prisma } from "../generated/prisma/index";

export type kPresetFilterTypes = "inbox" | "my_turn" | "involved";
export type ThreadFilter = Prisma.ThreadWhereInput;

export const kPageSize = 20;

export const kDefaultFilter: ThreadFilter = {
  archived: false,
};
export type kPresetFilter = Record<kPresetFilterTypes, ThreadFilter>;
export type kPresetFilterType = keyof kPresetFilter;
export const kPresetFilterTypes: kPresetFilter = {
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
      { archived: false, unread: true },
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

export function repoFilter(repoId: string): ThreadFilter {
  return {
    repository_id: repoId,
    archived: false,
  };
}
