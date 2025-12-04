import { render, screen, fireEvent } from "@testing-library/react";
import ManageAssessments from "../ManageAssessments";
import "@testing-library/jest-dom";
import { useAssessmentsByOrganization } from "@/hooks/assessments/useAssessmentsByOrganization";
import { useAssessmentsByCooperation } from "@/hooks/assessments/useAssessmentsByCooperation";
import { useAuth } from "@/context/AuthContext";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import { ROLES } from "@/constants/roles";
import { AddAssessmentForm } from "@/components/shared/assessments/AddAssessmentForm";
import { AssessmentList } from "@/components/shared/assessments/AssessmentList";
import { Mock } from "vitest";

// Mock external dependencies
vi.mock("@/hooks/assessments/useAssessmentsByOrganization");
vi.mock("@/hooks/assessments/useAssessmentsByCooperation");
vi.mock("@/context/AuthContext");
vi.mock("@/hooks/organizations/useOrganizationId");
vi.mock("@/hooks/cooperations/useCooperationId");
vi.mock("@/components/shared/LoadingSpinner", () => ({
  LoadingSpinner: vi.fn(() => (
    <div data-testid="loading-spinner">Loading...</div>
  )),
}));
vi.mock("@/components/shared/assessments/AddAssessmentForm", () => ({
  AddAssessmentForm: vi.fn(({ isOpen, onClose }) => (
    <div data-testid="add-assessment-form">
      Add Assessment Form
      <span data-testid="add-form-status">{isOpen ? "Open" : "Closed"}</span>
      <button data-testid="add-form-close-button" onClick={() => onClose()}>
        Close
      </button>
    </div>
  )),
}));
vi.mock("@/components/shared/assessments/AssessmentList", () => ({
  AssessmentList: vi.fn(() => (
    <div data-testid="assessment-list">Assessment List</div>
  )),
}));

// Cast mocked functions to Mock type
const mockUseAssessmentsByOrganization = useAssessmentsByOrganization as Mock;
const mockUseAssessmentsByCooperation = useAssessmentsByCooperation as Mock;
const mockUseAuth = useAuth as Mock;
const mockUseOrganizationId = useOrganizationId as Mock;
const mockUseCooperationId = useCooperationId as Mock;
const mockAddAssessmentForm = AddAssessmentForm as Mock;
const mockAssessmentList = AssessmentList as Mock;

const mockOrgAssessments = [{ id: "orgAssess1", name: "Org Assessment 1" }];
const mockCoopAssessments = [{ id: "coopAssess1", name: "Coop Assessment 1" }];

