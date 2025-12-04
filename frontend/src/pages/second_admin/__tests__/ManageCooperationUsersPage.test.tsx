import { render, screen } from "@testing-library/react";
import ManageCooperationUsersPage from "../ManageCooperationUsersPage";
import "@testing-library/jest-dom";
import { useCooperationUsers } from "@/hooks/cooperationUsers/useCooperationUsers";
import { CooperationUserList } from "@/components/second_admin/cooperationUsers/CooperationUserList";
import { Mock } from "vitest";

// Mock external dependencies
vi.mock("@/hooks/cooperationUsers/useCooperationUsers");
vi.mock("@/components/shared/LoadingSpinner", () => ({
  LoadingSpinner: vi.fn(() => (
    <div data-testid="loading-spinner">Loading...</div>
  )),
}));
vi.mock(
  "@/components/second_admin/cooperationUsers/AddCooperationUserForm",
  () => ({
    AddCooperationUserForm: vi.fn(() => (
      <div data-testid="add-cooperation-user-form">
        Add Cooperation User Form
      </div>
    )),
  }),
);
vi.mock(
  "@/components/second_admin/cooperationUsers/CooperationUserList",
  () => ({
    CooperationUserList: vi.fn(() => (
      <div data-testid="cooperation-user-list">Cooperation User List</div>
    )),
  }),
);

// Cast mocked functions to Mock type
const mockUseCooperationUsers = useCooperationUsers as Mock;

const mockUsersData = [
  { id: "user1", email: "user1@example.com", name: "User One" },
  { id: "user2", email: "user2@example.com", name: "User Two" },
];

describe("ManageCooperationUsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCooperationUsers.mockReturnValue({
      data: mockUsersData,
      isLoading: false,
      error: null,
    });
  });

  test("renders heading", () => {
    render(<ManageCooperationUsersPage />);
    expect(screen.getByText("Manage Cooperation Users")).toBeInTheDocument();
  });

  test("shows loading spinner when data is loading", () => {
    mockUseCooperationUsers.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });
    render(<ManageCooperationUsersPage />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  test("shows error message when there is an error", () => {
    const errorMessage = "Failed to load cooperation users";
    mockUseCooperationUsers.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error(errorMessage),
    });
    render(<ManageCooperationUsersPage />);
    expect(
      screen.getByText(`An error occurred: ${errorMessage}`),
    ).toBeInTheDocument();
  });

  test("renders AddCooperationUserForm", () => {
    render(<ManageCooperationUsersPage />);
    expect(screen.getByTestId("add-cooperation-user-form")).toBeInTheDocument();
  });

  test("renders CooperationUserList when data is available", () => {
    render(<ManageCooperationUsersPage />);
    expect(screen.getByTestId("cooperation-user-list")).toBeInTheDocument();
  });

  test("CooperationUserList receives users data", () => {
    render(<ManageCooperationUsersPage />);
    expect(CooperationUserList).toHaveBeenCalledWith(
      expect.objectContaining({
        users: mockUsersData,
      }),
      {},
    );
  });
});
