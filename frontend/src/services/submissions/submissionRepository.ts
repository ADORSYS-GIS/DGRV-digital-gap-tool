import { db } from "../db";
import { Submission } from "@/types/submission";
import { v4 as uuidv4 } from "uuid";

export const submissionRepository = {
  async getAllSubmissions() {
    return db.submissions.toArray();
  },

  async getSubmissionsByAssessmentId(assessmentId: string) {
    return db.submissions.where({ assessmentId }).toArray();
  },

  async getSubmission(assessmentId: string, dimensionId: string) {
    return db.submissions
      .where({ assessmentId, dimensionId })
      .first();
  },

  async saveSubmission(submission: Omit<Submission, "id">) {
    const id = uuidv4();
    const newSubmission = { ...submission, id };
    await db.submissions.put(newSubmission);
    return newSubmission;
  },
};