describe("ManageAssessments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { roles: [ROLES.ADMIN] } }); // Default to Org Admin
    mockUseOrganizationId.mockReturnValue("org123");
    mockUseCooperationId.mockReturnValue(null);
    mockUseAssessmentsByOrganization.mockReturnValue({
      data: mockOrgAssessments,
      isLoading: false,
      error: null,
    });
    mockUseAssessmentsByCooperation.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      isFetching: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders heading", () => {
    render(<ManageAssessments />);
    expect(screen.getByText("Manage Assessments")).toBeInTheDocument();
  });

  test("shows loading spinner when org assessments are loading", () => {
    mockUseAssessmentsByOrganization.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });
    render(<ManageAssessments />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  test("shows loading spinner when coop assessments are loading", () => {
    mockUseAuth.mockReturnValue({ user: { roles: [ROLES.COOP_USER] } });
    mockUseCooperationId.mockReturnValue("coop123");
    mockUseAssessmentsByCooperation.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
      isFetching: true,
    });
    render(<ManageAssessments />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  test("shows error message when org assessments fail to load", () => {
    const errorMessage = "Failed to load org assessments";
    mockUseAssessmentsByOrganization.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error(errorMessage),
    });
    render(<ManageAssessments />);
    expect(
      screen.getByText(`An error occurred: ${errorMessage}`),
    ).toBeInTheDocument();
  });

  test("shows error message when coop assessments fail to load", () => {
    const errorMessage = "Failed to load coop assessments";
    mockUseAuth.mockReturnValue({ user: { roles: [ROLES.COOP_USER] } });
    mockUseCooperationId.mockReturnValue("coop123");
    mockUseAssessmentsByCooperation.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error(errorMessage),
      isFetching: false,
    });
    render(<ManageAssessments />);
    expect(
      screen.getByText(`An error occurred: ${errorMessage}`),
    ).toBeInTheDocument();
  });

  test("renders Add Assessment button for Org Admin", () => {
    mockUseAuth.mockReturnValue({ user: { roles: [ROLES.ORG_ADMIN] } });
    render(<ManageAssessments />);
    expect(
      screen.getByRole("button", { name: /Add Assessment/i }),
    ).toBeInTheDocument();
  });

  test("does not render Add Assessment button for Coop User", () => {
    mockUseAuth.mockReturnValue({ user: { roles: [ROLES.COOP_USER] } });
    mockUseCooperationId.mockReturnValue("coop123");
    render(<ManageAssessments />);
    expect(
      screen.queryByRole("button", { name: /Add Assessment/i }),
    ).not.toBeInTheDocument();
  });

  test("opens AddAssessmentForm when 'Add Assessment' button is clicked", () => {
    mockUseAuth.mockReturnValue({ user: { roles: [ROLES.ORG_ADMIN] } });
    render(<ManageAssessments />);
    fireEvent.click(screen.getByRole("button", { name: /Add Assessment/i }));
    expect(mockAddAssessmentForm).toHaveBeenCalledWith(
      expect.objectContaining({
        isOpen: true,
      }),
      {},
    );
  });

  test("closes AddAssessmentForm when onClose is called", () => {
    mockUseAuth.mockReturnValue({ user: { roles: [ROLES.ORG_ADMIN] } });
    render(<ManageAssessments />);
    fireEvent.click(screen.getByRole("button", { name: /Add Assessment/i })); // Open it first
    expect(screen.getByTestId("add-form-status")).toHaveTextContent("Open");

    fireEvent.click(screen.getByTestId("add-form-close-button"));
    expect(screen.getByTestId("add-form-status")).toHaveTextContent("Closed");
  });

  test("renders AssessmentList for Org Admin", () => {
    mockUseAuth.mockReturnValue({ user: { roles: [ROLES.ORG_ADMIN] } });
    render(<ManageAssessments />);
    expect(screen.getByTestId("assessment-list")).toBeInTheDocument();
    expect(mockAssessmentList).toHaveBeenCalledWith(
      expect.objectContaining({
        assessments: mockOrgAssessments,
        userRoles: [ROLES.ORG_ADMIN.toLowerCase()],
      }),
      {},
    );
  });

  test("renders AssessmentList for Coop User", () => {
    mockUseAuth.mockReturnValue({ user: { roles: [ROLES.COOP_USER] } });
    mockUseCooperationId.mockReturnValue("coop123");
    mockUseAssessmentsByCooperation.mockReturnValue({
      data: mockCoopAssessments,
      isLoading: false,
      error: null,
      isFetching: false,
    });
    render(<ManageAssessments />);
    expect(screen.getByTestId("assessment-list")).toBeInTheDocument();
    expect(mockAssessmentList).toHaveBeenCalledWith(
      expect.objectContaining({
        assessments: mockCoopAssessments,
        userRoles: [ROLES.COOP_USER.toLowerCase()],
      }),
      {},
    );
  });

  test("useAssessmentsByOrganization is called for Org Admin", () => {
    mockUseAuth.mockReturnValue({ user: { roles: [ROLES.ORG_ADMIN] } });
    render(<ManageAssessments />);
    expect(mockUseAssessmentsByOrganization).toHaveBeenCalledWith("org123", {
      enabled: true,
    });
    expect(mockUseAssessmentsByCooperation).toHaveBeenCalledWith(
      expect.any(String),
      {
        enabled: false,
      },
    );
  });

  test("useAssessmentsByCooperation is called for Coop User", () => {
    mockUseAuth.mockReturnValue({ user: { roles: [ROLES.COOP_USER] } });
    mockUseCooperationId.mockReturnValue("coop123");
    render(<ManageAssessments />);
    expect(mockUseAssessmentsByOrganization).toHaveBeenCalledWith(
      expect.any(String),
      {
        enabled: false,
      },
    );
    expect(mockUseAssessmentsByCooperation).toHaveBeenCalledWith("coop123", {
      enabled: true,
    });
  });
});
