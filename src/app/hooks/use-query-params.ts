import { useEffect, useState } from "react";

export function useQueryParams() {
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});

  useEffect(() => {
    console.log("Initializing query params from URL", window.location.search);
    const params = new URLSearchParams(window.location.search);
    const paramsObject: Record<string, string> = Object.fromEntries(
      params.entries(),
    );
    setQueryParams(paramsObject);
  }, []);

  function updateQueryParams(newParams: Record<string, string>) {
    console.log("Updating query params:", newParams, window.location.search);
    const params = new URLSearchParams(window.location.search);
    Object.entries(newParams).forEach(([key, value]) => {
      params.set(key, value);
    });
    window.history.pushState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
    const paramsObject: Record<string, string> = Object.fromEntries(
      params.entries(),
    );
    setQueryParams(paramsObject);
  }

  return [queryParams, updateQueryParams] as const;
}

interface SerDes<T> {
  serialize: (value: T) => string;
  deserialize: (value: string) => T;
}
const kDefaultSerDes: SerDes<string> = {
  serialize: (value: string) => value,
  deserialize: (value: string) => value,
};
export function useQueryParam<T = string>(
  key: string,
  defaultValue: T,
  serDes: SerDes<T> = kDefaultSerDes as unknown as SerDes<T>,
): [T, (value: T) => void] {
  const [queryParams, updateQueryParams] = useQueryParams();

  function setQueryParam(value: T) {
    updateQueryParams({ [key]: serDes.serialize(value) });
  }

  return [
    queryParams[key] ? serDes.deserialize(queryParams[key]) : defaultValue,
    setQueryParam,
  ];
}
