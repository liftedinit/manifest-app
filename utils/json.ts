export function isJsonString(str: string): boolean {
  try {
    const parsed = JSON.parse(str);
    return parsed !== null && (typeof parsed === 'object' || Array.isArray(parsed));
  } catch (e) {
    return false;
  }
}
