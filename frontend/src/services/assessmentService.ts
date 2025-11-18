import { AssessmentInput, SubmitAssessmentResponse } from "@/types/assessment";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const submitAssessment = async (
  assessmentData: AssessmentInput[],
): Promise<SubmitAssessmentResponse> => {
  const response = await fetch(`${API_BASE_URL}/assessments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Add authorization header if needed, e.g., 'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(assessmentData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to submit assessment");
  }

  return response.json();
};
