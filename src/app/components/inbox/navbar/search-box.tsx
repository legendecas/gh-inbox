import { TextInput } from "@primer/react";
import React, { useEffect, useState } from "react";

import { useFilterContext } from "../../../hooks/use-filter";

let timer: ReturnType<typeof setTimeout>;
export function SearchBox() {
  const { filter, setFilter } = useFilterContext();
  const [inputValue, setInputValue] = useState(filter);

  useEffect(() => {
    setInputValue(filter);
  }, [filter]);

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setInputValue(value);
    // Debounce
    clearTimeout(timer);
    timer = setTimeout(() => {
      setFilter(value);
    }, 2000);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      clearTimeout(timer);
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
