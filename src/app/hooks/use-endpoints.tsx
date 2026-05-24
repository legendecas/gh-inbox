import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import type { EndpointData } from "../../common/ipc/endpoint.js";

const kFocusRefreshIntervalMs = 3 * 60 * 1000;

export function useEndpoints() {
  const [updateTime, setUpdateTime] = useState(Date.now());
  const [endpoints, setEndpoints] = useState<EndpointData[]>([]);
  const [loading, setLoading] = useState(true);
  const lastFocusRefreshRef = useRef(0);
  const refreshEndpoints = useCallback(() => {
    setUpdateTime(Date.now());
  }, []);

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

  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === "hidden") {
        return;
      }

      const now = Date.now();
      if (now - lastFocusRefreshRef.current < kFocusRefreshIntervalMs) {
        return;
      }
      lastFocusRefreshRef.current = now;
      refreshEndpoints();
    };

    window.addEventListener("focus", refreshIfVisible);
    document.addEventListener("visibilitychange", refreshIfVisible);
    return () => {
      window.removeEventListener("focus", refreshIfVisible);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [refreshEndpoints]);

  return [loading, endpoints, updateTime, refreshEndpoints] as const;
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
