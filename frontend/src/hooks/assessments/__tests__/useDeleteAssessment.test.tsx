import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDeleteAssessment } from "../useDeleteAssessment";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";
import { toast } from "sonner";
import { SyncStatus } from "@/types/sync";

vi.mock("@/services/assessments/assessmentRepository", () => ({
  assessmentRepository: {
    delete: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useDeleteAssessment", () => {
  const queryClient = new QueryClient();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    vi.spyOn(queryClient, "cancelQueries").mockResolvedValue(undefined);
    // Removed specific mock for getQueryData to allow setQueryData to function properly for optimistic updates
    vi.spyOn(queryClient, "setQueryData");
    vi.spyOn(queryClient, "invalidateQueries");
  });

  it("should call assessmentRepository.delete and show success toast on successful deletion", async () => {
    (assessmentRepository.delete as Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteAssessment(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate("123");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(assessmentRepository.delete).toHaveBeenCalledWith("123");
    expect(toast.success).toHaveBeenCalledWith(
      "Assessment deleted successfully",
    );
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["assessments"],
    });
  });

  it("should show error toast and revert data on failed deletion", async () => {
    const error = new Error("Failed to delete");
    (assessmentRepository.delete as Mock).mockRejectedValue(error);

    queryClient.getQueryData = vi
      .fn()
      .mockReturnValue([
        { id: "123", name: "Test Assessment", syncStatus: SyncStatus.SYNCED },
      ]);

    const { result } = renderHook(() => useDeleteAssessment(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate("123");

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(assessmentRepository.delete).toHaveBeenCalledWith("123");
    expect(toast.error).toHaveBeenCalledWith(
      `Failed to delete assessment: ${error.message}`,
    );
    expect(queryClient.setQueryData).toHaveBeenCalledWith(
      ["assessments"],
      expect.arrayContaining([
        expect.objectContaining({ id: "123", syncStatus: SyncStatus.SYNCED }),
      ]),
    );
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["assessments"],
    });
  });

  it("should optimistically update assessment status to DELETED on mutate", async () => {
    (assessmentRepository.delete as Mock).mockResolvedValue(undefined);

    queryClient.getQueryData = vi
      .fn()
      .mockReturnValue([
        { id: "123", name: "Test Assessment", syncStatus: SyncStatus.SYNCED },
      ]);

    const { result } = renderHook(() => useDeleteAssessment(), {
      wrapper: createWrapper(queryClient),
    });

    await result.current.mutate("123");

    await waitFor(() => {
      expect(queryClient.setQueryData).toHaveBeenCalledWith(
        ["assessments"],
        expect.any(Function),
      );
    });
    expect(queryClient.cancelQueries).toHaveBeenCalledWith({
      queryKey: ["assessments"],
    });
  });
});
