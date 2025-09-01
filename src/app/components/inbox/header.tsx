import { ArchiveIcon, CheckboxIcon, SyncIcon } from "@primer/octicons-react";
import {
  Button,
  ButtonGroup,
  IconButton,
  PageHeader,
  RelativeTime,
  Text,
} from "@primer/react";
import React from "react";

import { useCurrentEndpointContext } from "../../hooks/use-current-endpoint";
import { useEndpointsContext } from "../../hooks/use-endpoints";
import "./header.css";

export function Header({
  selectedThreads,
  selectClosedThreads,
}: {
  selectedThreads: Set<string>;
  selectClosedThreads: () => void;
}) {
  const ctx = useCurrentEndpointContext();
  const { endpoints } = useEndpointsContext();
  const endpoint = endpoints.find((e) => e.id === ctx.endpointId);

  async function archiveThreads() {
    await window.ipc.invoke(
      "threads",
      "archive",
      ctx.endpointId,
      Array.from(selectedThreads),
    );
    ctx.refresh();
  }

  return (
    <PageHeader role="banner" aria-label="Banner" className="w-full">
      <PageHeader.TitleArea>
        <PageHeader.Title>
          <div className="flex flex-row items-center gap-x-[8px]">
            <ButtonGroup>
              <IconButton
                icon={CheckboxIcon}
                aria-label="Select closed threads"
                onClick={selectClosedThreads}
              />

              <Button
                onClick={archiveThreads}
                leadingVisual={<ArchiveIcon size={16} />}
              >
                Archive
              </Button>
            </ButtonGroup>
          </div>
        </PageHeader.Title>
      </PageHeader.TitleArea>

      <PageHeader.LeadingAction></PageHeader.LeadingAction>

      <PageHeader.TrailingAction>
        <div className="flex flex-row items-center gap-x-[8px]">
          <IconButton
            icon={SyncIcon}
            aria-label="Refresh"
            onClick={() => ctx.refresh()}
          />
          <PageHeader.Description className="inbox-header-description">
            <Text>
              Last Sync · <RelativeTime date={endpoint?.last_run} />
            </Text>
          </PageHeader.Description>
        </div>
      </PageHeader.TrailingAction>

      <PageHeader.Actions></PageHeader.Actions>
    </PageHeader>
  );
}
