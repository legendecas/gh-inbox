import { useEffect, useState } from "react";
import type { ThreadListResult } from "../../common/ipc/threads.js";
import type { ThreadFilter } from "../../common/presets.js";
import { useAppContext } from "./use-app.js";

export function useThreads(
  filter: ThreadFilter,
  page: number,
  pageSize: number,
) {
  const ctx = useAppContext();
  const [updateTime, setUpdateTime] = useState(Date.now());
  const [result, setResult] = useState<ThreadListResult>({
    totalCount: 0,
    threads: [],
  });

  useEffect(() => {
    console.log(
      "Fetching threads with filter:",
      filter,
      "page:",
      page,
      "pageSize:",
      pageSize,
    );
    const fetch = async () => {
      try {
        const data = await window.ipc.invoke("threads", "list", {
          page,
          pageSize,
          filter,
          endpointId: ctx.endpointId,
        });
        setResult(data);
      } catch (error) {
        console.error("Error fetching threads:", error);
      }
    };

    fetch();
  }, [updateTime, ctx.endpointId, filter, page, pageSize]);

  return [
    result.threads,
    result.totalCount,
    () => setUpdateTime(Date.now()),
  ] as const;
}
