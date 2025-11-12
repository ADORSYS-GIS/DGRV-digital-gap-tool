import { render, screen } from "@/utils/test-utils";
import ManageDimensions from "../ManageDimensions";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, Mock } from "vitest";
import { useDimensions } from "@/hooks/dimensions/useDimensions";

vi.mock("@/hooks/dimensions/useDimensions");

describe("ManageDimensions", () => {
  it("renders the page with the correct title", () => {
    (useDimensions as Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });
    render(<ManageDimensions />);

    expect(screen.getByText("Manage Dimensions")).toBeInTheDocument();
  });
});
