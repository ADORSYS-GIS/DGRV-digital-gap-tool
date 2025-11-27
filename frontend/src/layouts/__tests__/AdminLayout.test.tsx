/// <reference types="vitest/globals" />
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import AdminLayout from "../AdminLayout";
import { vi } from "vitest";

const { mockUseLocation, mockOutlet } = vi.hoisted(() => {
  const mockUseLocation = vi.fn(() => ({
    pathname: "/admin/dashboard", // Default pathname
    search: "",
    hash: "",
    state: null,
    key: "default",
  }));
  const mockOutlet = vi.fn(() => <div data-testid="outlet" />);
  return { mockUseLocation, mockOutlet };
});

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
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
    // Set mockUseLocation for the initial render
    mockUseLocation.mockReturnValue({
      pathname: "/admin/dashboard",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });

    const { rerender } = render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <AdminLayout />
      </MemoryRouter>,
    );

    const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
    console.log("Dashboard Link classes (initial):", dashboardLink.className);
    expect(dashboardLink).toHaveClass("bg-gray-900");
    expect(screen.getByRole("link", { name: "Organizations" })).not.toHaveClass(
      "bg-gray-900",
    );

    // Set mockUseLocation for the rerender
    mockUseLocation.mockReturnValue({
      pathname: "/admin/organizations",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });

    rerender(
      <MemoryRouter initialEntries={["/admin/organizations"]}>
        <AdminLayout />
      </MemoryRouter>,
    );

    const organizationsLink = screen.getByRole("link", {
      name: "Organizations",
    });
    console.log(
      "Organizations Link classes (rerender):",
      organizationsLink.className,
    );
    expect(organizationsLink).toHaveClass("bg-gray-900");
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveClass(
      "bg-gray-900",
    );
  });

  it("should render the Outlet component", () => {
    renderWithRouter(<AdminLayout />);
    expect(screen.getByTestId("outlet")).toBeInTheDocument();
  });
});
