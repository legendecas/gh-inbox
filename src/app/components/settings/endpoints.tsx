import {
  KebabHorizontalIcon,
  PencilIcon,
  PlusIcon,
  SyncIcon,
} from "@primer/octicons-react";
import {
  ActionList,
  ActionMenu,
  Button,
  IconButton,
  PageLayout,
  RelativeTime,
} from "@primer/react";
import { DataTable, Table } from "@primer/react/experimental";
import React from "react";

import { useEndpoints } from "../../hooks/use-endpoints";
import { usePathname } from "../../hooks/use-location";

export default function EndpointTable() {
  const [_loading, endpoints] = useEndpoints();
  const [_pathname, setPathname] = usePathname();

  const handleAddEndpoint = () => {
    setPathname(`/create-endpoint?back=${encodeURIComponent("/settings")}`);
  };

  return (
    <Table.Container>
      <Table.Title id="endpoints-title">Endpoints</Table.Title>
      <Table.Actions>
        <Button
          variant="primary"
          trailingVisual={PlusIcon}
          onClick={handleAddEndpoint}
        >
          Add Endpoint
        </Button>
      </Table.Actions>
      <DataTable
        aria-labelledby="endpoints-title"
        data={endpoints}
        columns={[
          {
            header: "Id",
            field: "id",
            rowHeader: true,
          },
          {
            header: "URL",
            field: "url",
          },
          {
            header: "Username",
            field: "username",
          },
          {
            header: "Created",
            field: "created_at",
            renderCell: (row) => {
              return <RelativeTime date={new Date(row.created_at)} />;
            },
          },
          {
            header: "Updated",
            field: "updated_at",
            renderCell: (row) => {
              return <RelativeTime date={new Date(row.updated_at)} />;
            },
          },
          {
            header: "Expires",
            field: "expires_at",
            renderCell: (row) => {
              if (!row.expires_at) {
                return "Never";
              }
              return <RelativeTime date={new Date(row.expires_at)} />;
            },
          },
          {
            header: "Last Run",
            field: "last_run",
            renderCell: (row) => {
              if (!row.last_run) {
                return "Never";
              }
              return <RelativeTime date={new Date(row.last_run)} />;
            },
          },
          {
            id: "actions",
            header: () => <span>Actions</span>,
            renderCell: (row) => {
              return (
                <>
                  <IconButton
                    aria-label={`Edit: ${row.url}`}
                    title={`Edit: ${row.url}`}
                    icon={PencilIcon}
                    variant="invisible"
                    onClick={() => {
                      setPathname(
                        `/create-endpoint?back=${encodeURIComponent("/settings")}&endpointId=${row.id}`,
                      );
                    }}
                  />
                  <IconButton
                    aria-label={`Sync 1 day`}
                    title={`Sync 1 day`}
                    icon={SyncIcon}
                    variant="invisible"
                    onClick={() => {
                      // Trigger a sync for the endpoint
                      window.ipc.invoke(
                        "endpoint",
                        "forceSync",
                        row.id,
                        24 * 60 * 60 * 1000,
                      );
                    }}
                  />
                  <ActionMenu>
                    <ActionMenu.Anchor>
                      <IconButton
                        aria-label={`More actions`}
                        title={`More actions`}
                        icon={KebabHorizontalIcon}
                        variant="invisible"
                      />
                    </ActionMenu.Anchor>
                    <ActionMenu.Overlay>
                      <ActionList>
                        <ActionList.Item
                          onSelect={() => {
                            // Trigger a sync for the endpoint
                            window.ipc.invoke(
                              "endpoint",
                              "forceSync",
                              row.id,
                              7 * 24 * 60 * 60 * 1000,
                            );
                          }}
                        >
                          Sync 7 days
                        </ActionList.Item>
                        <ActionList.Item
                          onSelect={() => {
                            // Trigger a sync for the endpoint
                            window.ipc.invoke(
                              "endpoint",
                              "forceSync",
                              row.id,
                              14 * 24 * 60 * 60 * 1000,
                            );
                          }}
                        >
                          Sync 14 days
                        </ActionList.Item>
                        <ActionList.Divider />
                        <ActionList.Item
                          variant="danger"
                          onSelect={() => alert("TODO")}
                        >
                          Delete Endpoint
                        </ActionList.Item>
                      </ActionList>
                    </ActionMenu.Overlay>
                  </ActionMenu>
                </>
              );
            },
          },
        ]}
      />
    </Table.Container>
  );
}

export function Endpoints() {
  return (
    <PageLayout>
      <PageLayout.Content>
        <EndpointTable />
      </PageLayout.Content>
    </PageLayout>
  );
}
