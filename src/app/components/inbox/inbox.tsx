import { Spinner, SplitPageLayout } from "@primer/react";
import React, { useEffect } from "react";

import { CurrentEndpointProvider } from "../../hooks/use-current-endpoint";
import { useEndpointsContext } from "../../hooks/use-endpoints";
import { FilterProvider } from "../../hooks/use-filter";
import { usePathname } from "../../hooks/use-location";
import { Content } from "./content";
import { Navbar } from "./navbar/navbar";
import { Sidebar } from "./sidebar/sidebar";

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
        <SplitPageLayout>
          <SplitPageLayout.Header padding="none">
            <Navbar />
          </SplitPageLayout.Header>
          <SplitPageLayout.Pane position="start" padding="none">
            <Sidebar />
          </SplitPageLayout.Pane>
          <SplitPageLayout.Content padding="condensed" width="full">
            <Content />
          </SplitPageLayout.Content>
        </SplitPageLayout>
      </FilterProvider>
    </CurrentEndpointProvider>
  );
}
