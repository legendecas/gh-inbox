import React, { useEffect, useRef, useState } from "react";

import { useFilterContext } from "../../../hooks/use-filter";
import { HighlightedSearchInput } from "./highlighted-search-input";

export function SearchBox() {
  const { filter, setFilter } = useFilterContext();
  const [inputValue, setInputValue] = useState(filter);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setInputValue(filter);
  }, [filter]);

  function onChange(value: string) {
    setInputValue(value);
    // Debounce
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setFilter(value);
    }, 2000);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      if (timerRef.current) clearTimeout(timerRef.current);
      setFilter(inputValue);
    }
  }

  return (
    <HighlightedSearchInput
      placeholder="Search..."
      value={inputValue}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
  );
}
