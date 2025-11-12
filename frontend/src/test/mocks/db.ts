import { vi } from "vitest";

export const mockDb = {
  organizations: {
    get: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    toArray: vi.fn(),
    bulkAdd: vi.fn(),
    where: vi.fn().mockReturnThis(),
    clear: vi.fn(),
  },
  dimensions: {
    get: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    toArray: vi.fn(),
    bulkAdd: vi.fn(),
    where: vi.fn().mockReturnThis(),
    clear: vi.fn(),
  },
  digitalisationLevels: {
    get: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    toArray: vi.fn(),
    bulkAdd: vi.fn(),
    where: vi.fn().mockReturnThis(),
    clear: vi.fn(),
  },
  digitalisationGaps: {
    get: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    toArray: vi.fn().mockResolvedValue([]),
    bulkAdd: vi.fn(),
    where: vi.fn().mockReturnThis(),
    clear: vi.fn(),
  },
  sync_queue: {
    get: vi.fn(),
    add: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    toArray: vi.fn(),
    bulkAdd: vi.fn(),
    where: vi.fn().mockReturnThis(),
    first: vi.fn(),
    clear: vi.fn(),
  },
  transaction: vi.fn().mockImplementation(async (mode, tables, tx) => {
    return await tx();
  }),
};