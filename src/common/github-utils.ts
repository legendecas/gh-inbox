// Urls like https://api.github.com/repos/nodejs/node-gyp/issues/3095
// and enterprise url like https://github.mycompany.com/api/v3/repos/nodejs/node-gyp/issues/3095
export function getSubjectPathnameEssence(url: string): {
  pathname: string;
  owner: string;
  repoName: string;
  type: string;
  number: number;
} | null {
  const match = new URL(url).pathname.match(
    /\/repos\/([^/]+)\/([^/]+)\/([^/]+)\/(\d+)/,
  );
  if (match == null) return null;

  const [pathname, owner, repoName, type, number] = match;
  return {
    pathname,
    owner,
    repoName,
    type,
    number: parseInt(number, 10),
  };
}
