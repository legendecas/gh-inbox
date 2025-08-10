import { TextInput } from "@primer/react";
import React, { useEffect, useRef, useState } from "react";

import { useFilterContext } from "../../../hooks/use-filter";

export function SearchBox() {
  const { filter, setFilter } = useFilterContext();
  const [inputValue, setInputValue] = useState(filter);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setInputValue(filter);
  }, [filter]);

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setInputValue(value);
    // Debounce
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setFilter(value);
    }, 2000);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      if (timerRef.current) clearTimeout(timerRef.current);
      setFilter(inputValue);
    }
  }

  return (
    <TextInput
      placeholder="Search..."
      monospace={true}
      value={inputValue}
      onChange={onChange}
      onKeyDown={onKeyDown}
      className="w-full"
    />
  );
}
