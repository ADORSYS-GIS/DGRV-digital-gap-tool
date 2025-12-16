import { render, screen, fireEvent } from "@/utils/test-utils";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { CooperationCard } from "../CooperationCard";
import { Cooperation } from "@/types/cooperation";

describe("CooperationCard", () => {
  it("renders cooperation information and handles delete", () => {
    const cooperation: Cooperation = {
      id: "coop-1",
      name: "Sample Cooperative",
      description: "A sample cooperative used for testing.",
      domains: [],
    } as Cooperation;

    const handleUpdate = vi.fn();
    const handleDelete = vi.fn();

    render(
      <CooperationCard
        cooperation={cooperation}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /sample cooperative/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/a sample cooperative used for testing\./i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(handleDelete).toHaveBeenCalledWith("coop-1");
  });
});
