import React from "react";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAddAssessment } from "../useAddAssessment";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";
import { AddAssessmentPayload, Assessment } from "@/types/assessment";
import { SyncStatus } from "@/types/sync"; // Import SyncStatus
import { vi } from "vitest";
// Mock the assessmentRepository
vi.mock("@/services/assessments/assessmentRepository", () => ({
  assessmentRepository: {
    add: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("useAddAssessment", () => {
  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it("should add an assessment successfully and invalidate queries", async () => {
    const mockAssessmentPayload: AddAssessmentPayload = {
      assessment_name: "New Assessment",
      dimensions_id: ["dim1", "dim2"],
      organization_id: "org123",
      cooperation_id: "coop123",
    };
    const mockNewAssessment: Assessment = {
      id: "new-assessment-id",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(), // Explicitly set updated_at
      name: mockAssessmentPayload.assessment_name,
      dimensionIds: mockAssessmentPayload.dimensions_id,
      organization_id: mockAssessmentPayload.organization_id,
      cooperation_id: mockAssessmentPayload.cooperation_id,
      status: "TODO",
      syncStatus: SyncStatus.SYNCED, // Use SyncStatus enum
    };

    let resolveAdd: (value: Assessment) => void;
    vi.mocked(assessmentRepository.add).mockImplementation(
      (payload: AddAssessmentPayload) =>
        new Promise((resolve) => {
          resolveAdd = resolve;
        }),
    );

    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useAddAssessment(), { wrapper });

    await act(async () => {
      result.current.mutate(mockAssessmentPayload);
    });

    await waitFor(() => expect(result.current.isPending).toBe(true));
    expect(result.current.data).toBeUndefined();

    // Resolve the promise
    resolveAdd!(mockNewAssessment);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockNewAssessment);
    expect(assessmentRepository.add).toHaveBeenCalledWith(
      mockAssessmentPayload,
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ["assessments"],
    });
  });

  it("should handle error when adding an assessment", async () => {
    const errorMessage = "Failed to add assessment";
    vi.mocked(assessmentRepository.add).mockRejectedValue(
      new Error(errorMessage),
    );

    const mockAssessmentPayload: AddAssessmentPayload = {
      assessment_name: "New Assessment",
      dimensions_id: ["dim1", "dim2"],
      organization_id: "org123",
      cooperation_id: "coop123",
    };

    const { result } = renderHook(() => useAddAssessment(), { wrapper });

    result.current.mutate(mockAssessmentPayload);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe(errorMessage);
    expect(assessmentRepository.add).toHaveBeenCalledWith(
      mockAssessmentPayload,
    );
  });
});
