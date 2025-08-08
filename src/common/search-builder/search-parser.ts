const kRegExp = /([-\w]+):(?:"([^"]*)"|([^"\s]+))/g;
export class SearchParser {
  parse(search: string): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    let match: RegExpExecArray | null;

    while ((match = kRegExp.exec(search)) !== null) {
      const key = match[1];
      const value = match[2] ?? match[3];
      result[key] = [
        ...(result[key] ?? []),
        ...value.split(",").map((v) => v.trim()),
      ];
    }

    return result;
  }
}
