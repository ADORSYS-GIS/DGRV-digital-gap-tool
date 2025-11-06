import { db } from "../db";
import { Assessment } from "@/types/assessment";
import { v4 as uuidv4 } from "uuid";
import { SyncStatus } from "@/types/sync";

export const assessmentRepository = {
  async add(assessment: Omit<Assessment, "id" | "syncStatus" | "lastModified">): Promise<Assessment> {
    const newAssessment: Assessment = {
      ...assessment,
      id: uuidv4(),
      syncStatus: "pending" as SyncStatus,
      lastModified: new Date().toISOString(),
    };
    await db.assessments.add(newAssessment);
    return newAssessment;
  },

  async getAll(): Promise<Assessment[]> {
    return await db.assessments.toArray();
  },

  async getById(id: string): Promise<Assessment | undefined> {
    return await db.assessments.get(id);
  },

  async update(assessment: Assessment): Promise<Assessment> {
    const updatedAssessment: Assessment = {
      ...assessment,
      syncStatus: "pending" as SyncStatus,
      lastModified: new Date().toISOString(),
    };
    await db.assessments.put(updatedAssessment);
    return updatedAssessment;
  },

  async delete(id: string): Promise<void> {
    await db.assessments.delete(id);
  },
};