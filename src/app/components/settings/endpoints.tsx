import { PencilIcon, PlusIcon } from "@primer/octicons-react";
import { Button, IconButton, PageLayout, RelativeTime } from "@primer/react";
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
            id: "actions",
            header: () => <span>Actions</span>,
            renderCell: (row) => {
              return (
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
