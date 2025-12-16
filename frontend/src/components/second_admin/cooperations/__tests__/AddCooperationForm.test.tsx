import { render, screen, fireEvent } from "@/utils/test-utils";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { AddCooperationForm } from "../AddCooperationForm";
import { useAddCooperation } from "@/hooks/cooperations/useAddCooperation";

vi.mock("@/hooks/cooperations/useAddCooperation", () => ({
  useAddCooperation: vi.fn(),
}));

describe("AddCooperationForm", () => {
  it("renders the dialog and submits data correctly", () => {
    const mutate = vi.fn();
    (useAddCooperation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate,
      isPending: false,
    });

    render(<AddCooperationForm />);

    fireEvent.click(screen.getByRole("button", { name: /add cooperative/i }));

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Test Cooperative" },
    });

    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "A cooperative for testing." },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /create cooperative/i }),
    );

    expect(mutate).toHaveBeenCalledWith({
      name: "Test Cooperative",
      description: "A cooperative for testing.",
      domains: [],
    });
  });
});
