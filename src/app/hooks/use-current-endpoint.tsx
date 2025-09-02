import React, { createContext, useContext, useEffect, useState } from "react";

import { useEndpointsContext } from "./use-endpoints";

export const CurrentEndpointContext = createContext({
  endpointId: 0,
  setEndpointId: (_id: number) => {
    /* no-op */
  },
  updateTime: 0,
  refresh: () => {
    /* no-op */
  },
});

export function useCurrentEndpointContext() {
  return useContext(CurrentEndpointContext);
}

export function CurrentEndpointProvider({ children }: React.PropsWithChildren) {
  const { endpoints, updateTime, refreshEndpoints } = useEndpointsContext();
  const [currentEndpointId, setCurrentEndpointId] = useState(-1);

  useEffect(() => {
    if (endpoints.length > 0 && currentEndpointId === -1) {
      setCurrentEndpointId(endpoints[0].id);
    }
  }, [endpoints, currentEndpointId]);

  return (
    <CurrentEndpointContext.Provider
      value={{
        endpointId: currentEndpointId,
        setEndpointId: setCurrentEndpointId,
        updateTime,
        refresh: refreshEndpoints,
      }}
    >
      {children}
    </CurrentEndpointContext.Provider>
  );
}
