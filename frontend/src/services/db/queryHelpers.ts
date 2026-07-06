import type { Table } from "dexie";

export function isIndexNotFoundError(error: unknown): boolean {
  const name = error instanceof Error ? error.name : "";
  const message = error instanceof Error ? error.message : String(error);
  return (
    name === "NotFoundError" ||
    message.includes("index was not found") ||
    message.includes("specified index was not found") ||
    message.includes("IDBObjectStore")
  );
}

/**
 * Query by a secondary index, falling back to a full table scan when the
 * index is missing (e.g. after a partial IndexedDB schema migration).
 */
export async function safeWhereEquals<T extends Record<string, unknown>>(
  table: Table<T, unknown>,
  indexName: string,
  value: unknown,
): Promise<T[]> {
  try {
    return await table.where(indexName).equals(value).toArray();
  } catch (error) {
    if (!isIndexNotFoundError(error)) {
      throw error;
    }
    return (await table.toArray()).filter(
      (item) => item[indexName] === value,
    );
  }
}

export async function safeWhereEqualsFirst<T extends Record<string, unknown>>(
  table: Table<T, unknown>,
  indexName: string,
  value: unknown,
): Promise<T | undefined> {
  const results = await safeWhereEquals(table, indexName, value);
  return results[0];
}

export async function safeWhereAnyOf<T extends Record<string, unknown>>(
  table: Table<T, unknown>,
  indexName: string,
  values: unknown[],
): Promise<T[]> {
  if (values.length === 0) {
    return [];
  }
  try {
    return await table.where(indexName).anyOf(values).toArray();
  } catch (error) {
    if (!isIndexNotFoundError(error)) {
      throw error;
    }
    const valueSet = new Set(values);
    return (await table.toArray()).filter((item) =>
      valueSet.has(item[indexName]),
    );
  }
}

export async function safeFilterDelete(
  table: Table<unknown, unknown>,
  predicate: (item: Record<string, unknown>) => boolean,
): Promise<void> {
  const items = (await table.toArray()).filter((item) =>
    predicate(item as Record<string, unknown>),
  );
  const keys = items
    .map((item) => table.schema.primKey.extractKey(item))
    .filter((key) => key !== undefined);
  if (keys.length > 0) {
    await table.bulkDelete(keys);
  }
}
