import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAssessment } from "../useAssessment";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";
import { ReactNode } from "react";
import { Assessment } from "@/types/assessment";
import { SyncStatus } from "@/types/sync";

// Mock the assessmentRepository
vi.mock("@/services/assessments/assessmentRepository", () => ({
  assessmentRepository: {
    getById: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries for tests
    },
  },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("useAssessment", () => {
  afterEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it("fetches assessment by ID successfully", async () => {
    const mockAssessment: Assessment = {
      id: "1",
      name: "Test Assessment",
      status: "IN_PROGRESS",
      organization_id: "org1",
      cooperation_id: "coop1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      syncStatus: SyncStatus.SYNCED,
    };

    (assessmentRepository.getById as vi.Mock).mockResolvedValue(mockAssessment);

    const { result } = renderHook(() => useAssessment("1"), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockAssessment);
    expect(assessmentRepository.getById).toHaveBeenCalledWith("1");
  });

  it("handles error when fetching assessment", async () => {
    const errorMessage = "Failed to fetch assessment";
    (assessmentRepository.getById as vi.Mock).mockRejectedValue(
      new Error(errorMessage),
    );

    const { result } = renderHook(() => useAssessment("1"), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe(errorMessage);
    expect(assessmentRepository.getById).toHaveBeenCalledWith("1");
  });

  it("returns undefined if assessmentId is not provided", async () => {
    (assessmentRepository.getById as vi.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAssessment(""), { wrapper });

    expect(result.current.isLoading).toBe(false); // Query should not run

    await waitFor(() => expect(result.current.data).toBeUndefined());
    expect(assessmentRepository.getById).not.toHaveBeenCalled(); // getById should not be called
  });
});
