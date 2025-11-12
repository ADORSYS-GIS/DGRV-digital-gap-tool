import { render, screen } from "@/utils/test-utils";
import ManageDigitalisationLevels from "../ManageDigitalisationLevels";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, Mock } from "vitest";
import { useDigitalisationLevels } from "@/hooks/digitalisationLevels/useDigitalisationLevels";

vi.mock("@/hooks/digitalisationLevels/useDigitalisationLevels");
vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual("react-router-dom")),
  useParams: () => ({
    dimensionId: "1",
  }),
  useSearchParams: () => [new URLSearchParams({ levelType: "current" })],
}));

describe("ManageDigitalisationLevels", () => {
  it("renders the page with the correct title", () => {
    (useDigitalisationLevels as Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    render(<ManageDigitalisationLevels />);

    expect(screen.getByText("Manage Current State")).toBeInTheDocument();
  });
});
