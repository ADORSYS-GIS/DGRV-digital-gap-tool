import { vi, type Mock } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDimension } from "../useDimension";
import { dimensionRepository } from "@/services/dimensions/dimensionRepository";
import { IDimension } from "@/types/dimension";
import { SyncStatus } from "@/types/sync";

vi.mock("@/services/dimensions/dimensionRepository", () => ({
  dimensionRepository: {
    getById: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useDimension", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return undefined if no id is provided", async () => {
    const { result } = renderHook(() => useDimension(""), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(false));
    expect(result.current.data).toBeUndefined();
    expect(dimensionRepository.getById).not.toHaveBeenCalled();
  });

  it("should fetch dimension by id", async () => {
    const mockDimension: IDimension = {
      id: "dim-1",
      name: "Test Dimension",
      syncStatus: SyncStatus.SYNCED,
    };
    (dimensionRepository.getById as Mock).mockResolvedValue(mockDimension);

    const { result } = renderHook(() => useDimension("dim-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockDimension);
    expect(dimensionRepository.getById).toHaveBeenCalledWith("dim-1");
  });

  it("should handle error when fetching dimension", async () => {
    (dimensionRepository.getById as Mock).mockRejectedValue(
      new Error("Failed to fetch"),
    );

    const { result } = renderHook(() => useDimension("dim-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(Error("Failed to fetch"));
  });
});
