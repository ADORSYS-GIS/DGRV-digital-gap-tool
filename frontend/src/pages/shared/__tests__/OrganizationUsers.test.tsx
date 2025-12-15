import { render, screen, fireEvent } from "@testing-library/react";
import { useParams } from "react-router-dom";
import OrganizationUsers from "../OrganizationUsers";
import "@testing-library/jest-dom";
import { useOrganizationMembers } from "@/hooks/users/useOrganizationMembers";
import { InviteUserForm } from "@/components/shared/users/InviteUserForm";
import { UserList } from "@/components/shared/users/UserList";
import { Mock } from "vitest";

// Mock external dependencies
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useParams: vi.fn(),
  };
});
vi.mock("@/hooks/users/useOrganizationMembers");
vi.mock("@/components/shared/users/InviteUserForm", () => ({
  InviteUserForm: vi.fn(({ isOpen, onClose, orgId }) => (
    <div data-testid="invite-user-form">
      Invite User Form
      <span data-testid="invite-form-status">{isOpen ? "Open" : "Closed"}</span>
      <button data-testid="invite-form-close-button" onClick={() => onClose()}>
        Close
      </button>
      <span>Org ID: {orgId}</span>
    </div>
  )),
}));
vi.mock("@/components/shared/users/UserList", () => ({
  UserList: vi.fn(() => <div data-testid="user-list">User List</div>),
}));
vi.mock("@/components/shared/LoadingSpinner", () => ({
  LoadingSpinner: vi.fn(() => (
    <div data-testid="loading-spinner">Loading...</div>
  )),
}));

// Cast mocked functions to Mock type
const mockUseParams = useParams as Mock;
const mockUseOrganizationMembers = useOrganizationMembers as Mock;
const mockInviteUserForm = InviteUserForm as Mock;
const mockUserList = UserList as Mock;

const mockMembersData = [
  { id: "user1", email: "user1@example.com", name: "User One" },
  { id: "user2", email: "user2@example.com", name: "User Two" },
];

describe("OrganizationUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ orgId: "org123" });
    mockUseOrganizationMembers.mockReturnValue({
      data: mockMembersData,
      isLoading: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("renders heading", () => {
    render(<OrganizationUsers />);
    expect(screen.getByText("Manage Organization Users")).toBeInTheDocument();
  });

  test("shows loading spinner when data is loading", () => {
    mockUseOrganizationMembers.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });
    render(<OrganizationUsers />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  test("shows error message when there is an error", () => {
    const errorMessage = "Failed to load organization members";
    mockUseOrganizationMembers.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error(errorMessage),
    });
    render(<OrganizationUsers />);
    expect(
      screen.getByText(`An error occurred: ${errorMessage}`),
    ).toBeInTheDocument();
  });

  test("renders InviteUserForm", () => {
    render(<OrganizationUsers />);
    expect(screen.getByTestId("invite-user-form")).toBeInTheDocument();
    expect(mockInviteUserForm).toHaveBeenCalledWith(
      expect.objectContaining({
        isOpen: false,
        orgId: "org123",
      }),
      {},
    );
  });

  test("opens InviteUserForm when 'Invite User' button is clicked", () => {
    render(<OrganizationUsers />);
    fireEvent.click(screen.getByRole("button", { name: /Invite User/i }));
    expect(mockInviteUserForm).toHaveBeenCalledWith(
      expect.objectContaining({
        isOpen: true,
      }),
      {},
    );
  });

  test("closes InviteUserForm when onClose is called", () => {
    render(<OrganizationUsers />);
    fireEvent.click(screen.getByRole("button", { name: /Invite User/i })); // Open it first
    expect(mockInviteUserForm).toHaveBeenCalledWith(
      expect.objectContaining({
        isOpen: true,
      }),
      {},
    );

    // Simulate closing the form
    fireEvent.click(screen.getByTestId("invite-form-close-button"));
    expect(screen.getByTestId("invite-form-status")).toHaveTextContent(
      "Closed",
    );
  });

  test("renders UserList when members data is available", () => {
    render(<OrganizationUsers />);
    expect(screen.getByTestId("user-list")).toBeInTheDocument();
    expect(mockUserList).toHaveBeenCalledWith(
      expect.objectContaining({
        users: mockMembersData,
      }),
      {},
    );
  });
});
