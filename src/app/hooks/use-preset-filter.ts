import { useEffect, useState } from "react";

import type { ListResult } from "../../common/ipc/preset-filter.js";
import { useCurrentEndpointContext } from "./use-current-endpoint.js";

export function usePresetFilter() {
  const ctx = useCurrentEndpointContext();
  const [listResult, setListResult] = useState<ListResult>({
    presetFilters: [],
    searches: [],
    repoNamespaces: [],
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await window.ipc.invoke("presetFilter", "list", {
          endpointId: ctx.endpointId,
        });
        setListResult(data);
      } catch (error) {
        console.error("Error fetching preset filters:", error);
      }
    };

    fetch();
  }, [ctx.updateTime, ctx.endpointId]);

  return listResult;
}
