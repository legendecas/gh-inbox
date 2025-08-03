import { useEffect, useState } from "react";

import type { ListResult } from "../../common/ipc/preset-filter.js";
import { useAppContext } from "./use-app.js";

export function usePresetFilter() {
  const ctx = useAppContext();
  const [presetFilters, setPresetFilters] = useState<ListResult>({
    presetFilters: [],
    repoNamespaces: [],
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await window.ipc.invoke("presetFilter", "list", {
          endpointId: ctx.endpointId,
        });
        setPresetFilters(data);
      } catch (error) {
        console.error("Error fetching preset filters:", error);
      }
    };

    fetch();
  }, [ctx.endpointId]);

  return presetFilters;
}
