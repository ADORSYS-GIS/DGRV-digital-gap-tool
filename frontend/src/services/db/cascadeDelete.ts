import { db } from "../db";
import { safeFilterDelete, safeWhereEquals } from "./queryHelpers";

async function runCacheCleanupStep(
  label: string,
  cleanup: () => Promise<void>,
): Promise<void> {
  try {
    await cleanup();
  } catch (error) {
    console.warn(`Unable to clean ${label} from IndexedDB cache:`, error);
  }
}

async function deleteByCompositeOrId<T extends { id: string; lang?: string }>(
  table: { bulkDelete: (keys: any[]) => Promise<unknown> },
  records: T[],
): Promise<void> {
  if (records.length === 0) {
    return;
  }

  const compositeKeys = records.map((record) => [
    record.id,
    record.lang || "en",
  ]);

  try {
    await table.bulkDelete(compositeKeys);
  } catch (error) {
    console.warn(
      "Composite-key cache delete failed, retrying with id keys:",
      error,
    );
    await table.bulkDelete(records.map((record) => record.id));
  }
}

/**
 * Remove all locally cached records tied to a dimension (all languages).
 */
export async function cascadeDeleteDimensionCache(
  dimensionId: string,
  dimensionKey?: string | null,
): Promise<void> {
  const key = dimensionKey ?? dimensionId;

  await runCacheCleanupStep("dimensions", async () => {
    const dimensions = await safeWhereEquals(db.dimensions, "id", dimensionId);
    await deleteByCompositeOrId(db.dimensions, dimensions);
  });

  await runCacheCleanupStep("digitalisation levels", async () => {
    const levels = (await db.digitalisationLevels.toArray()).filter(
      (l) => l.dimensionId === dimensionId,
    );
    await deleteByCompositeOrId(db.digitalisationLevels, levels);
  });

  await runCacheCleanupStep("digitalisation gaps", async () => {
    const gaps = (await db.digitalisationGaps.toArray()).filter(
      (g) => g.dimensionId === dimensionId || g.dimension_key === key,
    );
    await deleteByCompositeOrId(db.digitalisationGaps, gaps);
  });

  await runCacheCleanupStep("dimension state cache", async () => {
    const cachedStates = (await db.dimensionWithStatesCache.toArray()).filter(
      (d) => d.id === dimensionId,
    );
    await deleteByCompositeOrId(db.dimensionWithStatesCache, cachedStates);
  });

  await runCacheCleanupStep("legacy dimension state cache", async () => {
    await db.dimensionWithStates.delete(dimensionId);
  });

  await runCacheCleanupStep("dimension assessments", async () => {
    try {
      await db.dimensionAssessments
        .where("dimensionId")
        .equals(dimensionId)
        .delete();
    } catch {
      const assessments = (await db.dimensionAssessments.toArray()).filter(
        (a) => a.dimensionId === dimensionId,
      );
      if (assessments.length > 0) {
        await db.dimensionAssessments.bulkDelete(
          assessments.map((a) => a.id),
        );
      }
    }
  });

  await runCacheCleanupStep("sync queue entries", async () => {
    await safeFilterDelete(
      db.sync_queue,
      (item) => item.entityId === dimensionId,
    );
  });
}
