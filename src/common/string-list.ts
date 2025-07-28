export function parseStringListStr(listStr: string): string[] {
  if (listStr === "") {
    return [];
  }
  let arr = listStr.split("|");
  arr = arr.slice(1, arr.length - 1);

  return arr;
}

export function formatStringList(list: string[]): string {
  if (list.length === 0) {
    return "";
  }
  if (list.length === 1) {
    return `|${list[0]}|`;
  }
  return `|${list.join("|")}|`;
}
