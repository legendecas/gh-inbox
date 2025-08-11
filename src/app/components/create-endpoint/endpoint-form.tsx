import { Button, FormControl, Stack, TextInput } from "@primer/react";
import { InlineMessage } from "@primer/react/experimental";
import React, { useState } from "react";

import type { TestResult } from "../../../common/ipc/endpoint";
import { useEndpointsContext } from "../../hooks/use-endpoints";

export interface EndpointFormProps {
  endpointId?: string | null;
  onBack: () => void;
}
export function EndpointForm({ endpointId, onBack }: EndpointFormProps) {
  const { endpoints, refreshEndpoints } = useEndpointsContext();
  const endpoint = endpoints.find((e) => `${e.id}` === endpointId) || null;

  const [loading, setLoading] = useState(0);
  const [testResult, setTestResult] = useState<
    [TestResult | null, unknown | null]
  >([null, null]);

  const validateForm = (formData: FormData) => {
    const endpointUrl = formData.get("endpoint_url");
    const token = formData.get("token");
    if (!endpointUrl || !token) {
      alert("Endpoint URL and Token are required.");
      return false;
    }
    return {
      endpointUrl: endpointUrl.toString(),
      token: token.toString(),
      proxyUrl: formData.get("proxy_url")?.toString() || "",
    };
  };

  const handleTestConnection = async (formData: FormData) => {
    setTestResult([null, null]);

    const validated = validateForm(formData);
    if (!validated) return;

    // Simulate a test connection
    try {
      setLoading(1);
      const result = await window.ipc.invoke("endpoint", "test", {
        url: validated.endpointUrl,
        token: validated.token,
        proxy_url: validated.proxyUrl,
      });
      setTestResult([result, null]);
    } catch (error) {
      setTestResult([null, error]);
    } finally {
      setLoading(0);
    }
  };

  const handleCreateEndpoint = async (formData: FormData) => {
    setTestResult([null, null]);

    const validated = validateForm(formData);
    if (!validated) return;

    try {
      setLoading(2);
      if (endpoint) {
        // Update existing endpoint
        await window.ipc.invoke("endpoint", "update", endpoint.id, {
          url: validated.endpointUrl,
          token: validated.token,
          proxy_url: validated.proxyUrl,
        });
      } else {
        // Create new endpoint
        await window.ipc.invoke("endpoint", "create", {
          url: validated.endpointUrl,
          token: validated.token,
          proxy_url: validated.proxyUrl,
        });
      }
      refreshEndpoints();
      onBack();
    } catch (error) {
      setTestResult([null, error]);
    } finally {
      setLoading(0);
    }
  };

  return (
    <form action={handleCreateEndpoint}>
      <Stack space={3} direction="vertical">
        <FormControl required>
          <FormControl.Label>Endpoint URL</FormControl.Label>
          <TextInput
            block
            name="endpoint_url"
            defaultValue={endpoint?.url || "https://api.github.com"}
          />
        </FormControl>

        <FormControl required>
          <FormControl.Label>Token</FormControl.Label>
          <TextInput block name="token" defaultValue={endpoint?.token || ""} />
        </FormControl>

        <FormControl>
          <FormControl.Label>Proxy URL</FormControl.Label>
          <TextInput
            block
            name="proxy_url"
            defaultValue={endpoint?.proxy_url || ""}
          />
        </FormControl>

        <Stack space={2} direction="horizontal">
          <Button
            type="submit"
            formAction={handleTestConnection}
            loading={loading === 1}
            disabled={loading > 0}
          >
            Test Connection
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={loading === 2}
            disabled={loading > 0}
          >
            {endpointId ? "Update Endpoint" : "Create Endpoint"}
          </Button>
        </Stack>

        {testResult && testResult[0] && (
          <InlineMessage variant="success">
            Authorized as {testResult[0].username} and expires at{" "}
            {String(testResult[0].expiresAt)}.
          </InlineMessage>
        )}
        {testResult && testResult[1] ? (
          <InlineMessage variant="critical">
            {String(testResult[1])}
          </InlineMessage>
        ) : null}
      </Stack>
    </form>
  );
}
