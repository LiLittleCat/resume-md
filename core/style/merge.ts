export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) {
    return base;
  }
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return override as T;
  }

  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;
    result[key] = deepMerge(result[key], value);
  }
  return result as T;
}

export function omitUndefined<T extends Record<string, unknown>>(value: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (item !== undefined) result[key] = item;
  }
  return result as T;
}

export function deletePath(target: Record<string, unknown>, path: string[]): Record<string, unknown> {
  if (path.length === 0) return target;
  const [head, ...rest] = path;
  if (head === undefined) return target;
  if (rest.length === 0) {
    const next = { ...target };
    delete next[head];
    return next;
  }
  const child = target[head];
  if (!isPlainObject(child)) return target;
  return {
    ...target,
    [head]: deletePath(child, rest),
  };
}

export function hasPath(target: unknown, path: string[]): boolean {
  let current: unknown = target;
  for (const key of path) {
    if (!isPlainObject(current) || !(key in current)) return false;
    current = current[key];
  }
  return current !== undefined;
}
