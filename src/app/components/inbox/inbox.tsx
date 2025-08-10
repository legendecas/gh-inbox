import { Spinner, SplitPageLayout } from "@primer/react";
import { Banner } from "@primer/react/experimental";
import React, { useEffect } from "react";

import {
  CurrentEndpointProvider,
  useCurrentEndpointContext,
} from "../../hooks/use-current-endpoint";
import { useEndpointsContext } from "../../hooks/use-endpoints";
import { FilterProvider } from "../../hooks/use-filter";
import { usePathname } from "../../hooks/use-location";
import { ThreadsProvider } from "../../hooks/use-threads";
import { Content } from "./content";
import { Navbar } from "./navbar/navbar";
import { Sidebar } from "./sidebar/sidebar";

function ExpirationInfo() {
  const { endpointId } = useCurrentEndpointContext();
  const { endpoints } = useEndpointsContext();
  const endpoint = endpoints.find((e) => e.id === endpointId);
  const expires_at = endpoint?.expires_at?.getTime();
  if (expires_at == null) {
    return null;
  }

  if (expires_at - Date.now() <= 0) {
    return (
      <Banner
        aria-label="Critical"
        title="Critical"
        description="The token has expired."
        variant="critical"
      />
    );
  }

  if (expires_at - Date.now() <= 7 * 24 * 60 * 60 * 1000) {
    return (
      <Banner
        title="Info"
        description={`The token expires soon, at ${new Date(expires_at).toLocaleString()}.`}
      />
    );
  }

  return null;
}

export function Inbox() {
  const { loading: loadingEndpoints, endpoints } = useEndpointsContext();
  const [_pathname, setPathname] = usePathname();

  useEffect(() => {
    if (loadingEndpoints) {
      return;
    }
    if (endpoints.length === 0) {
      setPathname("/create-endpoint");
    }
  }, [loadingEndpoints, endpoints]);

  if (loadingEndpoints || endpoints.length === 0) {
    return <Spinner />;
  }

  return (
    <CurrentEndpointProvider>
      <FilterProvider>
        <ThreadsProvider>
          <SplitPageLayout>
            <SplitPageLayout.Header padding="none">
              <Navbar />
            </SplitPageLayout.Header>
            <SplitPageLayout.Pane
              position="start"
              padding="none"
              aria-label="Sidebar"
            >
              <Sidebar />
            </SplitPageLayout.Pane>
            <SplitPageLayout.Content padding="condensed" width="full">
              <div className="flex flex-col gap-y-[8px]">
                <ExpirationInfo />
                <Content />
              </div>
            </SplitPageLayout.Content>
          </SplitPageLayout>
        </ThreadsProvider>
      </FilterProvider>
    </CurrentEndpointProvider>
  );
}
