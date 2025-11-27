import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSubmissions } from "../useSubmissions";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";
import { Assessment } from "@/types/assessment";
import { SyncStatus } from "@/types/sync";

vi.mock("@/services/assessments/assessmentRepository", () => ({
  assessmentRepository: {
    getAll: vi.fn(),
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

describe("useSubmissions", () => {
  const mockAssessments: Assessment[] = [
    {
      id: "assess-1",
      name: "Assessment 1",
      organization_id: "org-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: "pending",
      syncStatus: SyncStatus.SYNCED,
    },
    {
      id: "assess-2",
      name: "Assessment 2",
      organization_id: "org-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: "completed",
      syncStatus: SyncStatus.SYNCED,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (assessmentRepository.getAll as Mock).mockResolvedValue(mockAssessments);
  });

  it("should fetch all submissions successfully", async () => {
    const { result } = renderHook(() => useSubmissions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockAssessments);
    expect(assessmentRepository.getAll).toHaveBeenCalled();
  });

  it("should not fetch submissions if enabled is false", async () => {
    const { result } = renderHook(() => useSubmissions({ enabled: false }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isFetched).toBe(false));
    expect(assessmentRepository.getAll).not.toHaveBeenCalled();
  });

  it("should handle error when fetching submissions", async () => {
    const error = new Error("Failed to fetch submissions");
    (assessmentRepository.getAll as Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useSubmissions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(error);
  });
});
