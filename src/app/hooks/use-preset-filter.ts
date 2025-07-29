import { useEffect, useState } from "react";
import type { ListResult } from "../../common/ipc/preset-filter.js";

export function usePresetFilter() {
  const [presetFilters, setPresetFilters] = useState<ListResult>({
    presetFilters: [],
    repoNamespaces: [],
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await window.ipc.invoke("presetFilter", "list");
        setPresetFilters(data);
      } catch (error) {
        console.error("Error fetching preset filters:", error);
      }
    };

    fetch();
  }, []);

  return presetFilters;
}
