import React, { createContext, useContext, useEffect, useState } from "react";

import { useEndpointsContext } from "./use-endpoints";

export const CurrentEndpointContext = createContext({
  endpointId: 0,
  setEndpointId: (_id: number) => {
    /* no-op */
  },
  updateTime: 0,
  setUpdateTime: (_time: number) => {
    /* no-op */
  },
});

export function useCurrentEndpointContext() {
  return useContext(CurrentEndpointContext);
}

export function CurrentEndpointProvider({ children }: React.PropsWithChildren) {
  const [updateTime, setUpdateTime] = useState(Date.now());
  const { endpoints } = useEndpointsContext();
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
        setUpdateTime,
      }}
    >
      {children}
    </CurrentEndpointContext.Provider>
  );
}
