import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import {
  BrowserRouter,
  useLocation,
  useNavigate,
  useParams,
  Navigate,
} from "react-router-dom";
import ManageCooperationUsers from "../ManageCooperationUsers";
import "@testing-library/jest-dom";
import { useCooperations } from "@/hooks/cooperations/useCooperations";
import { useAuth } from "@/context/AuthContext";
import { useCooperationId } from "@/hooks/cooperations/useCooperationId";
import { ROLES } from "@/constants/roles";
import { Mock } from "vitest";

// Mock external dependencies
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useLocation: vi.fn(),
    useNavigate: vi.fn(),
    useParams: vi.fn(),
    Navigate: vi.fn(({ to, replace }) => (
      <div
        data-testid="mock-navigate"
        data-to={to}
        data-replace={replace}
      ></div>
    )),
  };
});
vi.mock("@/hooks/cooperations/useCooperations");
vi.mock("@/context/AuthContext");
vi.mock("@/hooks/cooperations/useCooperationId");
vi.mock("@/components/shared/LoadingSpinner", () => ({
  LoadingSpinner: vi.fn(() => (
    <div data-testid="loading-spinner">Loading...</div>
  )),
}));
vi.mock("@/components/second_admin/cooperations/SimpleCooperationCard", () => ({
  SimpleCooperationCard: vi.fn(({ cooperation }) => (
    <div data-testid={`cooperation-card-${cooperation.id}`}>
      {cooperation.name}
    </div>
  )),
}));

// Cast mocked functions to Mock type
const mockUseLocation = useLocation as Mock;
const mockUseNavigate = useNavigate as Mock;
const mockUseParams = useParams as Mock;
const mockUseCooperations = useCooperations as Mock;
const mockUseAuth = useAuth as Mock;
const mockUseCooperationId = useCooperationId as Mock;
const mockNavigateComponent = Navigate as Mock;

const mockCooperationsData = [
  { id: "coop1", name: "Cooperation One", syncStatus: "synced" },
  { id: "coop2", name: "Cooperation Two", syncStatus: "synced" },
];

const renderComponent = () =>
  render(
    <BrowserRouter>
      <ManageCooperationUsers />
    </BrowserRouter>,
  );

describe("ManageCooperationUsers", () => {
  let navigateMock: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    navigateMock = vi.fn();
    mockUseNavigate.mockReturnValue(navigateMock);
    mockUseLocation.mockReturnValue({
      pathname: "/admin/manage-cooperation-users",
      state: {},
    });
    mockUseParams.mockReturnValue({});
    mockUseAuth.mockReturnValue({ user: { roles: [ROLES.ADMIN] } });
    mockUseCooperationId.mockReturnValue(null);
    mockUseCooperations.mockReturnValue({
      data: mockCooperationsData,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders heading and description for super admin", () => {
    renderComponent();
    expect(
      screen.getByText("Select a Cooperation to Manage Users"),
    ).toBeInTheDocument();
  });

  test("shows loading spinner when cooperations data is loading", () => {
    mockUseCooperations.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });
    renderComponent();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  test("shows error message when cooperations data fails to load", () => {
    const errorMessage = "Failed to load cooperations";
    mockUseCooperations.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error(errorMessage),
    });
    renderComponent();
    expect(
      screen.getByText(`An error occurred: ${errorMessage}`),
    ).toBeInTheDocument();
  });

  test("renders cooperation cards for super admin", () => {
    renderComponent();
    expect(screen.getByTestId("cooperation-card-coop1")).toBeInTheDocument();
    expect(screen.getByText("Cooperation One")).toBeInTheDocument();
    expect(screen.getByTestId("cooperation-card-coop2")).toBeInTheDocument();
    expect(screen.getByText("Cooperation Two")).toBeInTheDocument();
  });

  test("redirects coop admin to specific cooperation user management page if cooperationId exists", () => {
    mockUseAuth.mockReturnValue({ user: { roles: [ROLES.COOP_ADMIN] } });
    mockUseCooperationId.mockReturnValue("coop123");
    renderComponent();
    expect(mockNavigateComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "/admin/manage-cooperation-users/coop123",
        replace: true,
      }),
      {},
    );
  });

  test("shows loading spinner for coop admin if cooperationId is null", () => {
    mockUseAuth.mockReturnValue({ user: { roles: [ROLES.COOP_ADMIN] } });
    mockUseCooperationId.mockReturnValue(null);
    renderComponent();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  test("navigates to the correct URL when a cooperation card is clicked", async () => {
    renderComponent();
    const cooperationCard = screen.getByTestId("cooperation-card-coop1");
    // Simulate a click on the Link component
    fireEvent.click(cooperationCard);
    await waitFor(() => {
      expect(window.location.pathname).toBe(
        "/admin/manage-cooperation-users/coop1",
      );
    });
  });
});
