import { useEffect, useState } from "react";
import type { Endpoint } from "../../generated/prisma/index.js";

export function useApp() {
  const [updateTime, setUpdateTime] = useState(Date.now());
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await window.ipc.invoke("endpoint", "list");
        setEndpoints(data);
      } catch (error) {
        console.error("Error fetching threads:", error);
      }
    };

    fetch();
  }, [updateTime]);

  return [endpoints, () => setUpdateTime(Date.now())] as const;
}
