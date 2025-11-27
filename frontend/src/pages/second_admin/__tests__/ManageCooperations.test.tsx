import { render, screen, fireEvent } from "@testing-library/react";
import ManageCooperations from "../ManageCooperations";
import "@testing-library/jest-dom";
import { useCooperations } from "@/hooks/cooperations/useCooperations";
import { useAddCooperation } from "@/hooks/cooperations/useAddCooperation";
import { useUpdateCooperation } from "@/hooks/cooperations/useUpdateCooperation";
import { useDeleteCooperation } from "@/hooks/cooperations/useDeleteCooperation";
import { useOrganizationId } from "@/hooks/organizations/useOrganizationId";
import { cooperationSyncService } from "@/services/sync/cooperationSyncService";
import { CooperationList } from "@/components/second_admin/cooperations/CooperationList";
import { Mock } from "vitest";

// Mock external dependencies
vi.mock("@/hooks/cooperations/useCooperations");
vi.mock("@/hooks/cooperations/useAddCooperation");
vi.mock("@/hooks/cooperations/useUpdateCooperation");
vi.mock("@/hooks/cooperations/useDeleteCooperation");
vi.mock("@/hooks/organizations/useOrganizationId");
vi.mock("@/services/sync/cooperationSyncService", () => ({
  cooperationSyncService: {
    sync: vi.fn(),
  },
}));
vi.mock("@/components/second_admin/cooperations/AddCooperationForm", () => ({
  AddCooperationForm: vi.fn(({ onAdd }) => (
    <button
      data-testid="add-cooperation-button"
      onClick={() => onAdd({ name: "New Coop" })}
    >
      Add Cooperation
    </button>
  )),
}));
vi.mock("@/components/second_admin/cooperations/CooperationList", () => ({
  CooperationList: vi.fn(() => (
    <div data-testid="cooperation-list">Cooperation List</div>
  )),
}));
vi.mock("@/components/shared/LoadingSpinner", () => ({
  LoadingSpinner: vi.fn(() => (
    <div data-testid="loading-spinner">Loading...</div>
  )),
}));

// Cast mocked functions to Mock type
const mockUseCooperations = useCooperations as Mock;
const mockUseAddCooperation = useAddCooperation as Mock;
const mockUseUpdateCooperation = useUpdateCooperation as Mock;
const mockUseDeleteCooperation = useDeleteCooperation as Mock;
const mockUseOrganizationId = useOrganizationId as Mock;
const mockCooperationSyncService = cooperationSyncService.sync as Mock;

const mockCooperationsData = [
  { id: "1", name: "Cooperation A", syncStatus: "synced" },
  { id: "2", name: "Cooperation B", syncStatus: "pending" },
];

describe("ManageCooperations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseOrganizationId.mockReturnValue("org123");
    mockUseCooperations.mockReturnValue({
      data: mockCooperationsData,
      isLoading: false,
      error: null,
    });
    mockUseAddCooperation.mockReturnValue({ mutate: vi.fn() });
    mockUseUpdateCooperation.mockReturnValue({ mutate: vi.fn() });
    mockUseDeleteCooperation.mockReturnValue({ mutate: vi.fn() });
    mockCooperationSyncService.mockClear(); // Clear mock calls for the sync method
  });

  test("renders heading and description", () => {
    render(<ManageCooperations />);
    expect(screen.getByText("Manage Cooperations")).toBeInTheDocument();
    expect(
      screen.getByText("Add and manage cooperative profiles and data"),
    ).toBeInTheDocument();
  });

  test("shows loading spinner when data is loading", () => {
    mockUseCooperations.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });
    render(<ManageCooperations />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  test("shows error message when there is an error", () => {
    const errorMessage = "Failed to load cooperations";
    mockUseCooperations.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error(errorMessage),
    });
    render(<ManageCooperations />);
    expect(
      screen.getByText(`An error occurred: ${errorMessage}`),
    ).toBeInTheDocument();
  });

  test("renders CooperationList when data is available", () => {
    render(<ManageCooperations />);
    expect(screen.getByTestId("cooperation-list")).toBeInTheDocument();
  });

  test("calls addCooperation when AddCooperationForm submits", () => {
    const mockAddMutate = vi.fn();
    mockUseAddCooperation.mockReturnValue({ mutate: mockAddMutate });
    render(<ManageCooperations />);
    fireEvent.click(screen.getByTestId("add-cooperation-button"));
    expect(mockAddMutate).toHaveBeenCalledWith({ name: "New Coop" });
  });

  test("calls updateCooperation when CooperationList onUpdate is triggered", () => {
    const mockUpdateMutate = vi.fn();
    mockUseUpdateCooperation.mockReturnValue({ mutate: mockUpdateMutate });
    // Since CooperationList is mocked, we need to manually call its onUpdate prop
    const CooperationListMock = CooperationList as Mock;
    CooperationListMock.mockImplementationOnce(({ onUpdate }) => (
      <button
        data-testid="update-cooperation-button"
        onClick={() =>
          onUpdate({ id: "1", name: "Updated Coop", syncStatus: "synced" })
        }
      >
        Update Cooperation
      </button>
    ));
    render(<ManageCooperations />);
    fireEvent.click(screen.getByTestId("update-cooperation-button"));
    expect(mockUpdateMutate).toHaveBeenCalledWith({
      id: "1",
      name: "Updated Coop",
      syncStatus: "synced",
    });
  });

  test("calls deleteCooperation when CooperationList onDelete is triggered", () => {
    const mockDeleteMutate = vi.fn();
    mockUseDeleteCooperation.mockReturnValue({ mutate: mockDeleteMutate });
    // Since CooperationList is mocked, we need to manually call its onDelete prop
    const CooperationListMock = CooperationList as Mock;
    CooperationListMock.mockImplementationOnce(({ onDelete }) => (
      <button
        data-testid="delete-cooperation-button"
        onClick={() => onDelete("1")}
      >
        Delete Cooperation
      </button>
    ));
    render(<ManageCooperations />);
    fireEvent.click(screen.getByTestId("delete-cooperation-button"));
    expect(mockDeleteMutate).toHaveBeenCalledWith("1");
  });

  test("cooperationSyncService.sync is called on mount if organizationId exists", () => {
    render(<ManageCooperations />);
    expect(mockCooperationSyncService).toHaveBeenCalledWith("org123");
  });

  test("cooperationSyncService.sync is not called on mount if organizationId is null", () => {
    mockUseOrganizationId.mockReturnValue(null);
    render(<ManageCooperations />);
    expect(mockCooperationSyncService).not.toHaveBeenCalled();
  });
});
