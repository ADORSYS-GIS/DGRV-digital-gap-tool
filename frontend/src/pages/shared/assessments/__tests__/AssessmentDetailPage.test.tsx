import { render, screen } from "@/utils/test-utils";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import AssessmentDetailPage from "../AssessmentDetailPage";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useDimensionAssessments } from "@/hooks/assessments/useDimensionAssessments";
import { assessmentRepository } from "@/services/assessments/assessmentRepository";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useParams: vi.fn(),
    useLocation: vi.fn(),
    useNavigate: vi.fn(),
  };
});

vi.mock("@/hooks/assessments/useDimensionAssessments", () => ({
  useDimensionAssessments: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/hooks/cooperations/useCooperationIdFromPath", () => ({
  useCooperationIdFromPath: () => ({
    cooperationId: "c1",
    isLoading: false,
    error: null,
  }),
}));

vi.mock("@/hooks/cooperationUsers/useCooperationUsersForAdmin", () => ({
  useCooperationUsersForAdmin: () => ({
    data: [],
    isLoading: false,
  }),
}));

vi.mock("@/hooks/submissions/useSubmitAssessment", () => ({
  useSubmitAssessment: () => ({
    mutateAsync: vi.fn(),
  }),
}));

vi.mock("@/context/AuthContext", () => ({
  AuthContext: {
    Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Consumer: ({ children }: { children: any }) => children({}),
  },
  useAuth: () => ({
    user: {
      roles: [],
      assigned_dimensions: [],
    },
  }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: {
      roles: [],
      assigned_dimensions: [],
    },
  }),
}));

vi.mock("@/services/assessments/assessmentRepository", () => ({
  assessmentRepository: {
    getById: vi.fn(),
  },
}));

vi.mock("@/services/dimensions/dimensionRepository", () => ({
  dimensionRepository: {
    getByIds: vi.fn(),
  },
}));

const mockedUseParams = useParams as unknown as ReturnType<typeof vi.fn>;
const mockedUseLocation = useLocation as unknown as ReturnType<typeof vi.fn>;
const mockedUseNavigate = useNavigate as unknown as ReturnType<typeof vi.fn>;
const mockedUseDimensionAssessments =
  useDimensionAssessments as unknown as ReturnType<typeof vi.fn>;

const mockedGetAssessmentById =
  assessmentRepository.getById as unknown as ReturnType<typeof vi.fn>;
const mockedGetDimensionsByIds =
  dimensionRepository.getByIds as unknown as ReturnType<typeof vi.fn>;

describe("AssessmentDetailPage", () => {
  it("renders progress header and dimension cards", async () => {
    mockedUseParams.mockReturnValue({ assessmentId: "a1" });
    mockedUseLocation.mockReturnValue({ pathname: "/org/assessment/a1" });
    mockedUseNavigate.mockReturnValue(vi.fn());

    mockedGetAssessmentById.mockResolvedValue({
      id: "a1",
      name: "Test Assessment",
      dimensionIds: ["d1"],
    });

    mockedGetDimensionsByIds.mockResolvedValue([
      { id: "d1", name: "Dimension One", description: "Desc" },
    ]);

    mockedUseDimensionAssessments.mockReturnValue({ data: [] });

    render(<AssessmentDetailPage />);

    expect(
      await screen.findByText(/sharedAssessments.detail.digitalGapAssessment/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/dimension one/i)).toBeInTheDocument();
  });
});
