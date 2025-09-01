import React, { createContext, useContext, useEffect, useState } from "react";

import type { EndpointData } from "../../common/ipc/endpoint.js";

export function useEndpoints() {
  const [updateTime, setUpdateTime] = useState(Date.now());
  const [endpoints, setEndpoints] = useState<EndpointData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await window.ipc.invoke("endpoint", "list");
        setEndpoints(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching threads:", error);
      }
    };

    fetch();
  }, [updateTime]);

  return [
    loading,
    endpoints,
    updateTime,
    () => setUpdateTime(Date.now()),
  ] as const;
}

export const EndpointsContext = createContext({
  loading: true,
  endpoints: [] as EndpointData[],
  updateTime: 0,
  refreshEndpoints: () => {
    /* no-op */
  },
});

export function useEndpointsContext() {
  return useContext(EndpointsContext);
}

export function EndpointsProvider({ children }: { children: React.ReactNode }) {
  const [loading, endpoints, updateTime, refreshEndpoints] = useEndpoints();
  return (
    <EndpointsContext.Provider
      value={{ loading, endpoints, updateTime, refreshEndpoints }}
    >
      {children}
    </EndpointsContext.Provider>
  );
}
