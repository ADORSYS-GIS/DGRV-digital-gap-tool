import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ManageDigitalGaps from "../ManageDigitalGaps";
import { useDigitalisationGaps } from "@/hooks/digitalisationGaps/useDigitalisationGaps";

vi.mock("@/hooks/digitalisationGaps/useDigitalisationGaps");

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("ManageDigitalGaps", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page with the correct title", () => {
    (useDigitalisationGaps as vi.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    render(<ManageDigitalGaps />, { wrapper });
    expect(
      screen.getByRole("heading", { name: /manage digitalisation gaps/i }),
    ).toBeInTheDocument();
  });

  it("displays a loading spinner while fetching data", () => {
    (useDigitalisationGaps as vi.Mock).mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });
    render(<ManageDigitalGaps />, { wrapper });
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("displays an error message on failure", async () => {
    const errorMessage = "Failed to fetch digitalisation gaps";
    (useDigitalisationGaps as vi.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error(errorMessage),
    });
    render(<ManageDigitalGaps />, { wrapper });
    await waitFor(() => {
      expect(
        screen.getByText(`An error occurred: ${errorMessage}`),
      ).toBeInTheDocument();
    });
  });

  it("displays the list of digitalisation gaps when the data is loaded", async () => {
    const digitalisationGaps = [
      {
        id: "1",
        dimensionId: "1",
        scope: "Test Scope 1",
        gap_size: 1,
        dimensionName: "Dimension 1",
      },
      {
        id: "2",
        dimensionId: "2",
        scope: "Test Scope 2",
        gap_size: 2,
        dimensionName: "Dimension 2",
      },
    ];
    (useDigitalisationGaps as vi.Mock).mockReturnValue({
      data: digitalisationGaps,
      isLoading: false,
      error: null,
    });
    render(<ManageDigitalGaps />, { wrapper });
    await waitFor(() => {
      expect(screen.getByText("Dimension 1")).toBeInTheDocument();
      expect(screen.getByText("Dimension 2")).toBeInTheDocument();
    });
  });
});
