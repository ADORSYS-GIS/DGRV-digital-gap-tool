import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import ManageUsers from "../ManageUsers";
import "@testing-library/jest-dom";
import { useOrganizations } from "@/hooks/organizations/useOrganizations";
import { Mock } from "vitest";

// Mock external dependencies
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useLocation: vi.fn(),
    useNavigate: vi.fn(),
    Link: vi.fn(({ to, children }) => (
      <div
        data-testid={`mock-link-${to}`}
        onClick={() => mockUseNavigate(to as string)}
      >
        {children}
      </div>
    )),
  };
});
vi.mock("@/hooks/organizations/useOrganizations");
vi.mock("@/components/shared/LoadingSpinner", () => ({
  LoadingSpinner: vi.fn(() => (
    <div data-testid="loading-spinner">Loading...</div>
  )),
}));
vi.mock("@/components/shared/organizations/SimpleOrganizationCard", () => ({
  SimpleOrganizationCard: vi.fn(({ organization }) => (
    <div data-testid={`organization-card-${organization.id}`}>
      {organization.name}
    </div>
  )),
}));

// Cast mocked functions to Mock type
const mockUseLocation = useLocation as Mock;
const mockUseNavigate = useNavigate as Mock;
const mockUseOrganizations = useOrganizations as Mock;

const mockOrganizationsData = [
  { id: "org1", name: "Organization A" },
  { id: "org2", name: "Organization B" },
];

const renderComponent = () =>
  render(
    <BrowserRouter>
      <ManageUsers />
    </BrowserRouter>,
  );

describe("ManageUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocation.mockReturnValue({
      pathname: "/admin/manage-users",
      state: {},
    });
    mockUseNavigate.mockReturnValue(vi.fn());
    mockUseOrganizations.mockReturnValue({
      data: mockOrganizationsData,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders heading", () => {
    renderComponent();
    expect(
      screen.getByText("Select an Organization to Manage Users"),
    ).toBeInTheDocument();
  });

  test("shows loading spinner when data is loading", () => {
    mockUseOrganizations.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });
    renderComponent();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  test("shows error message when there is an error", () => {
    const errorMessage = "Failed to load organizations";
    mockUseOrganizations.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error(errorMessage),
    });
    renderComponent();
    expect(
      screen.getByText(`An error occurred: ${errorMessage}`),
    ).toBeInTheDocument();
  });

  test("renders organization cards when data is available", () => {
    renderComponent();
    expect(screen.getByTestId("organization-card-org1")).toBeInTheDocument();
    expect(screen.getByText("Organization A")).toBeInTheDocument();
    expect(screen.getByTestId("organization-card-org2")).toBeInTheDocument();
    expect(screen.getByText("Organization B")).toBeInTheDocument();
  });

  test("navigates to the correct URL when an organization card is clicked", () => {
    renderComponent();
    const linkElement = screen.getByTestId(
      "mock-link-/admin/manage-users/org1",
    );
    fireEvent.click(linkElement);
    expect(mockUseNavigate).toHaveBeenCalledWith("/admin/manage-users/org1");
  });
});
