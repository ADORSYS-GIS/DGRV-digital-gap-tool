import { db } from "../db";
import { Dimension } from "@/types/dimension";

export const dimensionRepository = {
  getAll: () => db.dimensions.toArray(),
  add: (dimension: Dimension) => db.dimensions.add(dimension),
  update: (id: string, changes: Partial<Dimension>) =>
    db.dimensions.update(id, changes),
  delete: (id: string) => db.dimensions.delete(id),
};
