import "@primer/primitives/dist/css/functional/themes/light.css";
import { BaseStyles, ThemeProvider } from "@primer/react";
import React from "react";

import { EndpointsProvider } from "../../hooks/use-endpoints";
import { LocationProvider, usePathname } from "../../hooks/use-location";
import { CreateEndpoint } from "../create-endpoint/create-endpoint";
import { Inbox } from "../inbox/inbox";
import { Settings } from "../settings/settings";

export function App() {
  const [pathname] = usePathname();
  console.log("App pathname:", pathname);

  switch (pathname) {
    case "/create-endpoint":
      return <CreateEndpoint />;
    case "/settings":
      return <Settings />;
    default:
      return <Inbox />;
  }
}

export function AppContainer() {
  return (
    <ThemeProvider>
      <BaseStyles>
        <LocationProvider>
          <EndpointsProvider>
            <App />
          </EndpointsProvider>
        </LocationProvider>
      </BaseStyles>
    </ThemeProvider>
  );
}
