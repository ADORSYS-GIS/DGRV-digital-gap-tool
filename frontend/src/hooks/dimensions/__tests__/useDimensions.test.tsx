import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";
import { useDimensions } from "../useDimensions";
import { Dimension } from "@/types/dimension";

// Mock the repository
vi.mock("@/services/dimensions/dimensionRepository");

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

const mockDimensions: Dimension[] = [
  {
    id: "1",
    name: "Dimension 1",
    description: "Description 1",
    syncStatus: "synced",
  },
  {
    id: "2",
    name: "Dimension 2",
    description: "Description 2",
    syncStatus: "synced",
  },
];

describe("useDimensions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it("should fetch dimensions successfully", async () => {
    vi.spyOn(dimensionRepository, "getAll").mockResolvedValue(mockDimensions);

    const { result } = renderHook(() => useDimensions(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockDimensions);
    expect(dimensionRepository.getAll).toHaveBeenCalledTimes(1);
  });

  it("should handle errors when fetching dimensions", async () => {
    const errorMessage = "Failed to fetch dimensions";
    vi.spyOn(dimensionRepository, "getAll").mockRejectedValue(
      new Error(errorMessage),
    );

    const { result } = renderHook(() => useDimensions(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe(errorMessage);
  });
});
