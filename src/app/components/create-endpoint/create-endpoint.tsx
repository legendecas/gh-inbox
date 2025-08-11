import { ArrowLeftIcon } from "@primer/octicons-react";
import { IconButton, Link, PageHeader, PageLayout } from "@primer/react";
import React from "react";

import { usePathname, useQueryParam } from "../../hooks/use-location";
import { EndpointForm } from "./endpoint-form";

export function CreateEndpoint() {
  const [_pathname, setPathname] = usePathname();
  const [backPathname] = useQueryParam("back", "/");
  const [endpointId] = useQueryParam("endpointId", undefined);

  const handleBack = () => {
    setPathname(backPathname);
  };

  return (
    <PageLayout>
      <PageLayout.Header>
        <PageHeader role="banner" aria-label="Title">
          <PageHeader.TitleArea>
            <PageHeader.Title>
              {endpointId ? "Edit GitHub Connection" : "Connect to GitHub"}
            </PageHeader.Title>
          </PageHeader.TitleArea>
          <PageHeader.Description>
            <div
              className="flow flow-col"
              style={{ color: "var(--fgColor-muted)" }}
            >
              <p>
                Generate a personal access token at{" "}
                <Link href="https://github.com/settings/tokens" target="_blank">
                  GitHub Settings
                </Link>{" "}
                with at least the following scopes:
              </p>
              <ul>
                <li>* repo (Read issues and pulls in private repos)</li>
                <li>* notifications (Required to read notifications)</li>
                <li>* user:email (Show user email as id)</li>
              </ul>
            </div>
          </PageHeader.Description>

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
        <EndpointForm endpointId={endpointId} onBack={handleBack} />
      </PageLayout.Content>
    </PageLayout>
  );
}
