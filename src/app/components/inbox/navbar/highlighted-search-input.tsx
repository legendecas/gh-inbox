import React, { useCallback, useRef } from "react";
import { kFilterKeys } from "../../../../common/search-builder/filter-keys";
import "./highlighted-search-input.css";



const kFilterPattern = /([-\w]+):(?:"([^"]*)"|([^\s"]+))/g;

type Token =
  | { type: "keyword"; text: string }
  | { type: "filter"; key: string; text: string }
  | { type: "invalid-filter"; text: string };

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  kFilterPattern.lastIndex = 0;
  while ((match = kFilterPattern.exec(input)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: "keyword",
        text: input.slice(lastIndex, match.index),
      });
    }

    const rawKey = match[1];
    const displayText = match[0];
    const key = rawKey.startsWith("-") ? rawKey.slice(1) : rawKey;

    if (kFilterKeys.has(key)) {
      tokens.push({ type: "filter", key, text: displayText });
    } else {
      tokens.push({ type: "invalid-filter", text: displayText });
    }

    lastIndex = match.index + displayText.length;
  }

  if (lastIndex < input.length) {
    tokens.push({
      type: "keyword",
      text: input.slice(lastIndex),
    });
  }

  return tokens;
}

function tokenClass(token: Token): string {
  switch (token.type) {
    case "keyword":
      return "highlighted-search-input__keyword";
    case "invalid-filter":
      return "highlighted-search-input__filter-invalid";
    case "filter":
      return `highlighted-search-input__filter-${token.key}`;
  }
}

export function HighlightedSearchInput({
  value,
  placeholder = "Search...",
  onChange,
  onKeyDown,
}: {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const tokens = tokenize(value);

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange(event.target.value);
  }

  const handleScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  return (
    <div className="highlighted-search-input">
      <div
        ref={highlightRef}
        className="highlighted-search-input__highlight"
        aria-hidden="true"
      >
        {tokens.length === 0 && (
          <span className="highlighted-search-input__keyword">{value}</span>
        )}
        {tokens.map((token, i) => (
          <span key={i} className={tokenClass(token)}>
            {token.text}
          </span>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        className="highlighted-search-input__textarea"
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        onScroll={handleScroll}
        rows={1}
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
      />
    </div>
  );
}
