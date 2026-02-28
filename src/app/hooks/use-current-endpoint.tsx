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

  useEffect(() => {
    const KEY_CODE_1 = "1".charCodeAt(0);
    const KEY_CODE_9 = "9".charCodeAt(0);

    function onKeyDown(event: KeyboardEvent) {
      if (!event.metaKey) return;
      const keyCode = event.key.charCodeAt(0);
      if (
        event.key.length !== 1 ||
        keyCode < KEY_CODE_1 ||
        keyCode > KEY_CODE_9
      )
        return;
      const index = keyCode - KEY_CODE_1;
      const endpoint = endpoints[index];
      if (!endpoint) return;
      event.preventDefault();
      setCurrentEndpointId(endpoint.id);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [endpoints]);

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
