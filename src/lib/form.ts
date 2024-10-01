export function isEmptyOrWhitespace(str: string): boolean {
  return str === null || str === undefined || str.trim() === "";
}
