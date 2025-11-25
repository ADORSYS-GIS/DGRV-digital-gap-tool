import { renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAssessmentsByOrganization } from "../useAssessmentsByOrganization";
import { listAssessments } from "@/openapi-client/services.gen";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";

vi.mock("@/openapi-client/services.gen", () => ({
  listAssessments: vi.fn(),
}));

vi.mock("@/services/assessments/assessmentRepository", () => ({
  assessmentRepository: {
    deleteByOrganizationId: vi.fn(),
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

describe("useAssessmentsByOrganization", () => {
  const mockOrgId = "org-123";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  });

  it("should return an empty array if organizationId is missing", async () => {
    const { result } = renderHook(() => useAssessmentsByOrganization(""), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
    expect(listAssessments).not.toHaveBeenCalled();
  });

  describe("When Online", () => {
    it("should fetch from API, sync to DB, and return formatted data", async () => {
      const mockApiResponse = {
        data: {
          items: [
            {
              assessment_id: "assess-01",
              document_title: "Org Assessment Doc",
              organization_id: mockOrgId,
              status: "completed",
              started_at: "2023-01-01T10:00:00Z",
              completed_at: "2023-01-01T11:00:00Z",
              created_at: "2023-01-01T09:00:00Z",
              updated_at: "2023-01-01T11:00:00Z",
              dimensions_id: ["dim-A"],
            },
          ],
        },
      };

      (listAssessments as vi.Mock).mockResolvedValue(mockApiResponse);

      const { result } = renderHook(
        () => useAssessmentsByOrganization(mockOrgId),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(listAssessments).toHaveBeenCalledWith({});

      const expectedAssessment = expect.objectContaining({
        id: "assess-01",
        name: "Org Assessment Doc",
        organization_id: mockOrgId,
        syncStatus: "synced",
        dimensionIds: ["dim-A"],
      });

      expect(assessmentRepository.deleteByOrganizationId).toHaveBeenCalledWith(
        mockOrgId,
      );
      expect(assessmentRepository.bulkAdd).toHaveBeenCalledWith(
        expect.arrayContaining([expectedAssessment]),
      );

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0]?.id).toBe("assess-01");
    });

    it("should return empty array and log error on API failure", async () => {
      (listAssessments as vi.Mock).mockRejectedValue(
        new Error("Network Error"),
      );

      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const { result } = renderHook(
        () => useAssessmentsByOrganization(mockOrgId),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("When Offline", () => {
    beforeEach(() => {
      vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    });

    it("should bypass API and fetch from local repository", async () => {
      const mockLocalData = [
        { id: "local-1", name: "Offline Doc", organization_id: mockOrgId },
      ];

      (assessmentRepository.getAll as vi.Mock).mockResolvedValue(mockLocalData);

      const { result } = renderHook(
        () => useAssessmentsByOrganization(mockOrgId),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Ensure API was NOT called
      expect(listAssessments).not.toHaveBeenCalled();

      // Ensure Local DB WAS called
      expect(assessmentRepository.getAll).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockLocalData);
    });
  });
});
