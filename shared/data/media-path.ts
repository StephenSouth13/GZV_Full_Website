/** Storage folders are relative segments; reject traversal, wildcard and OS paths. */
export function isMediaPath(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 240 &&
    value.split('/').every(segment => /^[\p{L}\p{N} _.-]+$/u.test(segment) && segment !== '.' && segment !== '..')
}
