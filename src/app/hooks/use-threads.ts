import { useEffect, useState } from "react";
import type { ThreadListResult } from "../../common/ipc/threads.js";

export function useThreads(page: number, pageSize: number) {
  const [updateTime, setUpdateTime] = useState(Date.now());
  const [result, setResult] = useState<ThreadListResult>({
    totalCount: 0,
    threads: [],
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await window.ipc.invoke("threads", "list", {
          page,
          pageSize,
        });
        setResult(data);
      } catch (error) {
        console.error("Error fetching threads:", error);
      }
    };

    fetch();
  }, [updateTime, page, pageSize]);

  return [
    result.threads,
    result.totalCount,
    () => setUpdateTime(Date.now()),
  ] as const;
}
