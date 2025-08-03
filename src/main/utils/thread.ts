import type { Thread as PrismaThread } from "../../generated/prisma/index.js";
import type { Thread } from "../github/types.ts";

export function resolveIfRead(
  thread: Thread,
  localThread: PrismaThread,
): [boolean, Date | null] {
  if (localThread.last_read_at) {
    const remoteLastReadAt = thread.last_read_at
      ? new Date(thread.last_read_at).valueOf()
      : 0;
    const localLastReadAt = localThread.last_read_at.valueOf();
    const lastReadAt = Math.max(remoteLastReadAt, localLastReadAt);

    const unread = new Date(thread.updated_at).valueOf() > lastReadAt;
    return [unread, new Date(lastReadAt)];
  }
  return [
    thread.unread,
    thread.last_read_at ? new Date(thread.last_read_at) : null,
  ];
}

export function resolveIfArchived(
  thread: Thread,
  localThread: PrismaThread,
): boolean {
  if (!localThread.archived || localThread.archived_at == null) {
    return false;
  }
  const updatedAt = new Date(thread.updated_at).valueOf();
  const archivedAt = localThread.archived_at.valueOf();
  return updatedAt <= archivedAt;
}

export function parseHeaderLink(linkHeader: string): Record<string, string> {
  const links: Record<string, string> = {};
  const linkRegex = /<([^>]+)>;\s*rel="([^"]+)"/g;
  let match;
  while ((match = linkRegex.exec(linkHeader)) !== null) {
    links[match[2]] = match[1];
  }
  return links;
}
