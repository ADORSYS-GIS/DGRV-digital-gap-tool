import { render, screen, fireEvent } from "@/utils/test-utils";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { AddCooperationUserForm } from "../AddCooperationUserForm";
import { useAddCooperationUser } from "@/hooks/cooperationUsers/useAddCooperationUser";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "react-router-dom";

vi.mock("@/hooks/cooperationUsers/useAddCooperationUser", () => ({
  useAddCooperationUser: vi.fn(),
}));
vi.mock("@/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

const mockedUseAddCooperationUser =
  useAddCooperationUser as unknown as ReturnType<typeof vi.fn>;
const mockedUseAuth = useAuth as unknown as ReturnType<typeof vi.fn>;
const mockedUseParams = useParams as unknown as ReturnType<typeof vi.fn>;

describe("AddCooperationUserForm", () => {
  it("submits a new user invite", () => {
    const mutate = vi.fn();
    mockedUseAddCooperationUser.mockReturnValue({ mutate, isPending: false });
    mockedUseAuth.mockReturnValue({
      user: { roles: ["org_admin"] },
    });
    mockedUseParams.mockReturnValue({ cooperationId: "coop-1" });

    render(<AddCooperationUserForm />);

    fireEvent.click(screen.getByRole("button", { name: /add user/i }));

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.org" },
    });
    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "User" },
    });

    fireEvent.click(screen.getByRole("button", { name: /send invitation/i }));

    expect(mutate).toHaveBeenCalledWith(
      {
        user: {
          email: "test@example.org",
          firstName: "Test",
          lastName: "User",
          roles: ["coop_admin"],
        },
        cooperationId: "coop-1",
      },
      expect.any(Object),
    );
  });
});
