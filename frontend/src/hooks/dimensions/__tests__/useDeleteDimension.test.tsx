import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useDeleteDimension } from "../useDeleteDimension";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";

vi.mock("@/services/dimensions/dimensionRepository", () => ({
  dimensionRepository: {
    delete: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("useDeleteDimension", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it("should delete a dimension successfully", async () => {
    vi.mocked(dimensionRepository.delete).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteDimension(), { wrapper });

    result.current.mutate("dim-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(dimensionRepository.delete).toHaveBeenCalledWith("dim-1");
  });

  it("should handle errors when deleting a dimension", async () => {
    const errorMessage = "Failed to delete dimension";
    vi.mocked(dimensionRepository.delete).mockRejectedValue(
      new Error(errorMessage),
    );

    const { result } = renderHook(() => useDeleteDimension(), { wrapper });

    result.current.mutate("dim-1");

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe(errorMessage);
  });
});
