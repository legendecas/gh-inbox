import "@primer/primitives/dist/css/functional/themes/light.css";
import { BaseStyles, ThemeProvider } from "@primer/react";
import React from "react";

import { AppContext, useApp } from "../../hooks/use-app";
import { FilterProvider } from "../../hooks/use-filter";
import { CreateEndpoint } from "../create-endpoint/create-endpoint";
import { Inbox } from "../inbox/inbox";

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
