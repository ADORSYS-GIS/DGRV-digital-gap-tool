import { useEffect, useState } from "react";
import { db } from "@/services/db";

/**
 * Returns the number of items currently pending sync in the queue.
 * Updates reactively when the queue changes.
 */
export const usePendingSyncCount = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      const n = await db.sync_queue.count();
      if (!cancelled) setCount(n);
    };

    refresh();

    // Poll every 3 seconds — lightweight enough and avoids Dexie observable complexity
    const interval = setInterval(refresh, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return count;
};
