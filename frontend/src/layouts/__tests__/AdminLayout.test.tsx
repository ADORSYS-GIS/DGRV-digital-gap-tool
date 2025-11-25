/// <reference types="vitest/globals" />
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import { vi } from "vitest";

// Define mock functions at the top level
const mockUseLocation = vi.fn();
const mockOutlet = vi.fn(() => <div data-testid="outlet" />);

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useLocation: mockUseLocation,
    Outlet: mockOutlet,
  };
});

describe("AdminLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocation.mockClear(); // Clear mocks for useLocation
    mockOutlet.mockClear(); // Clear mocks for Outlet

    mockUseLocation.mockReturnValue({
      pathname: "/admin/dashboard",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });
  });

  const renderWithRouter = (ui: React.ReactElement, { route = "/" } = {}) => {
    window.history.pushState({}, "Test page", route);
    return render(ui, { wrapper: BrowserRouter });
  };

  it("should render the admin panel title when sidebar is open", () => {
    renderWithRouter(<AdminLayout />);
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
  });

  it("should toggle sidebar visibility when the button is clicked", () => {
    renderWithRouter(<AdminLayout />);
    const toggleButton = screen.getByRole("button");

    // Initially open
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();

    fireEvent.click(toggleButton);
    // Should be closed
    expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument();

    fireEvent.click(toggleButton);
    // Should be open again
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
  });

  it("should render navigation links", () => {
    renderWithRouter(<AdminLayout />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Organizations")).toBeInTheDocument();
    expect(screen.getByText("Dimensions")).toBeInTheDocument();
    expect(screen.getByText("Recommendations")).toBeInTheDocument();
    expect(screen.getByText("Action Plan")).toBeInTheDocument();
    expect(screen.getByText("Digital Gaps")).toBeInTheDocument();
    expect(screen.getByText("Manage Users")).toBeInTheDocument();
    expect(screen.getByText("View Reports")).toBeInTheDocument();
  });

  it("should highlight the active navigation link based on the current path", () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <AdminLayout />
      </MemoryRouter>
    );

    expect(screen.getByText("Dashboard")).toHaveClass("bg-gray-900");
    expect(screen.getByText("Organizations")).not.toHaveClass("bg-gray-900");

    rerender(
      <MemoryRouter initialEntries={["/admin/organizations"]}>
        <AdminLayout />
      </MemoryRouter>
    );

    expect(screen.getByText("Organizations")).toHaveClass("bg-gray-900");
    expect(screen.getByText("Dashboard")).not.toHaveClass("bg-gray-900");
  });

  it("should render the Outlet component", () => {
    renderWithRouter(<AdminLayout />);
    expect(screen.getByTestId("outlet")).toBeInTheDocument();
  });
});