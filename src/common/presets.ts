import type { Prisma } from "../generated/prisma/index";

export type kPresetFilterTypes = "my_turn" | "involved";
export type ThreadFilter = Prisma.ThreadWhereInput;

export const kPageSize = 20;

export type kPresetFilter = Record<kPresetFilterTypes, ThreadFilter>;
export const kPresetFilterTypes: kPresetFilter = {
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
