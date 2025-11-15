import { db } from "../db";
import { Cooperation } from "@/types/cooperation";

class CooperationRepository {
  async getAll() {
    return db.table("cooperations").toArray();
  }

  async getById(id: string) {
    return db.table("cooperations").get(id);
  }

  async add(cooperation: Cooperation) {
    return db.table("cooperations").add(cooperation);
  }

  async update(id: string, updates: Partial<Cooperation>) {
    return db.table("cooperations").update(id, updates);
  }

  async delete(id: string) {
    return db.table("cooperations").delete(id);
  }
}

export const cooperationRepository = new CooperationRepository();
