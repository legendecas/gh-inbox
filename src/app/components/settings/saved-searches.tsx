import { PencilIcon, PlusIcon, TrashIcon } from "@primer/octicons-react";
import {
  ActionList,
  ActionMenu,
  Button,
  ButtonGroup,
  Dialog,
  FormControl,
  IconButton,
  PageLayout,
  RelativeTime,
  Stack,
  TextInput,
} from "@primer/react";
import { DataTable, Table } from "@primer/react/experimental";
import React, { useCallback, useEffect, useState } from "react";

import type { SavedSearch } from "../../../generated/prisma";
import { useEndpoints } from "../../hooks/use-endpoints";

function EditSearchForm({
  search,
  endpoint_id,
  onDismiss,
}: {
  search: SavedSearch | null;
  endpoint_id: number;
  onDismiss: () => void;
}) {
  function submit(formData: FormData) {
    const name = formData.get("name") as string;
    const query = formData.get("query") as string;
    console.log("Submitting search form", formData, name, query);

    if (!name || !query) {
      alert("Name and query are required.");
      return;
    }

    let submitPromise: Promise<void>;
    if (search) {
      // Update existing search
      submitPromise = window.ipc.invoke(
        "presetFilter",
        "updateSearch",
        search.id,
        {
          sort_weight: search.sort_weight,
          leading_visual: search.leading_visual,
          type: search.type,
          name,
          query,
          endpoint_id,
        },
      );
    } else {
      // Create new search
      submitPromise = window.ipc.invoke("presetFilter", "createSearch", {
        sort_weight: 0,
        leading_visual: "default",
        type: "search",
        name,
        query,
        endpoint_id,
      });
    }

    submitPromise
      .then(() => {
        onDismiss();
      })
      .catch((error) => {
        console.error("Failed to save search:", error);
        alert("Failed to save search. Check console for details.");
      });
  }

  return (
    <>
      <form action={submit}>
        <Stack space={3} direction="vertical">
          <FormControl required>
            <FormControl.Label>Name</FormControl.Label>
            <TextInput
              block
              name="name"
              defaultValue={search ? search.name : ""}
            />
          </FormControl>

          <FormControl required>
            <FormControl.Label>Query</FormControl.Label>
            <TextInput
              block
              name="query"
              defaultValue={search ? search.query : ""}
            />
          </FormControl>

          <Button variant="primary" type="submit">
            {search ? "Update" : "Create"}
          </Button>
        </Stack>
      </form>
    </>
  );
}

export default function SavedSearchesTable() {
  const [reloadSearches, setReloadSearches] = useState(Date.now());
  const [loadingEndpoints, endpoints] = useEndpoints();
  const [endpointId, setCurrentEndpoint] = useState(-1);
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [editingItem, setEditingItem] = useState<SavedSearch | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const onDialogClose = useCallback(() => {
    setIsOpen(false);
    setReloadSearches(Date.now());
  }, []);

  useEffect(() => {
    async function fetchSearches() {
      const response = await window.ipc.invoke(
        "presetFilter",
        "listSearches",
        endpointId,
      );
      setSearches(response);
    }

    if (!loadingEndpoints && endpointId === -1 && endpoints.length > 0) {
      setCurrentEndpoint(endpoints[0].id);
      return;
    }

    if (loadingEndpoints || endpoints.length === 0) {
      return;
    }
    fetchSearches();
  }, [reloadSearches, loadingEndpoints, endpoints, endpointId]);

  function handleAddSearch() {
    setEditingItem(null);
    setIsOpen(true);
  }

  return (
    <>
      {isOpen && (
        <Dialog
          title={editingItem ? "Edit Search" : "New Search"}
          onClose={onDialogClose}
        >
          <EditSearchForm
            search={editingItem}
            endpoint_id={endpointId}
            onDismiss={onDialogClose}
          />
        </Dialog>
      )}
      <Table.Container>
        <Table.Title id="endpoints-title">Saved Searches</Table.Title>
        <Table.Actions>
          <ActionMenu>
            <ActionMenu.Button>
              Endpoint: {endpoints.find((e) => e.id === endpointId)?.url}
            </ActionMenu.Button>
            <ActionMenu.Overlay>
              <ActionList>
                {endpoints.map((endpoint) => (
                  <ActionList.Item
                    key={endpoint.id}
                    onSelect={() => setCurrentEndpoint(endpoint.id)}
                  >
                    {endpoint.url}
                  </ActionList.Item>
                ))}
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
          <Button
            variant="primary"
            trailingVisual={PlusIcon}
            onClick={handleAddSearch}
          >
            Add Search
          </Button>
        </Table.Actions>
        <DataTable
          aria-labelledby="endpoints-title"
          data={searches}
          columns={[
            {
              header: "Id",
              field: "id",
              rowHeader: true,
            },
            {
              header: "Sort Weight",
              field: "sort_weight",
            },
            {
              header: "Name",
              field: "name",
            },
            {
              header: "Query",
              field: "query",
            },
            {
              header: "Updated",
              field: "updated_at",
              renderCell: (row) => {
                return <RelativeTime date={new Date(row.updated_at)} />;
              },
            },
            {
              id: "actions",
              header: () => <span>Actions</span>,
              renderCell: (row) => {
                return (
                  <ButtonGroup>
                    <IconButton
                      aria-label={`Edit: ${row.name}`}
                      title={`Edit: ${row.name}`}
                      icon={PencilIcon}
                      variant="default"
                      onClick={() => {
                        setEditingItem(row);
                        setIsOpen(true);
                      }}
                    />

                    <IconButton
                      aria-label={`Delete: ${row.name}`}
                      title={`Delete: ${row.name}`}
                      icon={TrashIcon}
                      variant="danger"
                      onClick={async () => {
                        await window.ipc.invoke(
                          "presetFilter",
                          "deleteSearch",
                          row.id,
                        );
                        setReloadSearches(Date.now());
                      }}
                    />
                  </ButtonGroup>
                );
              },
            },
          ]}
        />
      </Table.Container>
    </>
  );
}

export function SavedSearches() {
  return (
    <PageLayout>
      <PageLayout.Content>
        <SavedSearchesTable />
      </PageLayout.Content>
    </PageLayout>
  );
}
