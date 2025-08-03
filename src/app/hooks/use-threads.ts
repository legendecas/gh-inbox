import { useEffect, useState } from "react";

import type { ThreadListResult } from "../../common/ipc/threads.js";
import { FilterBuilder } from "../../common/search-builder/filter-builder.js";
import { SearchParser } from "../../common/search-builder/search-parser.js";
import { useAppContext } from "./use-app.js";

export function useThreads(filter: string, page: number, pageSize: number) {
  const ctx = useAppContext();
  const [updateTime, setUpdateTime] = useState(Date.now());
  const [result, setResult] = useState<ThreadListResult>({
    totalCount: 0,
    threads: [],
  });

  useEffect(() => {
    const searchParser = new SearchParser();
    const filterBuilder = new FilterBuilder();
    const parsedFilter = searchParser.parse(filter);
    const filterQuery = filterBuilder.fromRecord(parsedFilter).build();
    console.log(
      "Fetching threads with filter:",
      filterQuery,
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
          filter: filterQuery,
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
