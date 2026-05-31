const kRegExp = /([-\w]+):(?:"([^"]*)"|([^"\s]+))/g;

export class SearchParser {
  parse(search: string): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    let match: RegExpExecArray | null;

    kRegExp.lastIndex = 0;
    while ((match = kRegExp.exec(search)) !== null) {
      const key = match[1];
      const value = match[2] ?? match[3];
      result[key] = [
        ...(result[key] ?? []),
        ...value.split(",").map((v) => v.trim()),
      ];
    }

    // Remaining text after stripping key:value pairs becomes the keyword.
    // E.g. "state:open docs foobar" -> keyword "docs foobar".
    const remainingText = stripMatches(search).trim();
    if (remainingText) {
      result.$keyword = [remainingText];
    }

    return result;
  }
}

function stripMatches(input: string): string {
  let output = input;
  const matches: { start: number; end: number }[] = [];
  kRegExp.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = kRegExp.exec(input)) !== null) {
    matches.push({ start: match.index, end: kRegExp.lastIndex });
  }
  for (const m of matches.reverse()) {
    output = output.slice(0, m.start) + output.slice(m.end);
  }
  return output;
}
