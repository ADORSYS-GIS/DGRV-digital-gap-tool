import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAssessmentsByCooperation } from "../useAssessmentsByCooperation";
import * as openapiServices from "@/openapi-client/services.gen";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";

vi.mock("@/openapi-client/services.gen", () => ({
  ...vi.importActual("@/openapi-client/services.gen"),
  listAssessments: vi.fn(),
}));

vi.mock("@/services/assessments/assessmentRepository", () => ({
  assessmentRepository: {
    deleteByCooperationId: vi.fn(),
    bulkAdd: vi.fn(),
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

describe("useAssessmentsByCooperation", () => {
  const mockCooperationId = "coop-123";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  });

  it("should return empty array if no cooperationId is provided", async () => {
    const { result } = renderHook(() => useAssessmentsByCooperation(""), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  describe("When Online", () => {
    it("should fetch from API, sync to DB, and return formatted data", async () => {
      const mockApiResponse = {
        data: {
          items: [
            {
              assessment_id: "1",
              document_title: "Test Doc",
              organization_id: "org-1",
              cooperation_id: mockCooperationId,
              status: "pending",
              started_at: null,
              completed_at: null,
              created_at: "2023-01-01",
              updated_at: "2023-01-01",
              dimensions_id: ["dim-1"],
            },
            {
              assessment_id: "2",
              document_title: "Another Doc",
              organization_id: "org-1",
              cooperation_id: "another-coop",
              status: "completed",
              started_at: "2023-01-02",
              completed_at: "2023-01-02",
              created_at: "2023-01-02",
              updated_at: "2023-01-02",
              dimensions_id: ["dim-2"],
            },
          ],
          limit: 20,
          page: 1,
          total: 2,
          total_pages: 1,
        },
      };

      (openapiServices.listAssessments as Mock).mockResolvedValue(
        mockApiResponse,
      );

      const { result } = renderHook(
        () => useAssessmentsByCooperation(mockCooperationId),
        { wrapper: createWrapper() },
      );

      // Wait for the query to finish
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Assertions
      expect(openapiServices.listAssessments).toHaveBeenCalledWith({});

      // Verify DB sync occurred
      expect(assessmentRepository.deleteByCooperationId).toHaveBeenCalledWith(
        mockCooperationId,
      );
      expect(assessmentRepository.bulkAdd).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: "1",
            name: "Test Doc",
            syncStatus: "synced",
          }),
        ]),
      );

      // Verify returned data matches the transformation logic
      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0]?.name).toBe("Test Doc");
    });

    it("should return empty array on API failure (catch block)", async () => {
      // Force API error
      (openapiServices.listAssessments as Mock).mockRejectedValue(
        new Error("API Error"),
      );

      // Spy on console.error to keep test output clean
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const { result } = renderHook(
        () => useAssessmentsByCooperation(mockCooperationId),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
      consoleSpy.mockRestore();
    });
  });

  describe("When Offline", () => {
    beforeEach(() => {
      // Simulate Offline
      vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    });

    it("should skip API call and fetch from local repository", async () => {
      const mockLocalData = [{ id: "local-1", name: "Local Doc" }];
      (assessmentRepository.getAll as Mock).mockResolvedValue(mockLocalData);

      const { result } = renderHook(
        () => useAssessmentsByCooperation(mockCooperationId),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Ensure API was NOT called
      expect(openapiServices.listAssessments).not.toHaveBeenCalled();

      // Ensure Local DB WAS called
      expect(assessmentRepository.getAll).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockLocalData);
    });
  });
});
