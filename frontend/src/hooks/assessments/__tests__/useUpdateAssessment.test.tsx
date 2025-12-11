import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUpdateAssessment } from "../useUpdateAssessment";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";

vi.mock("@/services/assessments/assessmentRepository", () => ({
  assessmentRepository: {
    update: vi.fn(),
  },
}));

let queryClient: QueryClient;

const createWrapper = () => {
  queryClient = new QueryClient({
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

describe("useUpdateAssessment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call assessmentRepository.update and invalidate queries on success", async () => {
    const mockAssessmentId = "123";
    const mockUpdate = {
      name: "Updated Title",
      organization_id: "org-1",
      created_at: "2023-01-01",
      updated_at: "2023-01-02",
      status: "in-progress",
    };
    (assessmentRepository.update as Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useUpdateAssessment(), {
      wrapper: createWrapper(),
    });

    vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
    result.current.mutate({ id: mockAssessmentId, assessment: mockUpdate });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(assessmentRepository.update).toHaveBeenCalledWith(
      mockAssessmentId,
      mockUpdate,
    );
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["assessments"],
    });
  });

  it("should handle error when updating assessment", async () => {
    const error = new Error("Failed to update");
    (assessmentRepository.update as Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useUpdateAssessment(), {
      wrapper: createWrapper(),
    });

    vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
    result.current.mutate({
      id: "123",
      assessment: {
        name: "Failed Update",
        organization_id: "org-1",
        created_at: "2023-01-01",
        updated_at: "2023-01-01",
        status: "pending",
      },
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled();
  });
});
