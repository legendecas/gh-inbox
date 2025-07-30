import React from "react";

import "@primer/primitives/dist/css/functional/themes/light.css";
import { BaseStyles, ThemeProvider } from "@primer/react";

import { FilterProvider } from "../../hooks/use-filter";
import { Inbox } from "../inbox/inbox";
import { AppContext, useApp } from "../../hooks/use-app";
import { CreateEndpoint } from "../create-endpoint/create-endpoint";

export function App() {
  const [endpoints, refreshEndpoints] = useApp();

  if (endpoints.length === 0) {
    return <CreateEndpoint refreshEndpoints={refreshEndpoints} />;
  }
  return (
    <AppContext.Provider value={{ endpointId: endpoints[0].id }}>
      <Inbox />
    </AppContext.Provider>
  );
}

export function AppContainer() {
  return (
    <ThemeProvider>
      <BaseStyles>
        <FilterProvider>
          <App />
        </FilterProvider>
      </BaseStyles>
    </ThemeProvider>
  );
}
