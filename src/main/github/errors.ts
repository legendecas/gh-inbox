/**
 * Octokit rejects non-2xx responses instead of returning them, so callers
 * inspect the thrown error to detect a missing resource.
 */
export function isNotFoundError(error: unknown): boolean {
  return error instanceof Error && "status" in error && error.status === 404;
}
