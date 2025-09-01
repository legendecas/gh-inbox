import React, { createContext, useContext, useEffect, useState } from "react";

import type { ThreadItem, ThreadListResult } from "../../common/ipc/threads.js";
import { FilterBuilder } from "../../common/search-builder/filter-builder.js";
import { SearchParser } from "../../common/search-builder/search-parser.js";
import { useCurrentEndpointContext } from "./use-current-endpoint.js";
import { useFilterContext } from "./use-filter.js";

export const ThreadsContext = createContext({
  totalCount: 0,
  threads: [] as ThreadItem[],
  updateTime: Date.now(),
  refreshThreads: () => {
    /* no-op */
  },
});

export function useThreadsContext() {
  return useContext(ThreadsContext);
}

export function ThreadsProvider({ children }: React.PropsWithChildren) {
  const ctx = useCurrentEndpointContext();
  const { filter, currentPage: page, pageSize } = useFilterContext();
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
  }, [ctx.updateTime, ctx.endpointId, filter, page, pageSize]);

  return (
    <ThreadsContext.Provider
      value={{
        threads: result.threads,
        totalCount: result.totalCount,
        updateTime: ctx.updateTime,
        refreshThreads: () => ctx.refresh(),
      }}
    >
      {children}
    </ThreadsContext.Provider>
  );
}
