import { Button, FormControl, Stack, TextInput } from "@primer/react";
import { InlineMessage } from "@primer/react/experimental";
import React, { useRef, useState } from "react";

import type { TestResult } from "../../../common/ipc/endpoint";
import type { CreateEndpointProps } from "./create-endpoint";

export function EndpointForm({ refreshEndpoints }: CreateEndpointProps) {
  const [testResult, setTestResult] = useState<
    [TestResult | null, unknown | null]
  >([null, null]);
  const endpointUrlRef = useRef<HTMLInputElement>(null);
  const tokenRef = useRef<HTMLInputElement>(null);

  const handleTestConnection = async () => {
    if (!endpointUrlRef.current || !tokenRef.current) {
      return;
    }
    // Simulate a test connection
    try {
      const result = await window.ipc.invoke("endpoint", "test", {
        url: endpointUrlRef.current.value,
        token: tokenRef.current.value,
      });
      setTestResult([result, null]);
    } catch (error) {
      setTestResult([null, error]);
    }
  };

  const handleCreateEndpoint = async () => {
    if (!endpointUrlRef.current || !tokenRef.current) {
      return;
    }
    try {
      await window.ipc.invoke("endpoint", "create", {
        url: endpointUrlRef.current.value,
        token: tokenRef.current.value,
      });
      refreshEndpoints();
    } catch (error) {
      console.error("Failed to create endpoint:", error);
    }
  };

  return (
    <form>
      <Stack space={3} direction="vertical">
        <FormControl required>
          <FormControl.Label>Endpoint URL</FormControl.Label>
          <TextInput
            block
            defaultValue="https://api.github.com"
            ref={endpointUrlRef}
          />
        </FormControl>

        <FormControl required>
          <FormControl.Label>Token</FormControl.Label>
          <TextInput block ref={tokenRef} />
        </FormControl>

        <Stack space={2} direction="horizontal">
          <Button onClick={handleTestConnection}>
            Test Connection
          </Button>
          <Button variant="primary" onClick={handleCreateEndpoint}>
            Create Endpoint
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
