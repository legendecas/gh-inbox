import { PageHeader, PageLayout } from "@primer/react";
import React from "react";

import { EndpointForm } from "./endpoint-form";

export function CreateEndpoint() {
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
        <EndpointForm />
      </PageLayout.Content>
    </PageLayout>
  );
}
