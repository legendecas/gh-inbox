import { PageHeader, PageLayout } from "@primer/react";
import React from "react";

import { EndpointForm } from "./endpoint-form";

export interface CreateEndpointProps {
  refreshEndpoints: () => void;
}

export function CreateEndpoint({ refreshEndpoints }: CreateEndpointProps) {
  return (
    <PageLayout>
      <PageLayout.Header>
        <PageHeader role="banner" aria-label="Title">
          <PageHeader.TitleArea>
            <PageHeader.Title>Connect to GitHub</PageHeader.Title>
          </PageHeader.TitleArea>
        </PageHeader>
      </PageLayout.Header>
      <PageLayout.Content>
        <EndpointForm refreshEndpoints={refreshEndpoints} />
      </PageLayout.Content>
    </PageLayout>
  );
}
