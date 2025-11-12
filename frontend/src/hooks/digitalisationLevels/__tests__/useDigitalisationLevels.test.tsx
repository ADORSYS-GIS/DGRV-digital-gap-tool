import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { digitalisationLevelRepository } from "@/services/digitalisationLevels/digitalisationLevelRepository";
import { useDigitalisationLevels } from "../useDigitalisationLevels";
import { DigitalisationLevel } from "@/types/digitalisationLevel";

// Mock the repository
vi.mock("@/services/digitalisationLevels/digitalisationLevelRepository");

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

const mockLevels: DigitalisationLevel[] = [
  { dimensionId: "1", levelType: "current", state: 1, scope: "test" },
  { dimensionId: "1", levelType: "desired", state: 2, scope: "test" },
];

describe("useDigitalisationLevels", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it("should fetch digitalisation levels successfully", async () => {
    vi.spyOn(
      digitalisationLevelRepository,
      "getByDimensionId",
    ).mockResolvedValue(mockLevels);

    const { result } = renderHook(() => useDigitalisationLevels("1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockLevels);
    expect(
      digitalisationLevelRepository.getByDimensionId,
    ).toHaveBeenCalledTimes(1);
  });

  it("should handle errors when fetching digitalisation levels", async () => {
    const errorMessage = "Failed to fetch levels";
    vi.spyOn(
      digitalisationLevelRepository,
      "getByDimensionId",
    ).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useDigitalisationLevels("1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect((result.current.error as Error).message).toBe(errorMessage);
  });
});
