import { renderHook, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAssessmentsByOrganization } from "../useAssessmentsByOrganization";
import { listAssessmentsByOrganization } from "@/openapi-client/services.gen";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";
import type {
  AssessmentResponse,
  ApiResponseAssessmentsResponse,
} from "@/openapi-client/types.gen";
import type { Assessment } from "@/types/assessment";
import { CancelablePromise } from "@/openapi-client/core/CancelablePromise";
import { SyncStatus } from "@/types/sync/index";

vi.mock("@/openapi-client/services.gen", () => ({
  listAssessmentsByOrganization: vi.fn(),
}));

vi.mock("@/services/assessments/assessmentRepository", () => ({
  assessmentRepository: {
    deleteByOrganizationId: vi.fn(),
    bulkAdd: vi.fn(),
    getAll: vi.fn(),
    syncAssessments: vi.fn(),
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

  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.mocked(listAssessmentsByOrganization).mockImplementation(
      (params: { organizationId: string }) => {
        if (params.organizationId === "") {
          return new CancelablePromise<ApiResponseAssessmentsResponse>(
            (resolve) => resolve({ data: { assessments: [] }, success: true }),
          );
        }
        return new CancelablePromise<ApiResponseAssessmentsResponse>(
          (resolve) => resolve({ data: { assessments: [] }, success: true }),
        );
      },
    );

    vi.mocked(assessmentRepository.syncAssessments).mockImplementation(
      async (
        fetcher: () => Promise<{
          data?: { assessments?: AssessmentResponse[] };
        }>,
        _filterKey: "organization_id" | "cooperation_id",
        filterId: string,
      ) => {
        if (navigator.onLine) {
          const apiResponse = await fetcher();
          const assessments = apiResponse.data?.assessments || [];

          await vi.mocked(assessmentRepository.deleteByOrganizationId)(
            filterId,
          );
          const formattedAssessments: Assessment[] = assessments.map(
            (item) => ({
              id: item.assessment_id,
              name: item.document_title,
              organization_id: item.organization_id,
              status: item.status,
              created_at: item.created_at,
              updated_at: item.updated_at,
              syncStatus: SyncStatus.SYNCED,
              dimensionIds: item.dimensions_id as string[],
            }),
          );
          await vi.mocked(assessmentRepository.bulkAdd)(formattedAssessments);
          return formattedAssessments;
        } else {
          const localData = await vi.mocked(assessmentRepository.getAll)();
          return localData;
        }
      },
    );
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("should return an empty array if organizationId is missing", async () => {
    const { result } = renderHook(() => useAssessmentsByOrganization(""), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(listAssessmentsByOrganization).toHaveBeenCalledWith({
      organizationId: "",
    });
    expect(assessmentRepository.syncAssessments).toHaveBeenCalledWith(
      expect.any(Function),
      "organization_id",
      "",
    );
    expect(result.current.data).toEqual([]);
  });

  describe("When Online", () => {
    it("should fetch from API, sync to DB, and return formatted data", async () => {
      const mockApiResponse = {
        data: {
          assessments: [
            {
              assessment_id: "assess-01",
              document_title: "Org Assessment Doc",
              organization_id: mockOrgId,
              status: "Completed",
              started_at: "2023-01-01T10:00:00Z",
              completed_at: "2023-01-01T11:00:00Z",
              created_at: "2023-01-01T09:00:00Z",
              updated_at: "2023-01-01T11:00:00Z",
              dimensions_id: ["dim-A"],
            },
          ],
        },
        success: true,
      };

      vi.mocked(listAssessmentsByOrganization).mockResolvedValue(
        new CancelablePromise<ApiResponseAssessmentsResponse>((resolve) =>
          resolve(mockApiResponse),
        ),
      );

      const { result } = renderHook(
        () => useAssessmentsByOrganization(mockOrgId),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const expectedAssessment = {
        id: "assess-01",
        name: "Org Assessment Doc",
        organization_id: mockOrgId,
        status: "Completed",
        created_at: "2023-01-01T09:00:00Z",
        updated_at: "2023-01-01T11:00:00Z",
        syncStatus: SyncStatus.SYNCED,
        dimensionIds: ["dim-A"],
      };

      expect(listAssessmentsByOrganization).toHaveBeenCalledWith({
        organizationId: mockOrgId,
      });
      expect(assessmentRepository.syncAssessments).toHaveBeenCalledWith(
        expect.any(Function),
        "organization_id",
        mockOrgId,
      );
      expect(assessmentRepository.deleteByOrganizationId).toHaveBeenCalledWith(
        mockOrgId,
      );
      expect(assessmentRepository.bulkAdd).toHaveBeenCalledWith(
        expect.arrayContaining([expectedAssessment]),
      );

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data?.[0]?.id).toBe("assess-01");
    });
  });

  describe("When Offline", () => {
    beforeEach(() => {
      vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    });

    it("should bypass API and fetch from local repository", async () => {
      const mockLocalData: Assessment[] = [
        {
          id: "local-1",
          name: "Offline Doc",
          organization_id: mockOrgId,
          status: "Completed",
          created_at: "2023-01-01T09:00:00Z",
          updated_at: "2023-01-01T11:00:00Z",
          syncStatus: SyncStatus.SYNCED,
          dimensionIds: [],
        },
      ];

      vi.mocked(assessmentRepository.getAll).mockResolvedValue(mockLocalData);
      // The generic syncAssessments mock in beforeEach handles the offline logic

      const { result } = renderHook(
        () => useAssessmentsByOrganization(mockOrgId),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Ensure API was NOT called
      expect(listAssessmentsByOrganization).not.toHaveBeenCalled();
      expect(assessmentRepository.syncAssessments).toHaveBeenCalledWith(
        expect.any(Function),
        "organization_id",
        mockOrgId,
      );
      expect(assessmentRepository.getAll).toHaveBeenCalled();

      expect(result.current.data).toEqual(mockLocalData);
    });
  });
});
