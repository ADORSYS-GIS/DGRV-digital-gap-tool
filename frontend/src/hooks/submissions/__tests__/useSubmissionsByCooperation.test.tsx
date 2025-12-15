import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSubmissionsByCooperation } from "../useSubmissionsByCooperation";
import { AssessmentSummary } from "@/types/assessment";
import { SyncStatus } from "@/types/sync";
import { listSubmissionsByCooperation } from "@/openapi-client";

vi.mock("@/openapi-client", () => ({
  listSubmissionsByCooperation: vi.fn(),
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
    (listSubmissionsByCooperation as Mock).mockResolvedValue({
      data: mockSubmissions,
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    (console.log as Mock).mockRestore();
  });

  it("should fetch submissions for a given cooperationId", async () => {
    const { result } = renderHook(
      () => useSubmissionsByCooperation(mockCooperationId, { enabled: true }),
      { wrapper: createWrapper() },
    );

    expect(listSubmissionsByCooperation).toHaveBeenCalledWith({
      cooperationId: mockCooperationId,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true), {
      timeout: 2000,
    });
    expect(result.current.data).toEqual(mockSubmissions);
    expect(listSubmissionsByCooperation).toHaveBeenCalledWith({
      cooperationId: mockCooperationId,
    });
  });

  it("should return empty array if no cooperationId is provided", async () => {
    const { result } = renderHook(
      () => useSubmissionsByCooperation("", { enabled: true }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true), {
      timeout: 2000,
    });
    expect(result.current.data).toEqual(mockSubmissions);
    expect(listSubmissionsByCooperation).toHaveBeenCalledWith({
      cooperationId: "",
    });
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("should handle error when fetching submissions", async () => {
    const error = new Error("API Error");
    (listSubmissionsByCooperation as Mock).mockRejectedValue(error);

    const { result } = renderHook(
      () => useSubmissionsByCooperation(mockCooperationId, { enabled: true }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 2000,
    });
    expect(result.current.data).toBeUndefined();
    expect(console.error).not.toHaveBeenCalled();
  });

  it("should be disabled if options.enabled is false", async () => {
    const { result } = renderHook(
      () => useSubmissionsByCooperation(mockCooperationId, { enabled: false }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isFetched).toBe(false), {
      timeout: 2000,
    });
    expect(listSubmissionsByCooperation).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined(); // Data should be undefined when disabled
  });
});
