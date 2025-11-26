import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSubmissionsByCooperation } from "../useSubmissionsByCooperation";
import { submissionRepository } from "@/services/assessments/submissionRepository";
import { AssessmentSummary } from "@/types/assessment";
import { SyncStatus } from "@/types/sync";

vi.mock("@/services/assessments/submissionRepository", () => ({
  submissionRepository: {
    listByCooperation: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useSubmissionsByCooperation", () => {
  const mockCooperationId = "coop-123";
  const mockSubmissions: AssessmentSummary[] = [
    {
      id: "sub-1",
      assessment: {
        assessment_id: "assess-1",
        document_title: "Assessment 1",
        organization_id: "org-1",
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        dimensions_id: [],
        cooperation_id: mockCooperationId,
        completed_at: null,
        started_at: null,
      },
      dimension_assessments: [],
      gaps_count: 0,
      recommendations_count: 0,
      overall_score: null,
      syncStatus: SyncStatus.SYNCED,
    },
    {
      id: "sub-2",
      assessment: {
        assessment_id: "assess-2",
        document_title: "Assessment 2",
        organization_id: "org-1",
        status: "completed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        dimensions_id: [],
        cooperation_id: mockCooperationId,
        completed_at: new Date().toISOString(),
        started_at: new Date().toISOString(),
      },
      dimension_assessments: [],
      gaps_count: 0,
      recommendations_count: 0,
      overall_score: null,
      syncStatus: SyncStatus.SYNCED,
    },
    {
      id: "sub-3",
      assessment: {
        assessment_id: "assess-3",
        document_title: "Assessment 3",
        organization_id: "org-1",
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        dimensions_id: [],
        cooperation_id: mockCooperationId,
        completed_at: null,
        started_at: null,
      },
      dimension_assessments: [],
      gaps_count: 0,
      recommendations_count: 0,
      overall_score: null,
      syncStatus: SyncStatus.SYNCED,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (submissionRepository.listByCooperation as Mock).mockResolvedValue(
      mockSubmissions,
    );
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    (console.warn as Mock).mockRestore();
    (console.error as Mock).mockRestore();
    (console.log as Mock).mockRestore();
  });

  it("should fetch submissions for a given cooperationId", async () => {
    const { result } = renderHook(
      () => useSubmissionsByCooperation(mockCooperationId),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockSubmissions);
    expect(submissionRepository.listByCooperation).toHaveBeenCalledWith(
      mockCooperationId,
    );
  });

  it("should return empty array if no cooperationId is provided", async () => {
    const { result } = renderHook(() => useSubmissionsByCooperation(""), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
    expect(submissionRepository.listByCooperation).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      "No cooperation ID provided to useSubmissionsByCooperation",
    );
  });

  it("should filter submissions by status", async () => {
    const { result } = renderHook(
      () =>
        useSubmissionsByCooperation(mockCooperationId, {
          status: ["completed"],
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0]?.assessment.status).toBe("completed");
  });

  it("should limit the number of submissions", async () => {
    const { result } = renderHook(
      () => useSubmissionsByCooperation(mockCooperationId, { limit: 2 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0]?.id).toBe("sub-1");
    expect(result.current.data?.[1]?.id).toBe("sub-2");
  });

  it("should filter by status and limit submissions", async () => {
    const { result } = renderHook(
      () =>
        useSubmissionsByCooperation(mockCooperationId, {
          status: ["pending"],
          limit: 1,
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0]?.assessment.status).toBe("pending");
    expect(result.current.data?.[0]?.id).toBe("sub-1");
  });

  it("should handle error when fetching submissions", async () => {
    const error = new Error("API Error");
    (submissionRepository.listByCooperation as Mock).mockRejectedValue(error);

    const { result } = renderHook(
      () => useSubmissionsByCooperation(mockCooperationId),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true)); // The hook catches the error and returns empty array, so isSuccess is true
    expect(result.current.data).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      "Failed to fetch cooperation submissions:",
      error,
    );
  });

  it("should be disabled if options.enabled is false", async () => {
    const { result } = renderHook(
      () => useSubmissionsByCooperation(mockCooperationId, { enabled: false }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isFetched).toBe(false));
    expect(submissionRepository.listByCooperation).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined(); // Data should be undefined when disabled
  });
});
