import { useEffect, useState } from "react";

export function useQueryParams() {
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});

  useEffect(() => {
    console.log("Initializing query params from URL", window.location.search);
    const params = new URLSearchParams(window.location.search);
    const paramsObject: Record<string, string> = {};
    params.forEach((value, key) => {
      paramsObject[key] = value;
    });
    setQueryParams(paramsObject);
  }, []);

  function updateQueryParams(newParams: Record<string, string>) {
    console.log("Updating query params:", newParams);
    const mergedParams = { ...queryParams, ...newParams };
    const params = new URLSearchParams(mergedParams);
    window.history.pushState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
    setQueryParams(mergedParams);
  }

  return [queryParams, updateQueryParams] as const;
}

interface SerDes<T> {
  serialize: (value: T) => string;
  deserialize: (value: string) => T;
}
export function useQueryParam<T>(
  key: string,
  { serialize, deserialize }: SerDes<T>,
  defaultValue: T,
): [T, (value: T) => void] {
  const [queryParams, updateQueryParams] = useQueryParams();

  function setQueryParam(value: T) {
    updateQueryParams({ [key]: serialize(value) });
  }

  return [
    queryParams[key] ? deserialize(queryParams[key]) : defaultValue,
    setQueryParam,
  ];
}
