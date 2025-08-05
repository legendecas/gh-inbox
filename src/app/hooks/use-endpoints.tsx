import React, { createContext, useContext, useEffect, useState } from "react";

import type { Endpoint } from "../../generated/prisma/index.js";

export function useEndpoints() {
  const [updateTime, setUpdateTime] = useState(Date.now());
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
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

  return [loading, endpoints, () => setUpdateTime(Date.now())] as const;
}

export const EndpointsContext = createContext({
  loading: true,
  endpoints: [] as Endpoint[],
  refreshEndpoints: () => {
    /* no-op */
  },
});

export function useEndpointsContext() {
  return useContext(EndpointsContext);
}

export function EndpointsProvider({ children }: { children: React.ReactNode }) {
  const [loading, endpoints, refreshEndpoints] = useEndpoints();
  return (
    <EndpointsContext.Provider value={{ loading, endpoints, refreshEndpoints }}>
      {children}
    </EndpointsContext.Provider>
  );
}

export const CurrentEndpointContext = createContext({
  endpointId: 0,
});

export function useCurrentEndpointContext() {
  return useContext(CurrentEndpointContext);
}
