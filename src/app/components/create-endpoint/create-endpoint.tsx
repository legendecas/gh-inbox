import { ArrowLeftIcon } from "@primer/octicons-react";
import { IconButton, PageHeader, PageLayout } from "@primer/react";
import React from "react";

import { usePathname, useQueryParam } from "../../hooks/use-location";
import { EndpointForm } from "./endpoint-form";

export function CreateEndpoint() {
  const [_pathname, setPathname] = usePathname();
  const [backPathname] = useQueryParam("back", "");

  const handleBack = () => {
    setPathname(backPathname);
  };

  return (
    <PageLayout>
      <PageLayout.Header>
        <PageHeader role="banner" aria-label="Title">
          <PageHeader.TitleArea>
            <PageHeader.Title>Connect to GitHub</PageHeader.Title>
          </PageHeader.TitleArea>

          {backPathname ? (
            <PageHeader.LeadingAction>
              <IconButton
                aria-label="Back"
                icon={ArrowLeftIcon}
                variant="invisible"
                onClick={handleBack}
              />
            </PageHeader.LeadingAction>
          ) : null}
        </PageHeader>
      </PageLayout.Header>
      <PageLayout.Content>
        <EndpointForm />
      </PageLayout.Content>
    </PageLayout>
  );
}
